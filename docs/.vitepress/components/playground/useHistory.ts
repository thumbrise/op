/**
 * useHistory — Vue hook, биндинг между packages/history + packages/storage.
 * Отвечает: storage binding, watch + debounce save.
 * НЕ отвечает: default preset (передаётся извне).
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { createLocalStorage, type Storage } from '../../packages/storage'
import { createHistory, type History, type HistoryState } from '../../packages/history'

export interface UseHistoryOptions<T> {
  storageKey: string
  maxEntries?: number
  equals?: (a: T, b: T) => boolean
}

export interface UseHistoryReturn<T> {
  historyRef: Ref<History<T>>
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  current: Ref<T | null>
  savedAt: Ref<number | null>
  bufferBytes: Ref<number>

  snapshot(state: T): void
  undo(): void
  redo(): void
  clear(): void
}

export function useHistory<T>(options: UseHistoryOptions<T>): UseHistoryReturn<T> {
  const storage: Storage<HistoryState<T>> = createLocalStorage()

  const savedAt = ref<number | null>(null)
  const bufferBytes = ref(0)

  // Load from storage
  const savedState = storage.get(options.storageKey)

  // Create history: either from storage or fresh
  let initialHistory: History<T>

  if (savedState && savedState.entries && savedState.entries.length > 0) {
    // Restore from storage: snapshot each entry to rebuild state
    // Note: this reconstructs history but cursor will be at the end
    // (limitations of immutable approach without withCursor)
    initialHistory = createHistory<T>({
      maxEntries: options.maxEntries,
      equals: options.equals
    }).snapshotBulk(savedState.entries)
  } else {
    // Fresh history - but preset will be added by the caller
    initialHistory = createHistory<T>({
      maxEntries: options.maxEntries,
      equals: options.equals
    })
  }

  const historyRef = ref(initialHistory)

  // Computed properties
  const canUndo = computed(() => historyRef.value.canUndo)
  const canRedo = computed(() => historyRef.value.canRedo)
  const current = computed(() => historyRef.value.current)

  // Persist to storage (debounced)
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function persist() {
    if (saveTimer) clearTimeout(saveTimer)

    saveTimer = setTimeout(() => {
      const state = historyRef.value.state as HistoryState<T>
      storage.set(options.storageKey, state)

      savedAt.value = Date.now()
      bufferBytes.value = JSON.stringify(state).length
    }, 500)
  }

  // Watch for changes
  watch(historyRef, persist, { deep: true })

  // Persist on page unload
  function beforeUnload() {
    if (saveTimer) {
      clearTimeout(saveTimer)
      const state = historyRef.value.state as HistoryState<T>
      storage.set(options.storageKey, state)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', beforeUnload)
  }

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', beforeUnload)
    }
  })

  return {
    historyRef,
    canUndo,
    canRedo,
    current,
    savedAt,
    bufferBytes,

    snapshot(state: T) {
      historyRef.value = historyRef.value.snapshot(state)
    },

    undo() {
      historyRef.value = historyRef.value.undo()
    },

    redo() {
      historyRef.value = historyRef.value.redo()
    },

    clear() {
      historyRef.value = historyRef.value.clear()
      storage.set(options.storageKey, { entries: [], cursor: -1 })
      savedAt.value = null
      bufferBytes.value = 0
    }
  }
}