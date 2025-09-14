import { describe, it, expect } from 'vitest'
import { isEmail, safeErrorMessage } from '../lib/utils'

describe('lib/utils', () => {
  it('isEmail validates emails and rejects invalid strings', () => {
    expect(isEmail('test@example.com')).toBe(true)
    expect(isEmail('invalid-email')).toBe(false)
    expect(isEmail('a@b.c')).toBe(true)
    expect(isEmail('')).toBe(false)
  })

  it('safeErrorMessage returns a stable message', () => {
    expect(safeErrorMessage()).toBe('Error, please try again.')
  })
})
