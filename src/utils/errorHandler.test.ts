import { describe, it, expect } from 'vitest'
import { formatErrorForUI } from './errorHandler'

describe('formatErrorForUI', () => {
  it('returns network error message', () => {
    expect(formatErrorForUI({ code: 'NETWORK_ERROR', message: '' })).toBe(
      'Check your connection and try again.'
    )
  })

  it('returns validation error message from payload', () => {
    expect(
      formatErrorForUI({
        code: 'VALIDATION_ERROR',
        message: 'Title is required',
      })
    ).toBe('Title is required')
  })

  it('returns unknown error message', () => {
    expect(
      formatErrorForUI({
        code: 'UNKNOWN',
        message: 'Something went wrong',
      })
    ).toBe('Something went wrong')
  })
})
