/**
 * Storage — мнение среды о сериализации.
 * Storage НЕ знает про историю, массивы, cursor — только save/load.
 * Сериализация — JSON (внутри).
 */

export interface Storage<T> {
  set(k: string, v: T): T
  get(k: string): T | null
  clear(): void
}

export function createLocalStorage<T>(): Storage<T> {
  return {
    set(key: string, value: T): T {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // quota exceeded or private mode — silently fail
      }
      return value
    },

    get(key: string): T | null {
      try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
      } catch {
        // corrupted data — start fresh
        return null
      }
    },

    clear(): void {
      try {
        localStorage.clear()
      } catch {
        // ignore
      }
    }
  }
}