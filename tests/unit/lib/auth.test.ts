// Mocks must be set up before imports
jest.mock('next/navigation')
jest.mock('@/lib/supabase/server')

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { requireSession, requireUser, requireAdmin, isAdmin, isModerator, getUserRole } from '@/lib/auth'

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>

// Make redirect throw an error (as it does in Next.js)
mockRedirect.mockImplementation(() => {
  throw new Error('NEXT_REDIRECT')
})

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(),
}

mockCreateServerClient.mockResolvedValue(mockSupabaseClient as any)

// Helper to create mock query chain
const createMockQuery = (result: any) => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve(result)),
    })),
  })),
})

describe('auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRedirect.mockClear()
  })

  describe('requireSession', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = { user: { id: '123' } }
      mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: mockSession } })

      const result = await requireSession()

      expect(result).toBe(mockSession)
      expect(mockCreateServerClient).toHaveBeenCalledTimes(1)
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledTimes(1)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect to login when no session exists', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: null } })

      await expect(requireSession()).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('requireUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await requireUser()

      expect(result).toBe(mockUser)
      expect(mockCreateServerClient).toHaveBeenCalledTimes(1)
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect to login when no user exists', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      await expect(requireUser()).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should redirect to login when there is an error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') })

      await expect(requireUser()).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('requireAdmin', () => {
    it('should return user when user is admin', async () => {
      const mockUser = { id: '123', email: 'admin@example.com' }
      const mockProfile = { role: 'admin' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: mockProfile, error: null }))

      const result = await requireAdmin()

      expect(result).toBe(mockUser)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect to dashboard when user is not admin', async () => {
      const mockUser = { id: '123', email: 'user@example.com' }
      const mockProfile = { role: 'user' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: mockProfile, error: null }))

      await expect(requireAdmin()).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })

    it('should redirect to dashboard when profile not found', async () => {
      const mockUser = { id: '123', email: 'user@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: null, error: new Error('Not found') }))

      await expect(requireAdmin()).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('isAdmin', () => {
    it('should return true when user is admin', async () => {
      const mockUser = { id: '123', email: 'admin@example.com' }
      const mockProfile = { role: 'admin' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: mockProfile, error: null }))

      const result = await isAdmin()

      expect(result).toBe(true)
    })

    it('should return false when user is not admin', async () => {
      const mockUser = { id: '123', email: 'user@example.com' }
      const mockProfile = { role: 'user' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: mockProfile, error: null }))

      const result = await isAdmin()

      expect(result).toBe(false)
    })

    it('should return false when profile not found', async () => {
      const mockUser = { id: '123', email: 'user@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: null, error: new Error('Not found') }))

      const result = await isAdmin()

      expect(result).toBe(false)
    })

    it('should return false when checking different user id', async () => {
      const mockUser = { id: '123', email: 'user@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await isAdmin('456')

      expect(result).toBe(false)
    })
  })

  describe('isModerator', () => {
    it('should return true when user is admin', async () => {
      const mockUser = { id: '123', email: 'admin@example.com' }
      const mockProfile = { role: 'admin' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: mockProfile, error: null }))

      const result = await isModerator()

      expect(result).toBe(true)
    })

    it('should return true when user is moderator', async () => {
      const mockUser = { id: '123', email: 'mod@example.com' }
      const mockProfile = { role: 'moderator' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: mockProfile, error: null }))

      const result = await isModerator()

      expect(result).toBe(true)
    })

    it('should return false when user is regular user', async () => {
      const mockUser = { id: '123', email: 'user@example.com' }
      const mockProfile = { role: 'user' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: mockProfile, error: null }))

      const result = await isModerator()

      expect(result).toBe(false)
    })
  })

  describe('getUserRole', () => {
    it('should return user role when profile exists', async () => {
      const mockUser = { id: '123', email: 'user@example.com' }
      const mockProfile = { role: 'moderator' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: mockProfile, error: null }))

      const result = await getUserRole()

      expect(result).toBe('moderator')
    })

    it('should return user when profile not found', async () => {
      const mockUser = { id: '123', email: 'user@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabaseClient.from.mockReturnValue(createMockQuery({ data: null, error: new Error('Not found') }))

      const result = await getUserRole()

      expect(result).toBe('user')
    })
  })
})