import features, { Features } from '@/config/features'

describe('features config', () => {
  it('should export features object with correct structure', () => {
    expect(features).toEqual({
      useCalendar: true,
      useMaps: true,
      useBlog: true,
      useContact: true,
      useBookings: true,
    })
  })

  it('should have all expected feature flags', () => {
    expect(features).toHaveProperty('useCalendar')
    expect(features).toHaveProperty('useMaps')
    expect(features).toHaveProperty('useBlog')
    expect(features).toHaveProperty('useContact')
    expect(features).toHaveProperty('useBookings')
  })

  it('should have boolean values for all features', () => {
    Object.values(features).forEach(value => {
      expect(typeof value).toBe('boolean')
    })
  })

  it('should export Features type that matches the features object', () => {
    const featuresTypeTest: Features = {
      useCalendar: true,
      useMaps: true,
      useBlog: true,
      useContact: true,
      useBookings: true,
    }
    expect(featuresTypeTest).toBeDefined()
  })
})