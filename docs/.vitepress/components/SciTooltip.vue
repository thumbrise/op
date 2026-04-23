<script setup lang="ts">
import {nextTick, onBeforeUnmount, ref} from 'vue'

interface SciRef {
  label: string
  href: string
}

const props = defineProps<{
  title: string
  body: string
  refs?: SciRef[]
}>()

const show = ref(false)
const trigger = ref<HTMLElement | null>(null)
// Fixed-position coords computed from the trigger's bounding rect. The tooltip
// is teleported to <body> so it escapes any ancestor `overflow: hidden`.
const pos = ref({top: 0, left: 0})
// Tooltip width in sync with the CSS below.
const TIP_WIDTH = 280
const MARGIN = 8

function updatePosition() {
  const el = trigger.value
  if (!el) return
  const r = el.getBoundingClientRect()
  // Prefer above; flip below if not enough room.
  const preferredTop = r.top - MARGIN
  const top = preferredTop < MARGIN ? r.bottom + MARGIN : preferredTop
  // Clamp horizontally so the tooltip stays within the viewport.
  let left = r.left
  const maxLeft = window.innerWidth - TIP_WIDTH - MARGIN
  if (left > maxLeft) left = maxLeft
  if (left < MARGIN) left = MARGIN
  pos.value = {top, left}
}

async function onEnter() {
  show.value = true
  await nextTick()
  updatePosition()
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
}

function onLeave() {
  show.value = false
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
}

onBeforeUnmount(onLeave)
</script>

<template>
  <span ref="trigger" class="sci" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
    <span class="sci-icon">ⓘ</span>
    <Teleport to="body">
      <Transition name="sci-fade">
        <div
          v-if="show"
          class="sci-tip"
          :style="{top: pos.top + 'px', left: pos.left + 'px', transform: 'translateY(-100%)'}"
          @mouseenter="show = true"
          @mouseleave="onLeave"
        >
          <strong class="sci-tip-title">{{ title }}</strong>
          <p class="sci-tip-body">{{ body }}</p>
          <div v-if="props.refs && props.refs.length" class="sci-tip-refs">
            <a v-for="(r, i) in props.refs" :key="i" :href="r.href" target="_blank" class="sci-tip-ref">{{ r.label }} ↗</a>
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.sci {
  position: relative;
  cursor: help;
}
.sci-icon {
  font-size: 10px;
  opacity: 0.3;
  margin-left: 2px;
  vertical-align: super;
}
.sci:hover .sci-icon {
  opacity: 0.8;
}
</style>

<!--
  Tooltip styles are NOT scoped: the tooltip is teleported to <body>, so it
  lives outside this component's DOM subtree and scoped `data-v-*` attributes
  wouldn't apply.
-->
<style>
.sci-tip {
  position: fixed;
  width: 280px;
  max-width: calc(100vw - 16px);
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  pointer-events: auto;
  /* Margin above the trigger — complements the translateY(-100%) in inline style. */
  margin-top: -4px;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
/* Bridge the gap between trigger and tooltip so mouse can reach links */
.sci-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 8px;
}
.sci-tip-title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--vp-c-text-1);
}
.sci-tip-body {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.sci-tip-refs {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid var(--vp-c-divider);
}
.sci-tip-ref {
  font-size: 11px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  line-height: 1.4;
  word-break: break-all;
}
.sci-tip-ref:hover {
  text-decoration: underline;
}
.sci-fade-enter-active,
.sci-fade-leave-active {
  transition: opacity 0.15s ease;
}
.sci-fade-enter-from,
.sci-fade-leave-to {
  opacity: 0;
}
</style>
