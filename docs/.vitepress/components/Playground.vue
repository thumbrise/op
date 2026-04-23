<script setup lang="ts">
import {ref, computed, watch, onMounted, onBeforeUnmount} from 'vue'
import JsonEditor from './playground/JsonEditor.vue'
import {validateJson, domainError, type PlaygroundError} from './playground/jsonValidation'
import {usePlaygroundHistory} from './playground/usePlaygroundHistory'
import {demoOperations, emptyOperation as emptyOp, type Operation, type Term} from './playground/demoOperations'

// ── History / persistence ──────────────────────────────
interface Snapshot {
  operations: Operation[]
  activeIndex: number
}

// Bump `v1 → v2` when the Snapshot shape changes. Old buffers stay on the old
// key (dead weight), new ones land in the new key. Users lose history but
// the page works. Cheap version negotiation via the storage key itself.
const history = usePlaygroundHistory<Snapshot>({
  storageKey: 'op:playground:v2',
  maxEntries: 50,
  debounceMs: 500,
})

/**
 * Normalize a Term recursively — every level gets sane defaults. Missing
 * fields stay undefined (they are all optional except id), arrays get reset
 * to [] if they come back as anything else.
 */
function normalizeTerm(raw: any): Term {
  const t: Term = {id: typeof raw?.id === 'string' ? raw.id : ''}
  if (typeof raw?.comment === 'string') t.comment = raw.comment
  if (typeof raw?.required === 'boolean') t.required = raw.required
  if (typeof raw?.kind === 'string') t.kind = raw.kind
  if (raw?.value !== undefined && raw?.value !== null) t.value = raw.value
  if (Array.isArray(raw?.of)) t.of = raw.of.map(normalizeTerm)
  return t
}

/**
 * Normalize anything loosely shaped like an operation to the current form.
 * Handles:
 *   - missing rails (undefined → empty array so `v-for` doesn't crash)
 *   - legacy field names from pre-devlog-018 buffers (`errors`, `traits`)
 *   - raw JSON imports where some fields were omitted
 *   - corrupted Term trees deep inside rails (each term goes through normalizeTerm)
 * The storageKey bump above is the primary defence; this is a belt-and-braces
 * guard against corrupted/hand-edited localStorage.
 */
function normalizeOperation(raw: any): Operation {
  const normalizeRail = (v: any): Term[] => (Array.isArray(v) ? v.map(normalizeTerm) : [])
  return {
    id: typeof raw?.id === 'string' ? raw.id : '',
    comment: typeof raw?.comment === 'string' ? raw.comment : '',
    input: normalizeRail(raw?.input),
    output: normalizeRail(raw?.output),
    error: normalizeRail(raw?.error ?? raw?.errors),
    trait: normalizeRail(raw?.trait ?? raw?.traits),
  }
}

// ── State ──────────────────────────────────────────────
// Seed: either the last state from a previous session, or the demo fixture.
// Deep clone is critical — otherwise `operations.value` shares the same object
// as `history.entries[cursor].operations`. Every form edit would mutate both,
// the dedup check `equals(head, state)` would always return true, and no new
// snapshot would ever be recorded (only JSON-editor commits via `operations.value =`
// would break the shared reference and land in the buffer).
// Hydrate from storage inside try/catch — a silent throw here leaves the
// whole component unmounted (white screen with no console error). Falling
// back to the demo fixture is safer than crashing.
let seed: Snapshot
try {
  const storedSeed = history.current.value
  // normalizeOperation creates fresh objects (it rebuilds each term), so the
  // resulting `seed.operations` is a new tree disconnected from the one
  // stored inside history.entries. Subsequent form edits mutate seed only;
  // the history buffer stays immutable.
  seed = storedSeed
    ? {
        operations: storedSeed.operations.map(normalizeOperation),
        activeIndex: storedSeed.activeIndex,
      }
    : {operations: demoOperations(), activeIndex: 0}
} catch (err) {
  console.error('[Playground] failed to hydrate from storage, falling back to demo:', err)
  history.clear()
  seed = {operations: demoOperations(), activeIndex: 0}
}
const operations = ref<Operation[]>(seed.operations)
const activeIndex = ref(
  // Clamp after normalize — if the stored index points past the end of a
  // corrupted buffer, fall back to 0 instead of rendering `undefined`.
  Math.max(0, Math.min(seed.activeIndex, seed.operations.length - 1)),
)

