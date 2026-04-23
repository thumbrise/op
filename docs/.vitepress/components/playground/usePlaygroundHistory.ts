// Playground history: one buffer, one source of truth.
//
// - `snapshot(state)` pushes a deduplicated entry, truncating any redo tail.
// - `undo()` / `redo()` move the cursor and return the state to restore.
// - On every new snapshot (debounced), the whole buffer is persisted to
//   localStorage, and `savedAt` flips to a fresh timestamp.
// - On mount, the last entry of the stored buffer is used to hydrate the app
//   — the full undo history survives a refresh, not just the latest state.
//
// The buffer is an explicit artefact: size and save timestamp are exposed so
// the UI can tell the user what is happening.

import {computed, ref, type Ref} from 'vue'

export interface HistoryState<T> {
    readonly current: Ref<T | null>
    readonly canUndo: Ref<boolean>
    readonly canRedo: Ref<boolean>
    readonly bufferBytes: Ref<number>
    readonly savedAt: Ref<number | null>
    snapshot: (state: T) => void
    undo: () => T | null
    redo: () => T | null
    clear: () => void
}

interface StoredBuffer<T> {
    v: 1
    entries: T[]
    cursor: number
}

export function usePlaygroundHistory<T>(options: {
    storageKey: string
    /** Max snapshots kept. Older entries are dropped FIFO. */
    maxEntries?: number
    /** Debounce for persistence, ms. Snapshots still land in-memory immediately. */
    debounceMs?: number
    /** Deep-equality check between two states. Default: JSON.stringify compare. */
    equals?: (a: T, b: T) => boolean
}): HistoryState<T> {
    const maxEntries = options.maxEntries ?? 50
    const debounceMs = options.debounceMs ?? 500
    const equals = options.equals ?? ((a, b) => JSON.stringify(a) === JSON.stringify(b))

    // ── Buffer ────────────────────────────────────────────
    const entries = ref<T[]>([]) as Ref<T[]>
    const cursor = ref(-1)

    // ── Persistence metrics ───────────────────────────────
    const bufferBytes = ref(0)
    const savedAt = ref<number | null>(null)

    // ── Hydrate from storage ──────────────────────────────
    if (typeof window !== 'undefined') {
        try {
            const raw = window.localStorage.getItem(options.storageKey)
            if (raw) {
                const parsed = JSON.parse(raw) as StoredBuffer<T>
                if (parsed && parsed.v === 1 && Array.isArray(parsed.entries) && parsed.entries.length > 0) {
                    entries.value = parsed.entries
                    cursor.value = Math.min(parsed.cursor ?? parsed.entries.length - 1, parsed.entries.length - 1)
                    bufferBytes.value = byteSize(raw)
                }
            }
        } catch {
            // Corrupted or missing — ignore, start fresh.
        }
    }

    // ── Derived ───────────────────────────────────────────
    const current = computed<T | null>(() =>
        cursor.value >= 0 && cursor.value < entries.value.length ? entries.value[cursor.value] : null,
    )
    const canUndo = computed(() => cursor.value > 0)
    const canRedo = computed(() => cursor.value < entries.value.length - 1)

    // ── Persistence (debounced) ───────────────────────────
    let saveTimer: ReturnType<typeof setTimeout> | null = null
    function schedulePersist() {
        if (typeof window === 'undefined') return
        if (saveTimer) clearTimeout(saveTimer)
        saveTimer = setTimeout(persistNow, debounceMs)
    }
    function persistNow() {
        if (typeof window === 'undefined') return
        const payload: StoredBuffer<T> = {v: 1, entries: entries.value, cursor: cursor.value}
        const raw = JSON.stringify(payload)
        try {
            window.localStorage.setItem(options.storageKey, raw)
            bufferBytes.value = byteSize(raw)
            savedAt.value = Date.now()
        } catch {
            // Quota exceeded or private mode — silently give up. In-memory
            // history still works.
        }
    }

    // ── Operations ────────────────────────────────────────
    function snapshot(state: T) {
        // Deep-clone immediately so subsequent mutations of `state` by the
        // consumer (form edits on the same reactive object) cannot reach back
        // into the buffer. Without this clone, `head` and `state` end up as
        // the same reference: dedup returns true, snapshot is dropped, and
        // autosave silently stops firing after the first successful push.
        //
        // Why JSON round-trip, not structuredClone: the Playground feeds us
        // Vue 3 reactive arrays and objects. Reactive Proxy trap behaviour
        // sometimes surfaces non-cloneable slots (refs, symbols) that cause
        // structuredClone to throw DataCloneError. JSON is less strict — it
        // reads through the Proxy trap as plain data and never throws on
        // functions/symbols, it just drops them. Our Snapshot is plain JSON
        // by construction, so the round-trip is information-preserving.
        const snap = JSON.parse(JSON.stringify(state)) as T

        const head = current.value
        if (head !== null && equals(head, snap)) return

        // Truncate any redo tail before pushing.
        if (cursor.value < entries.value.length - 1) {
            entries.value.splice(cursor.value + 1)
        }
        entries.value.push(snap)

        // Cap buffer size — drop oldest entries, move cursor accordingly.
        while (entries.value.length > maxEntries) {
            entries.value.shift()
        }
        cursor.value = entries.value.length - 1
        schedulePersist()
    }

    function undo(): T | null {
        if (!canUndo.value) return null
        cursor.value--
        schedulePersist()
        return current.value
    }

    function redo(): T | null {
        if (!canRedo.value) return null
        cursor.value++
        schedulePersist()
        return current.value
    }

    function clear() {
        entries.value = []
        cursor.value = -1
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(options.storageKey)
            } catch {
                // ignore
            }
        }
        bufferBytes.value = 0
        savedAt.value = null
    }

    // Persist pending flush on unload — the user's last edit must not vanish
    // just because they closed the tab before the debounce fired.
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
            if (saveTimer) {
                clearTimeout(saveTimer)
                persistNow()
            }
        })
    }

    // The composable does not spy on external refs — the consumer drives
    // snapshot() explicitly when a coherent change is ready to record.
    return {current, canUndo, canRedo, bufferBytes, savedAt, snapshot, undo, redo, clear}
}

/** Byte size of a UTF-8 string. Accurate enough for UI display. */
function byteSize(s: string): number {
    if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(s).length
    }
    // Fallback — works in most browsers and Node.
    return unescape(encodeURIComponent(s)).length
}
