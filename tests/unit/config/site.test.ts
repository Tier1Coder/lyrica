import site from '@/config/site'

describe('site config', () => {
  it('should export site configuration object', () => {
    expect(site).toEqual({
      name: 'Lyrica Template',
      description: 'Modular Next.js template with Supabase and Tailwind',
      nav: {
        homeLabel: 'Home',
      }
    })
  })

  it('should have required properties', () => {
    expect(site).toHaveProperty('name')
    expect(site).toHaveProperty('description')
    expect(site).toHaveProperty('nav')
    expect(site.nav).toHaveProperty('homeLabel')
  })

  it('should have string values for text properties', () => {
    expect(typeof site.name).toBe('string')
    expect(typeof site.description).toBe('string')
    expect(typeof site.nav.homeLabel).toBe('string')
  })
})