// If we seeded from demo (nothing in storage), record the initial snapshot
// so undo cannot empty the buffer.
if (history.current.value === null) {
  history.snapshot({operations: operations.value, activeIndex: activeIndex.value})
}

// Any change to the model → new snapshot (deduped inside the composable).
// Deep watch catches nested edits to Term arrays through TermEditor.
let applyingSnapshot = false
watch(
  [operations, activeIndex],
  () => {
    if (applyingSnapshot) return
    history.snapshot({operations: operations.value, activeIndex: activeIndex.value})
  },
  {deep: true},
)

function applySnapshot(s: Snapshot | null) {
  if (!s) return
  applyingSnapshot = true
  // JSON clone — Vue reactive proxies sometimes make structuredClone throw
  // DataCloneError. Our snapshots are plain data, so the round-trip is safe.
  operations.value = JSON.parse(JSON.stringify(s.operations))
  activeIndex.value = s.activeIndex
  // Release on next microtask so Vue's watchers fire with applyingSnapshot=true.
  queueMicrotask(() => {
    applyingSnapshot = false
  })
}

function onUndo() {
  applySnapshot(history.undo())
}
function onRedo() {
  applySnapshot(history.redo())
}
/**
 * Clear everything — buffer, localStorage, all operations. Leaves a single
 * empty operation so the form never renders against an empty array.
 */
function clearAll() {
  if (!confirm('Clear all operations and history? This cannot be undone.')) return
  history.clear()
  applyingSnapshot = true
  operations.value = [emptyOp()]
  activeIndex.value = 0
  queueMicrotask(() => {
    applyingSnapshot = false
    history.snapshot({operations: operations.value, activeIndex: activeIndex.value})
  })
}

/**
 * Append the tutorial demo operations to whatever the user already has. Never
 * destructive. Duplicate ids get a numeric suffix so the user can tell them
 * apart.
 */
function loadTutorial() {
  const existingIds = new Set(operations.value.map((o) => o.id))
  const demos = demoOperations().map((o) => {
    if (!existingIds.has(o.id)) return o
    let suffix = 2
    while (existingIds.has(`${o.id}${suffix}`)) suffix++
    return {...o, id: `${o.id}${suffix}`}
  })
  operations.value = [...operations.value, ...demos]
  activeIndex.value = operations.value.length - demos.length
}

// Human-friendly "saved 3s ago" indicator.
const now = ref(Date.now())
let nowTimer: ReturnType<typeof setInterval> | null = null
/**
 * Global keyboard handler while the playground is mounted.
 *
 * Intercepts:
 *   - Ctrl+S / Cmd+S  → prevent browser save-page dialog, flash "Already saved"
 *   - Backspace       → prevent legacy "go back" history navigation when the
 *                       focus is not in an editable control. Firefox 2000s-era
 *                       behaviour that still works in some Chromium forks.
 *                       If the user meant to erase a character, they are
 *                       already typing in an input and the browser handles it.
 */
const saveAck = ref(false)

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  const tag = t.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return t.isContentEditable
}

function onKeydown(e: KeyboardEvent) {
  // Ctrl+S / Cmd+S
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 's') {
    e.preventDefault()
    saveAck.value = true
    setTimeout(() => {
      saveAck.value = false
    }, 1200)
    return
  }
  // Backspace outside of editable controls
  if (e.key === 'Backspace' && !isEditableTarget(e.target)) {
    e.preventDefault()
  }
}

onMounted(() => {
  nowTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  if (nowTimer) clearInterval(nowTimer)
  window.removeEventListener('keydown', onKeydown)
})

const savedLabel = computed(() => {
  const t = history.savedAt.value
  if (!t) return ''
  const ago = Math.max(0, Math.floor((now.value - t) / 1000))
  if (ago < 2) return 'Saved just now'
  if (ago < 60) return `Saved ${ago}s ago`
  const m = Math.floor(ago / 60)
  return `Saved ${m}m ago`
})

