import { isEmail, safeErrorMessage } from '../lib/utils'

describe('utils', () => {
  describe('isEmail', () => {
    it('should return true for valid email', () => {
      expect(isEmail('test@example.com')).toBe(true)
      expect(isEmail('user.name+tag@example.co.uk')).toBe(true)
    })

    it('should return false for invalid email', () => {
      expect(isEmail('invalid')).toBe(false)
      expect(isEmail('test@')).toBe(false)
      expect(isEmail('@example.com')).toBe(false)
      expect(isEmail('test.example.com')).toBe(false)
      expect(isEmail('')).toBe(false)
    })
  })

  describe('safeErrorMessage', () => {
    it('should return the safe error message', () => {
      expect(safeErrorMessage()).toBe('Error, please try again.')
    })
  })
})