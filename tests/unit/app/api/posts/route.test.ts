// Mock dependencies
jest.mock('@/lib/supabase/route')
jest.mock('@/lib/utils')
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}))

import { createRouteClient } from '@/lib/supabase/route'
import { safeErrorMessage } from '@/lib/utils'
import { GET, POST } from '@/app/api/posts/route'

const mockCreateRouteClient = createRouteClient as jest.MockedFunction<typeof createRouteClient>
const mockSafeErrorMessage = safeErrorMessage as jest.MockedFunction<typeof safeErrorMessage>

describe('/api/posts', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    }

    mockCreateRouteClient.mockResolvedValue(mockSupabaseClient)
    mockSafeErrorMessage.mockReturnValue('Error, please try again.')
  })

  describe('GET', () => {
    it('should return posts successfully', async () => {
      const mockPosts = [
        { id: 1, title: 'Test Post', published_at: '2023-01-01', inserted_at: '2023-01-01' },
        { id: 2, title: 'Another Post', published_at: null, inserted_at: '2023-01-02' },
      ]

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockPosts, error: null }),
      })

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPosts)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('posts')
      expect(mockSelect).toHaveBeenCalledWith('id,title,published_at,inserted_at')
    })

    it('should return 500 when database query fails', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
      })

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Error, please try again.' })
      expect(mockSafeErrorMessage).toHaveBeenCalled()
    })
  })

  describe('POST', () => {
    it('should create post successfully', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
        }),
      })

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Post',
          content: 'Test content',
          publish: true,
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ id: 1 })
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('posts')
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user-123',
        published_at: expect.any(String),
      })
    })

    it('should create unpublished post when publish is false', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 2 }, error: null }),
        }),
      })

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Draft Post',
          content: 'Draft content',
          publish: false,
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ id: 2 })
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Draft Post',
        content: 'Draft content',
        author_id: 'user-123',
        published_at: null,
      })
    })

    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Post',
          content: 'Test content',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should return 400 for invalid input', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: '',
          content: 'Valid content',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid input',
        details: ['title: Too small: expected string to have >=1 characters'],
      })
    })

    it('should return 500 when table not found', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST205', message: 'Could not find the table' }
          }),
        }),
      })

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Post',
          content: 'Test content',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Database table not found. Please run the database setup script in your Supabase dashboard.',
        setup_required: true,
      })
    })

    it('should return 500 when database insert fails', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error')
          }),
        }),
      })

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Post',
          content: 'Test content',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Error, please try again.',
        details: undefined,
      })
      expect(mockSafeErrorMessage).toHaveBeenCalled()
    })

    it('should handle malformed JSON', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Error, please try again.',
        details: undefined,
      })
    })
  })
})