const bufferLabel = computed(() => {
  const b = history.bufferBytes.value
  if (b === 0) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(2)} MB`
})

const op = computed(() => operations.value[activeIndex.value])

function addOperation() {
  operations.value.push(emptyOp())
  activeIndex.value = operations.value.length - 1
}

function removeOperation(i: number) {
  if (operations.value.length <= 1) return
  operations.value.splice(i, 1)
  if (activeIndex.value >= operations.value.length) {
    activeIndex.value = operations.value.length - 1
  }
}

// ── JSON export ────────────────────────────────────────
const json = computed(() => {
  const instruction = {
    version: '1.0.0',
    operations: operations.value,
  }
  return JSON.stringify(instruction, null, 2)
})

const showJson = ref(false)
const leftPanel = ref<HTMLElement | null>(null)
/** Structured errors — never strings. Empty means "valid". */
const jsonErrors = ref<PlaygroundError[]>([])

// Local draft for the textarea. Decoupled from `json` during editing so that
// re-serialization does not rewrite the textarea content on every keystroke
// (which would scroll the caret to the bottom).
const jsonDraft = ref('')

// Re-seed the draft from `json` whenever the user switches to JSON view
// or changes the active operation — i.e. when the source of truth may have
// changed outside the textarea.
watch([showJson, activeIndex], ([visible]) => {
  if (visible) {
    jsonDraft.value = json.value
    jsonErrors.value = []
  }
}, {immediate: true})

function copyJson() {
  navigator.clipboard.writeText(jsonDraft.value || json.value)
}

function resetJson() {
  jsonDraft.value = json.value
  jsonErrors.value = []
}

function onJsonEdit(text: string) {
  // Always store the draft — the textarea is the source of truth while editing.
  jsonDraft.value = text

  const {value, errors} = validateJson(text)

  // Domain-level invariant: at least one operation.
  const parsed = value as {operations?: unknown[]} | undefined
  if (errors.length === 0 && (!parsed?.operations || parsed.operations.length === 0)) {
    errors.push(domainError('Instruction must contain at least one operation'))
  }

  jsonErrors.value = errors
  if (errors.length > 0) return

  // All clean — commit to the model.
  const nextOps: Operation[] = (parsed!.operations as any[]).map(normalizeOperation)
  operations.value = nextOps
  if (activeIndex.value >= operations.value.length) {
    activeIndex.value = operations.value.length - 1
  }
}

// ── Helpers ────────────────────────────────────────────
// Track expanded traits by reference, not index — indices shift when traits are
// added/removed from anywhere (left TermEditor, right JSON panel, etc.).
const expandedTraits = ref<Set<Term>>(new Set())
watch(activeIndex, () => expandedTraits.value.clear())

function toggleTrait(term: Term) {
  if (expandedTraits.value.has(term)) {
    expandedTraits.value.delete(term)
  } else {
    expandedTraits.value.add(term)
  }
}

function confirmRemove() {
  const name = op.value.id || 'this operation'
  if (confirm(`Remove "${name}"?`)) {
    removeOperation(activeIndex.value)
  }
}
</script>

<template>
  <div class="pg-wrapper">
    <div class="pg-header">
      <h1>Playground</h1>
      <p>Build an instruction. See it live. Remove a trait — the operation does not change.</p>
    </div>

    <!-- ── Tool bar: history + storage ── -->
    <div class="pg-toolbar">
      <div class="pg-toolbar-group">
        <button
          class="pg-tool"
          :disabled="!history.canUndo.value"
          @click="onUndo"
          title="Undo"
        >↶ Undo</button>
        <button
          class="pg-tool"
          :disabled="!history.canRedo.value"
          @click="onRedo"
          title="Redo"
        >↷ Redo</button>
      </div>
      <div class="pg-toolbar-group">
        <button class="pg-tool" @click="loadTutorial" title="Append the tutorial operations">
          📚 Tutorial
        </button>
        <button class="pg-tool pg-tool--danger" @click="clearAll" title="Wipe all operations and history">
          🧹 Clear
        </button>
      </div>
      <div class="pg-toolbar-status" :title="`Buffer stored in localStorage (op:playground:v2)`">
        <span
          v-if="savedLabel"
          class="pg-toolbar-saved"
          :class="{'pg-toolbar-saved--pulse': saveAck}"
        >● {{ saveAck ? 'Already saved' : savedLabel }}</span>
        <span v-if="bufferLabel" class="pg-toolbar-size">{{ bufferLabel }}</span>
      </div>
    </div>

    <div class="pg">
    <!-- ── LEFT: Constructor ── -->
    <div ref="leftPanel" class="pg-left">
      <!-- Operation list -->
      <div class="pg-ops">
        <div
          v-for="(o, i) in operations"
          :key="i"
          class="pg-ops-item"
          :class="{'pg-ops-item--active': i === activeIndex}"
          @click="activeIndex = i"
        >
          <span class="pg-ops-item-id">{{ o.id || '…' }}</span>
          <span v-if="o.comment" class="pg-ops-item-comment">{{ o.comment }}</span>
        </div>
        <button class="pg-ops-add" @click="addOperation">+ operation</button>
      </div>

      <div class="pg-section">
        <label class="pg-label">id</label>
        <input v-model="op.id" class="pg-input" placeholder="OperationName" />
      </div>

      <div class="pg-section">
        <label class="pg-label">comment</label>
        <input v-model="op.comment" class="pg-input" placeholder="What does it do?" />
      </div>

      <!-- Rails -->
      <div v-for="rail in (['input', 'output', 'error', 'trait'] as const)" :key="rail" class="pg-section">
        <label class="pg-label">{{ rail }}</label>
        <TermEditor :terms="op[rail]" />
      </div>

      <!-- Actions -->
      <div v-if="operations.length > 1" class="pg-section pg-json-section">
        <button
          class="pg-btn pg-btn-danger"
          @click="confirmRemove"
        >Remove operation</button>
      </div>
    </div>

    <!-- ── RIGHT: Visualization / JSON ── -->
    <div class="pg-right">
      <!-- Toggle -->
      <div class="pg-viz-toggle">
        <button
          class="pg-viz-toggle-btn"
          :class="{'pg-viz-toggle-btn--active': !showJson}"
          @click="showJson = false"
        >Operation</button>
        <button
          class="pg-viz-toggle-btn"
          :class="{'pg-viz-toggle-btn--active': showJson}"
          @click="showJson = true"
        >Instruction</button>
      </div>

      <!-- JSON view (two-way) -->
      <div v-if="showJson" class="pg-json-view">
        <div class="pg-json-toolbar">
          <div class="pg-json-toolbar-left">
            <button class="pg-btn pg-btn-copy" @click="copyJson">Copy</button>
            <button v-if="jsonErrors.length" class="pg-btn" @click="resetJson">Reset</button>
          </div>
        </div>
        <JsonEditor
          :model-value="jsonDraft"
          :errors="jsonErrors"
          @update:model-value="onJsonEdit"
        />
      </div>

      <!-- Visualization -->
      <template v-else>
        <!-- Header -->
        <div class="pg-viz-header">
          <h2 class="pg-viz-id">{{ op.id || '…' }}</h2>
          <p class="pg-viz-comment">{{ op.comment || 'no comment' }}</p>
        </div>

        <!-- Rails -->
        <div class="pg-viz-rails">
          <div v-for="rail in (['input', 'output', 'error'] as const)" :key="rail" class="pg-viz-rail">
            <SciTooltip
              v-if="rail === 'input'"
              title="Input — Energy entering the system"
              body="Every process requires input. A function takes arguments. A cell absorbs nutrients. A star consumes hydrogen. The input rail is what the operation needs to begin. In thermodynamics — the work put into the system."
              :refs="[
                {label: 'Input/output', href: 'https://en.wikipedia.org/wiki/Input/output'},
                {label: 'Function argument', href: 'https://en.wikipedia.org/wiki/Argument_of_a_function'},
                {label: 'Thermodynamic work', href: 'https://en.wikipedia.org/wiki/Work_(thermodynamics)'},
              ]"
            ><div class="pg-viz-rail-label pg-viz-rail-label--input">input</div></SciTooltip>
            <SciTooltip
              v-else-if="rail === 'output'"
              title="Output — The result of transformation"
              body="Every process produces output. A function returns a value. A cell secretes proteins. A star emits light. The output rail is what the operation produces on success. In thermodynamics — useful work extracted from the system."
              :refs="[
                {label: 'Input/output', href: 'https://en.wikipedia.org/wiki/Input/output'},
                {label: 'Return value', href: 'https://en.wikipedia.org/wiki/Return_statement'},
                {label: 'Useful work (thermodynamics)', href: 'https://en.wikipedia.org/wiki/Work_(thermodynamics)'},
              ]"
            ><div class="pg-viz-rail-label pg-viz-rail-label--output">output</div></SciTooltip>
            <SciTooltip
              v-else
              title="Error — The second law of thermodynamics"
              body="No process completes without the possibility of failure. Entropy always increases. The error rail exists not by design but by physics. Any protocol that omits errors is lying about the nature of reality."
              :refs="[
                {label: 'Second law of thermodynamics', href: 'https://en.wikipedia.org/wiki/Second_law_of_thermodynamics'},
                {label: 'Entropy', href: 'https://en.wikipedia.org/wiki/Entropy'},
                {label: 'Murphy\'s law', href: 'https://en.wikipedia.org/wiki/Murphy%27s_law'},
                {label: 'Exception handling', href: 'https://en.wikipedia.org/wiki/Exception_handling'},
              ]"
            ><div class="pg-viz-rail-label pg-viz-rail-label--error">error</div></SciTooltip>
            <div v-if="op[rail].length === 0" class="pg-viz-empty">empty</div>
            <TermViz v-else :terms="op[rail]" />
          </div>
        </div>

        <!-- Traits -->
        <SciTooltip
          title="Trait — Opinion attached from outside"
          body="Traits are not the operation. They are opinions about the operation. HTTP method, auth type, retry policy — all removable. Remove a trait and the operation does not change. Like the color of a car is not the engine. In biology — phenotype vs genotype."
          :refs="[
            {label: 'Phenotype vs genotype', href: 'https://en.wikipedia.org/wiki/Phenotype'},
            {label: 'Trait (biology)', href: 'https://en.wikipedia.org/wiki/Trait_(biology)'},
            {label: 'Smithy traits (AWS)', href: 'https://smithy.io/2.0/spec/model.html#traits'},
            {label: 'Annotation (Java)', href: 'https://en.wikipedia.org/wiki/Java_annotation'},
            {label: 'Decorator (Python)', href: 'https://en.wikipedia.org/wiki/Python_syntax_and_semantics#Decorators'},
          ]"
        ><span class="pg-viz-traits-label">trait</span></SciTooltip>
        <div class="pg-viz-traits">
          <div
            v-for="(term, i) in op.trait"
            :key="i"
            class="pg-viz-trait-wrap"
          >
            <div class="pg-viz-trait" :class="{'pg-viz-trait--expanded': expandedTraits.has(term)}">
              <button
                v-if="term.of"
                class="pg-viz-trait-chevron"
                @click="toggleTrait(term)"
              >{{ expandedTraits.has(term) ? '▾' : '▸' }}</button>
              <span class="pg-viz-trait-id" :class="{'pg-viz-trait-id--clickable': term.of}" @click="term.of && toggleTrait(term)">{{ term.id }}</span>
              <span v-if="term.value !== undefined && !term.of" class="pg-viz-trait-value">{{ term.value }}</span>
            </div>
            <div v-if="term.of && expandedTraits.has(term)" class="pg-viz-trait-of">
              <TermViz :terms="term.of" />
            </div>
          </div>
          <div v-if="op.trait.length === 0" class="pg-viz-no-traits">no traits — the operation stands</div>
        </div>
      </template>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.pg-wrapper {
  width: 100%;
  max-width: 100%;
  padding: 24px 32px 48px;
  box-sizing: border-box;
}
.pg-header {
  margin-bottom: 24px;
}
.pg-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.pg-header p {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
}

/* ── Toolbar: history + storage ── */
.pg-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  flex-wrap: wrap;
}
.pg-toolbar-group {
  display: flex;
  gap: 4px;
}
.pg-tool {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.pg-tool:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.pg-tool:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pg-tool--danger {
  color: var(--vp-c-danger-1);
  border-color: color-mix(in srgb, var(--vp-c-danger-1) 40%, transparent);
}
.pg-tool--danger:hover {
  background: var(--vp-c-danger-1);
  color: #fff;
  border-color: var(--vp-c-danger-1);
}
.pg-toolbar-status {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  cursor: help;
}
.pg-toolbar-saved {
  color: #22c55e;
  transition: background 0.2s, color 0.2s;
  padding: 2px 6px;
  border-radius: 4px;
}
.pg-toolbar-saved--pulse {
  background: #22c55e;
  color: #fff;
  font-weight: 700;
}
.pg-toolbar-size {
  color: var(--vp-c-text-3);
}
.pg {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  min-height: 500px;
}
.pg-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 85vh;
  overflow-y: auto;
  padding-right: 12px;
  /* Grid tracks default to `min-width: auto`, which means "fit content".
     One long word in an input or in the visualization <h2> can then push
     the grid column wider than its fractional share and squash the other
     column. Resetting min-width to 0 pins each column to its 1fr / 2fr share
     regardless of content; long content is handled by overflow / wrap rules
     below. */
  min-width: 0;
}
.pg-right {
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--vp-c-bg-soft);
  min-width: 0;
  overflow: hidden;
}

/* ── Left: operation list ── */
.pg-ops {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.pg-ops-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}
.pg-ops-item:hover {
  background: var(--vp-c-bg);
}
.pg-ops-item--active {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
}
.pg-ops-item-id {
  font-weight: 700;
  font-size: 14px;
  color: var(--vp-c-text-1);
}
.pg-ops-item--active .pg-ops-item-id {
  color: var(--vp-c-brand-1);
}
.pg-ops-item-comment {
  font-size: 12px;
  color: var(--vp-c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pg-ops-add {
  align-self: flex-start;
  margin-top: 4px;
  padding: 4px 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: none;
  color: var(--vp-c-text-3);
}
.pg-ops-add:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* ── Left: form elements ── */
.pg-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pg-label {
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
}
.pg-input {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.pg-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.pg-json-section {
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
}
.pg-btn {
  padding: 6px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.pg-btn:hover {
  border-color: var(--vp-c-brand-1);
}
.pg-btn-danger {
  color: var(--vp-c-danger-1);
  border-color: var(--vp-c-danger-1);
}
.pg-btn-danger:hover {
  background: var(--vp-c-danger-1);
  color: #fff;
}
.pg-json-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.pg-json-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pg-json-toolbar-left {
  display: flex;
  gap: 6px;
}
.pg-json-err {
  font-size: 12px;
  color: var(--vp-c-danger-1);
}
.pg-json {
  font-size: 13px;
  line-height: 1.6;
  padding: 16px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  overflow: auto;
  flex: 1;
  white-space: pre;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  resize: none;
  box-sizing: border-box;
  width: 100%;
}
.pg-json:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

/* ── Right: toggle ── */
.pg-viz-toggle {
  display: flex;
  gap: 4px;
  align-self: flex-start;
}
.pg-viz-toggle-btn {
  padding: 4px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
}
.pg-viz-toggle-btn--active {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}
.pg-btn-copy {
  align-self: flex-end;
}

/* ── Right: visualization ── */
.pg-viz-header {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.pg-viz-id {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  /* Long identifiers without spaces used to push the whole right panel wider
     than its 2fr share. Break the word mid-character as a last resort so the
     grid geometry stays stable. */
  overflow-wrap: anywhere;
  word-break: break-word;
}
.pg-viz-comment {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Rails */
.pg-viz-rails {
  display: flex;
  gap: 16px;
}
.pg-viz-rail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pg-viz-rail-label {
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 6px;
  text-align: center;
}
.pg-viz-rail-label--input {
  background: #3b82f620;
  color: #3b82f6;
}
.pg-viz-rail-label--output {
  background: #22c55e20;
  color: #22c55e;
}
.pg-viz-rail-label--error {
  background: #ef444420;
  color: #ef4444;
}
.pg-viz-empty {
  font-size: 13px;
  color: var(--vp-c-text-3);
  font-style: italic;
  text-align: center;
  padding: 8px;
}

/* Traits */
.pg-viz-traits-label {
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffd43b;
  padding: 4px 10px;
  background: #ffd43b20;
  border-radius: 6px;
  display: inline-block;
}
.pg-viz-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}
.pg-viz-trait-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pg-viz-trait {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #ffd43b20;
  border: 1px dashed #ffd43b80;
  font-size: 13px;
}
.pg-viz-trait--expanded {
  border-radius: 12px 12px 4px 4px;
}
.pg-viz-trait-chevron {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--vp-c-text-2);
  padding: 0;
  line-height: 1;
}
.pg-viz-trait-id {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.pg-viz-trait-id--clickable {
  cursor: pointer;
}
.pg-viz-trait-id--clickable:hover {
  color: var(--vp-c-brand-1);
}
.pg-viz-trait-value {
  color: var(--vp-c-text-2);
}
.pg-viz-trait-x {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--vp-c-text-3);
  padding: 0 2px;
  line-height: 1;
}
.pg-viz-trait-x:hover {
  color: var(--vp-c-danger-1);
}
.pg-viz-trait-of {
  padding: 8px 12px;
  border-radius: 0 0 12px 12px;
  background: #ffd43b10;
  border: 1px dashed #ffd43b40;
  border-top: none;
}
.pg-viz-no-traits {
  font-size: 13px;
  color: var(--vp-c-text-3);
  font-style: italic;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .pg-wrapper {
    padding: 16px;
  }
  .pg {
    grid-template-columns: 1fr;
  }
  .pg-left {
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
  }
  .pg-viz-rails {
    flex-direction: column;
  }
}
</style>
