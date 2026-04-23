<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import type {PlaygroundError} from './jsonValidation'

const props = defineProps<{
  /** Current textarea content. Owned by the parent. */
  modelValue: string
  /** Errors to display. Each with optional source range. */
  errors: PlaygroundError[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const charSizer = ref<HTMLElement | null>(null)

/**
 * The text split into lines. One pass, used by both the gutter and the inline
 * annotation layer.
 */
const lines = computed(() => props.modelValue.split('\n'))

// Compute which lines have errors (1-based). One set, fast lookup for the gutter.
const errorLines = computed(() => {
  const s = new Set<number>()
  for (const err of props.errors) {
    if (err.range) s.add(err.range.line)
  }
  return s
})

// Group errors by line so we can render one annotation per line (multiple
// errors collapse into a compact badge + full text for the first one).
interface LineAnnotation {
  line: number
  primary: PlaygroundError
  extra: number
}
const annotations = computed<LineAnnotation[]>(() => {
  const byLine = new Map<number, PlaygroundError[]>()
  for (const err of props.errors) {
    if (!err.range) continue
    const arr = byLine.get(err.range.line) ?? []
    arr.push(err)
    byLine.set(err.range.line, arr)
  }
  return Array.from(byLine.entries())
    .sort(([a], [b]) => a - b)
    .map(([line, errs]) => ({line, primary: errs[0], extra: errs.length - 1}))
})

// Textarea metrics — measured once and kept fresh on scroll/input.
const metrics = ref({lineHeight: 20, paddingTop: 16, paddingLeft: 16, charWidth: 8})
const scrollTop = ref(0)
const scrollLeft = ref(0)

function measureMetrics() {
  const el = textarea.value
  const sizer = charSizer.value
  if (!el) return
  const style = window.getComputedStyle(el)
  metrics.value = {
    lineHeight: parseFloat(style.lineHeight) || 20,
    paddingTop: parseFloat(style.paddingTop) || 0,
    paddingLeft: parseFloat(style.paddingLeft) || 0,
    // charSizer is a single '0' in the same font as the textarea.
    charWidth: sizer ? sizer.getBoundingClientRect().width : 8,
  }
}

onMounted(() => {
  measureMetrics()
  // Re-measure on font load and window resize — cheap, runs rarely.
  window.addEventListener('resize', measureMetrics)
})

watch(() => props.modelValue, () => {
  // Content changed — scroll positions may have shifted by one frame.
  // Cheap re-read on next microtask.
  if (textarea.value) {
    scrollTop.value = textarea.value.scrollTop
    scrollLeft.value = textarea.value.scrollLeft
  }
})

/**
 * Pixel position for an inline annotation on a given 1-based line.
 * Placed after the last non-whitespace char of the line + two-space gap.
 */
function annotationStyle(a: LineAnnotation) {
  const {lineHeight, paddingTop, paddingLeft, charWidth} = metrics.value
  const lineText = lines.value[a.line - 1] ?? ''
  const col = lineText.length + 2 // two spaces of breathing room
  return {
    top: `${paddingTop + (a.line - 1) * lineHeight - scrollTop.value}px`,
    left: `${paddingLeft + col * charWidth - scrollLeft.value}px`,
    lineHeight: `${lineHeight}px`,
  }
}

function focusError(err: PlaygroundError) {
  const el = textarea.value
  if (!el || !err.range) return
  el.focus()
  el.setSelectionRange(err.range.offset, err.range.offset + err.range.length)
  scrollRangeIntoView(el, err.range.offset)
}

function scrollRangeIntoView(el: HTMLTextAreaElement, offset: number) {
  // Approximate: count newlines before offset, multiply by line height.
  const text = el.value
  let line = 0
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++
  }
  const {lineHeight, paddingTop} = metrics.value
  const target = paddingTop + line * lineHeight - el.clientHeight / 2
  el.scrollTop = Math.max(0, target)
}

// Keep the gutter + annotations scrolled together with the textarea.
const gutter = ref<HTMLElement | null>(null)
function onScroll() {
  if (!textarea.value) return
  scrollTop.value = textarea.value.scrollTop
  scrollLeft.value = textarea.value.scrollLeft
  if (gutter.value) gutter.value.scrollTop = scrollTop.value
}

defineExpose({focusError})
</script>

<template>
  <div class="je">
    <div class="je-frame">
      <div ref="gutter" class="je-gutter" aria-hidden="true">
        <div
          v-for="(_, i) in lines"
          :key="i"
          class="je-gutter-line"
          :class="{'je-gutter-line--error': errorLines.has(i + 1)}"
        >{{ i + 1 }}</div>
      </div>
      <div class="je-editor">
        <textarea
          ref="textarea"
          class="je-textarea"
          :value="modelValue"
          spellcheck="false"
          @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
          @scroll="onScroll"
        ></textarea>
        <!-- Invisible sizer: one '0' in the same font as the textarea, for exact char width -->
        <span ref="charSizer" class="je-char-sizer" aria-hidden="true">0</span>
        <!-- Inline error annotations, absolutely positioned per line, non-interactive -->
        <div class="je-annotations" aria-hidden="true">
          <div
            v-for="a in annotations"
            :key="a.line"
            class="je-annotation"
            :class="`je-annotation--${a.primary.kind}`"
            :style="annotationStyle(a)"
          >◄ {{ a.primary.message }}<span v-if="a.extra" class="je-annotation-extra"> (+{{ a.extra }})</span></div>
        </div>
      </div>
    </div>
    <!-- Domain errors have no source location — show them as a compact banner. -->
    <div v-if="errors.some((e) => !e.range)" class="je-banner">
      <span
        v-for="(err, i) in errors.filter((e) => !e.range)"
        :key="i"
        class="je-banner-item"
        :class="`je-banner-item--${err.kind}`"
      >{{ err.message }}</span>
    </div>
  </div>
</template>

<style scoped>
.je {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
}
.je-frame {
  display: flex;
  flex: 1;
  min-height: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  overflow: hidden;
}
.je-frame:focus-within {
  border-color: var(--vp-c-brand-1);
}
.je-gutter {
  padding: 16px 8px 16px 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  text-align: right;
  user-select: none;
  overflow: hidden;
  min-width: 2.5em;
  border-right: 1px solid var(--vp-c-divider);
  box-sizing: border-box;
}
.je-gutter-line {
  height: calc(13px * 1.6);
}
.je-gutter-line--error {
  color: var(--vp-c-danger-1);
  font-weight: 700;
  background: color-mix(in srgb, var(--vp-c-danger-1) 12%, transparent);
}
.je-editor {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.je-textarea {
  width: 100%;
  height: 100%;
  font-size: 13px;
  line-height: 1.6;
  padding: 16px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  white-space: pre;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
}
/* Off-screen sizer — same font as textarea, used to measure char width. */
.je-char-sizer {
  position: absolute;
  top: -9999px;
  left: -9999px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  white-space: pre;
  visibility: hidden;
}
/* Overlay that holds inline annotations. Does not eat clicks. */
.je-annotations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.je-annotation {
  position: absolute;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  white-space: nowrap;
  padding: 0 6px;
  border-radius: 3px;
  opacity: 0.85;
  color: var(--vp-c-danger-1);
  background: color-mix(in srgb, var(--vp-c-danger-1) 10%, transparent);
  max-width: calc(100% - 32px);
  overflow: hidden;
  text-overflow: ellipsis;
}
.je-annotation--domain {
  color: var(--vp-c-warning-1, #f59e0b);
  background: color-mix(in srgb, var(--vp-c-warning-1, #f59e0b) 12%, transparent);
}
.je-annotation-extra {
  opacity: 0.7;
  font-size: 11px;
}
/* Banner for errors without a source range (domain-level). */
.je-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.je-banner-item {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  color: var(--vp-c-warning-1, #f59e0b);
  background: color-mix(in srgb, var(--vp-c-warning-1, #f59e0b) 12%, transparent);
  font-weight: 600;
}
</style>
