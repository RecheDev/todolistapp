/**
 * Safe localStorage wrapper with SSR protection and error handling
 */

type StorageValue = string | number | boolean | object | null

interface StorageUtils {
  getItem: <T = string>(key: string, defaultValue?: T) => T | null
  setItem: (key: string, value: StorageValue) => boolean
  removeItem: (key: string) => boolean
  clear: () => boolean
  isAvailable: () => boolean
}

class SafeStorage implements StorageUtils {
  private isClient: boolean
  private storage: Storage | null

  constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.isClient = typeof window !== 'undefined'
    this.storage = this.isClient ? window[storageType] : null
  }

  isAvailable(): boolean {
    if (!this.isClient || !this.storage) return false
    
    try {
      const testKey = '__storage_test__'
      this.storage.setItem(testKey, 'test')
      this.storage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  getItem<T = string>(key: string, defaultValue?: T): T | null {
    if (!this.isAvailable()) return defaultValue ?? null

    try {
      const item = this.storage!.getItem(key)
      if (item === null) return defaultValue ?? null

      // Try to parse as JSON first
      try {
        return JSON.parse(item) as T
      } catch {
        // If JSON parsing fails, return as string
        return item as T
      }
    } catch (error) {
      console.warn(`Error reading from storage key "${key}":`, error)
      return defaultValue ?? null
    }
  }

  setItem(key: string, value: StorageValue): boolean {
    if (!this.isAvailable()) return false

    try {
      const serializedValue = typeof value === 'string' 
        ? value 
        : JSON.stringify(value)
      
      this.storage!.setItem(key, serializedValue)
      return true
    } catch (error) {
      console.warn(`Error writing to storage key "${key}":`, error)
      return false
    }
  }

  removeItem(key: string): boolean {
    if (!this.isAvailable()) return false

    try {
      this.storage!.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing storage key "${key}":`, error)
      return false
    }
  }

  clear(): boolean {
    if (!this.isAvailable()) return false

    try {
      this.storage!.clear()
      return true
    } catch (error) {
      console.warn('Error clearing storage:', error)
      return false
    }
  }
}

// Export singleton instances
export const safeLocalStorage = new SafeStorage('localStorage')
export const safeSessionStorage = new SafeStorage('sessionStorage')

// Utility functions for common patterns
export const createStorageKey = (prefix: string, key: string) => `${prefix}_${key}`

export const withStorageErrorHandling = <T>(
  operation: () => T,
  fallback: T,
  errorMessage?: string
): T => {
  try {
    return operation()
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error)
    }
    return fallback
  }
}