import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'changed', delay: 500 })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast-forward time
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current).toBe('changed')
  })

  it('should cancel previous timeout on rapid value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    // First change
    rerender({ value: 'change1', delay: 500 })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    // Second change before first timeout completes
    rerender({ value: 'change2', delay: 500 })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    // Should still be initial value
    expect(result.current).toBe('initial')

    // Complete the second timeout
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })

    expect(result.current).toBe('change2')
  })

  it('should handle custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    )

    rerender({ value: 'changed', delay: 1000 })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(999)
    })
    expect(result.current).toBe('initial')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(result.current).toBe('changed')
  })

  it('should work with different types', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 0 },
      }
    )

    expect(result.current).toBe(0)

    rerender({ value: 123 })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current).toBe(123)
  })
})
