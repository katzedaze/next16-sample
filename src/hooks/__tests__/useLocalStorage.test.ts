import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should use initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue')
    )

    expect(result.current[0]).toBe('initialValue')
  })

  it('should use stored value from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'))

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue')
    )

    expect(result.current[0]).toBe('storedValue')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue')
    )

    act(() => {
      result.current[1]('newValue')
    })

    expect(result.current[0]).toBe('newValue')
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('newValue'))
  })

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify(1))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(2)
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify(2))
  })

  it('should handle complex objects', () => {
    const testObject = { name: 'Test', value: 42, nested: { data: 'test' } }

    const { result } = renderHook(() =>
      useLocalStorage('testKey', testObject)
    )

    expect(result.current[0]).toEqual(testObject)

    const newObject = { name: 'Updated', value: 100, nested: { data: 'new' } }

    act(() => {
      result.current[1](newObject)
    })

    expect(result.current[0]).toEqual(newObject)
    expect(JSON.parse(localStorage.getItem('testKey')!)).toEqual(newObject)
  })

  it('should handle errors when parsing localStorage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem('testKey', 'invalid json')

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue')
    )

    expect(result.current[0]).toBe('initialValue')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should handle errors when setting localStorage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock setItem to throw error
    const originalSetItem = localStorageMock.setItem
    localStorageMock.setItem = vi.fn(() => {
      throw new Error('Storage full')
    })

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue')
    )

    act(() => {
      result.current[1]('newValue')
    })

    expect(consoleSpy).toHaveBeenCalled()

    // Restore
    consoleSpy.mockRestore()
    localStorageMock.setItem = originalSetItem
  })

  it('should work with different types', () => {
    // Boolean
    const { result: boolResult } = renderHook(() =>
      useLocalStorage('boolKey', false)
    )
    act(() => {
      boolResult.current[1](true)
    })
    expect(boolResult.current[0]).toBe(true)

    // Array
    const { result: arrayResult } = renderHook(() =>
      useLocalStorage('arrayKey', [1, 2, 3])
    )
    act(() => {
      arrayResult.current[1]([4, 5, 6])
    })
    expect(arrayResult.current[0]).toEqual([4, 5, 6])

    // Null
    const { result: nullResult } = renderHook(() =>
      useLocalStorage('nullKey', null)
    )
    act(() => {
      nullResult.current[1](null)
    })
    expect(nullResult.current[0]).toBe(null)
  })
})
