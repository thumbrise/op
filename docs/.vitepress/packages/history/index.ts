/**
 * History — чистый алгоритм.
 * НЕ знает про storage, Vue, сериализацию.
 * Immutable — возвращает новый History при mutation.
 */

export interface HistoryState<T> {
  entries: T[]
  cursor: number
}

export interface History<T> {
  readonly state: HistoryState<T>
  readonly current: T | null
  readonly canUndo: boolean
  readonly canRedo: boolean

  snapshot(state: T): History<T>
  snapshotBulk(states: T[]): History<T>
  undo(): History<T>
  redo(): History<T>
  clear(): History<T>
}

export interface HistoryOptions<T> {
  maxEntries?: number
  equals?: (a: T, b: T) => boolean
}

export function createHistory<T>(options?: HistoryOptions<T>): History<T> {
  const maxEntries = options?.maxEntries ?? 50
  const equals = options?.equals ?? defaultEquals

  let state: HistoryState<T> = { entries: [], cursor: -1 }

  function computeCurrent(): T | null {
    const { entries, cursor } = state
    return cursor >= 0 && cursor < entries.length ? entries[cursor] : null
  }

  function computeCanUndo(): boolean {
    return state.cursor > 0
  }

  function computeCanRedo(): boolean {
    return state.cursor < state.entries.length - 1
  }

  return {
    get state(): HistoryState<T> {
      return state
    },

    get current(): T | null {
      return computeCurrent()
    },

    get canUndo(): boolean {
      return computeCanUndo()
    },

    get canRedo(): boolean {
      return computeCanRedo()
    },

    snapshot(newState: T): History<T> {
      const { entries, cursor } = state

      // дедупликация
      const head = cursor >= 0 ? entries[cursor] : null
      if (head !== null && equals(head, newState)) {
        return this
      }

      // truncate redo tail
      const newEntries = cursor >= 0 ? entries.slice(0, cursor + 1) : []
      newEntries.push(newState)

      // apply maxEntries (FIFO)
      while (newEntries.length > maxEntries) {
        newEntries.shift()
      }

      state = {
        entries: newEntries,
        cursor: newEntries.length - 1
      }

      return this
    },

    snapshotBulk(newStates: T[]): History<T> {
      let history = this

      for (const s of newStates) {
        history = history.snapshot(s)
      }

      return history
    },

    undo(): History<T> {
      if (!this.canUndo) return this
      state = { ...state, cursor: state.cursor - 1 }
      return this
    },

    redo(): History<T> {
      if (!this.canRedo) return this
      state = { ...state, cursor: state.cursor + 1 }
      return this
    },

    clear(): History<T> {
      state = { entries: [], cursor: -1 }
      return this
    }
  }
}

function defaultEquals<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}