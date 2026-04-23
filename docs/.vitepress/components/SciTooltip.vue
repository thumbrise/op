<script setup lang="ts">
import {ref} from 'vue'

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
</script>

<template>
  <span class="sci" @mouseenter="show = true" @mouseleave="show = false">
    <slot />
    <span class="sci-icon">ⓘ</span>
    <Transition name="sci-fade">
      <div v-if="show" class="sci-tip">
        <strong class="sci-tip-title">{{ title }}</strong>
        <p class="sci-tip-body">{{ body }}</p>
        <div v-if="props.refs && props.refs.length" class="sci-tip-refs">
          <a v-for="(r, i) in props.refs" :key="i" :href="r.href" target="_blank" class="sci-tip-ref">{{ r.label }} ↗</a>
        </div>
      </div>
    </Transition>
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
.sci-tip {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  width: 280px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  pointer-events: auto;
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
