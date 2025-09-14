import { requireSession, requireUser, requireAdmin, isAdmin, isModerator, getUserRole } from '../lib/auth'
import { redirect } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url) => {
    throw new Error(`Redirect to ${url}`)
  }),
}))

// Mock the supabase server client
jest.mock('../lib/supabase/server', () => ({
  createServerClient: jest.fn(),
}))

const mockCreateServerClient = require('../lib/supabase/server').createServerClient
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('requireSession', () => {
    it('should redirect to /login if no session', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      await expect(requireSession()).rejects.toThrow()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should return session if exists', async () => {
      const mockSession = { user: { id: '1' } }
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await requireSession()
      expect(result).toBe(mockSession)
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('requireUser', () => {
    it('should redirect to /login if no user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('No user') }),
        },
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      await expect(requireUser()).rejects.toThrow()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should return user if exists', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await requireUser()
      expect(result).toBe(mockUser)
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('requireAdmin', () => {
    it('should redirect if not admin', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      await expect(requireAdmin()).rejects.toThrow()
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })

    it('should return user if admin', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await requireAdmin()
      expect(result).toBe(mockUser)
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('isAdmin', () => {
    it('should return false if no user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await isAdmin('1')
      expect(result).toBe(false)
    })

    it('should return false if not admin', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await isAdmin('1')
      expect(result).toBe(false)
    })

    it('should return true if admin', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await isAdmin('1')
      expect(result).toBe(true)
    })
  })

  // Similar for isModerator and getUserRole, but to save time, I'll add basic ones

  describe('isModerator', () => {
    it('should return true if admin', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await isModerator('1')
      expect(result).toBe(true)
    })

    it('should return true if moderator', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'moderator' }, error: null }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await isModerator('1')
      expect(result).toBe(true)
    })

    it('should return false if user', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await isModerator('1')
      expect(result).toBe(false)
    })
  })

  describe('getUserRole', () => {
    it('should return user if no profile', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await getUserRole('1')
      expect(result).toBe('user')
    })

    it('should return role if exists', async () => {
      const mockUser = { id: '1' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            }),
          }),
        }),
      }
      mockCreateServerClient.mockResolvedValue(mockSupabase)

      const result = await getUserRole('1')
      expect(result).toBe('admin')
    })
  })
})