<script setup lang="ts">
interface Term {
  id: string
  comment?: string
  required?: boolean
  kind?: string
  value?: string | number | boolean
  of?: Term[]
}

function toggleRequired(term: Term) {
  term.required = term.required ? undefined : true
}

// Comment is destructive to remove — only empty ones are hidden on click.
// A non-empty comment stays. User must clear the text manually first.
function toggleComment(term: Term) {
  if (term.comment === undefined) {
    term.comment = ''
    return
  }
  if (term.comment === '') {
    delete term.comment
  }
  // non-empty: no-op, button is visually disabled via :class below
}

defineProps<{
  terms: Term[]
  depth?: number
}>()

const KINDS = ['string', 'integer', 'float', 'boolean', 'binary', 'datetime', 'array', 'object', 'enum'] as const
const COMPOUND = new Set(['object', 'array', 'enum'])
const NUMERIC = new Set(['integer', 'float'])

function addTerm(list: Term[]) {
  list.push({id: ''})
}

function removeTerm(list: Term[], i: number) {
  list.splice(i, 1)
}

function onKindChange(term: Term, raw: string) {
  // Empty select option means "no kind" — store as undefined, not "".
  term.kind = raw || undefined
  if (COMPOUND.has(term.kind || '') && !term.of) {
    term.of = []
  }
  if (!COMPOUND.has(term.kind || '') && term.of) {
    delete term.of
  }
  // Re-coerce value under the new kind.
  if (term.value !== undefined && term.value !== '') {
    term.value = coerceValue(String(term.value), term.kind)
  }
}

function coerceValue(raw: string, kind: string | undefined): string | number | boolean {
  if (kind === 'boolean') {
    return raw === 'true' || raw === '1'
  }
  if (NUMERIC.has(kind || '')) {
    const n = Number(raw)
    return Number.isFinite(n) ? n : raw
  }
  return raw
}

function onValueInput(term: Term, raw: string) {
  if (raw === '') {
    delete term.value
    return
  }
  term.value = coerceValue(raw, term.kind)
}
</script>

<template>
  <div class="te">
    <div v-for="(term, i) in terms" :key="i" class="te-row">
      <div class="te-line">
        <input v-model="term.id" class="te-input te-input-id" placeholder="id" />
        <select
          :value="term.kind || ''"
          class="te-select"
          @change="onKindChange(term, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">—</option>
          <option v-for="k in KINDS" :key="k" :value="k">{{ k }}</option>
        </select>
        <input
          :value="term.value ?? ''"
          class="te-input te-input-val"
          placeholder="value"
          @input="onValueInput(term, ($event.target as HTMLInputElement).value)"
        />
        <button class="te-btn-req" :class="{'te-btn-req--active': term.required}" @click="toggleRequired(term)" title="required">!</button>
        <button
          class="te-btn-comment"
          :class="{
            'te-btn-comment--active': term.comment !== undefined,
            'te-btn-comment--locked': !!term.comment,
          }"
          :title="term.comment ? 'Clear text to hide' : 'Toggle comment'"
          @click="toggleComment(term)"
        >💬</button>
        <button class="te-btn-x" @click="removeTerm(terms, i)">✕</button>
      </div>
      <input
        v-if="term.comment !== undefined"
        v-model="term.comment"
        class="te-input te-input-comment"
        placeholder="comment…"
      />
      <!-- Recursive of for compound kinds -->
      <div v-if="term.of && (depth || 0) < 3" class="te-of">
        <span class="te-of-label">of</span>
        <TermEditor
          :terms="term.of"
          :depth="(depth || 0) + 1"
        />
      </div>
    </div>
    <button class="te-btn-add" @click="addTerm(terms)">+ term</button>
  </div>
</template>

<style scoped>
.te {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.te-line {
  display: flex;
  gap: 6px;
  align-items: center;
}
.te-input {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.te-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.te-input-id {
  flex: 1;
  min-width: 0;
}
.te-input-val {
  flex: 1;
  min-width: 0;
}
.te-select {
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 13px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  width: 100px;
}
.te-btn-req {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  padding: 4px;
  line-height: 1;
  color: var(--vp-c-text-3);
  opacity: 0.3;
}
.te-btn-req:hover {
  opacity: 0.7;
}
.te-btn-req--active {
  opacity: 1;
  color: var(--vp-c-danger-1);
}
.te-btn-comment {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 4px;
  line-height: 1;
  opacity: 0.3;
}
.te-btn-comment:hover {
  opacity: 0.7;
}
.te-btn-comment--active {
  opacity: 1;
}
.te-btn-comment--locked {
  cursor: default;
}
.te-btn-comment--locked:hover {
  opacity: 1;
}
.te-input-comment {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-style: italic;
}
.te-btn-x {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-3);
  font-size: 14px;
  padding: 4px;
  line-height: 1;
}
.te-btn-x:hover {
  color: var(--vp-c-danger-1);
}
.te-btn-add {
  align-self: flex-start;
  background: none;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-2);
}
.te-btn-add:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.te-of {
  margin-left: 20px;
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-divider);
}
.te-of-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
}
</style>
