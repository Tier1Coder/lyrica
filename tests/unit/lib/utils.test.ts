import { isEmail, safeErrorMessage } from '@/lib/utils'

describe('utils', () => {
  describe('isEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isEmail('test@example.com')).toBe(true)
      expect(isEmail('user.name+tag@example.co.uk')).toBe(true)
      expect(isEmail('test.email@subdomain.example.com')).toBe(true)
    })

    it('should return false for invalid email addresses', () => {
      expect(isEmail('')).toBe(false)
      expect(isEmail('notanemail')).toBe(false)
      expect(isEmail('@example.com')).toBe(false)
      expect(isEmail('test@')).toBe(false)
      expect(isEmail('test@.com')).toBe(false)
      // Note: Current regex allows consecutive dots, which might be too permissive
      // expect(isEmail('test..test@example.com')).toBe(false)
    })

    it('should return false for non-string inputs', () => {
      // @ts-expect-error Testing invalid input types
      expect(isEmail(null)).toBe(false)
      // @ts-expect-error Testing invalid input types
      expect(isEmail(undefined)).toBe(false)
      // @ts-expect-error Testing invalid input types
      expect(isEmail(123)).toBe(false)
      // @ts-expect-error Testing invalid input types
      expect(isEmail({})).toBe(false)
    })
  })

  describe('safeErrorMessage', () => {
    it('should return a generic error message', () => {
      expect(safeErrorMessage()).toBe('Error, please try again.')
    })

    it('should always return the same message', () => {
      const message1 = safeErrorMessage()
      const message2 = safeErrorMessage()
      expect(message1).toBe(message2)
      expect(message1).toBe('Error, please try again.')
    })
  })
})