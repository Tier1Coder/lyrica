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
import { POST } from '@/app/api/contact/route'

const mockCreateRouteClient = createRouteClient as jest.MockedFunction<typeof createRouteClient>
const mockSafeErrorMessage = safeErrorMessage as jest.MockedFunction<typeof safeErrorMessage>

describe('/api/contact', () => {
  let mockSupabaseClient: any
  let mockInsert: jest.MockedFunction<any>

  beforeEach(() => {
    jest.clearAllMocks()

    mockInsert = jest.fn()
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        insert: mockInsert,
      })),
    }

    mockCreateRouteClient.mockResolvedValue(mockSupabaseClient)
    mockSafeErrorMessage.mockReturnValue('Error, please try again.')
  })

  describe('POST', () => {
    it('should create contact message successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockInsert.mockResolvedValue({})

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Test User',
          message: 'This is a test message',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ ok: true })
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages')
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message',
        user_id: 'user-123',
      })
    })

    it('should return 400 for invalid input', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: '',
          message: 'Valid message',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid input' })
    })

    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Test User',
          message: 'Valid message',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Authentication required' })
    })

    it('should return 400 when user has no email', async () => {
      const mockUser = {
        id: 'user-123',
        email: null,
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Test User',
          message: 'Valid message',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'User email not found' })
    })

    it('should return 500 when database insert fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockInsert.mockResolvedValue({ error: new Error('Database error') })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Test User',
          message: 'Valid message',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Error, please try again.' })
      expect(mockSafeErrorMessage).toHaveBeenCalled()
    })

    it('should handle malformed JSON', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Error, please try again.' })
    })
  })
})