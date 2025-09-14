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
import { GET, POST } from '@/app/api/events/route'

const mockCreateRouteClient = createRouteClient as jest.MockedFunction<typeof createRouteClient>
const mockSafeErrorMessage = safeErrorMessage as jest.MockedFunction<typeof safeErrorMessage>

describe('/api/events', () => {
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
    it('should return events successfully', async () => {
      const mockUser = {
        id: 'user-123',
      }

      const mockEvents = [
        { id: 1, title: 'Test Event', event_date: '2023-01-01', description: 'Test description', user_id: 'user-123' },
        { id: 2, title: 'Another Event', event_date: '2023-01-02', description: null, user_id: 'user-123' },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockEvents, error: null }),
      })

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockEvents)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events')
      expect(mockSelect).toHaveBeenCalledWith('*')
    })

    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should return 500 when database query fails', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

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
    it('should create event successfully', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockResolvedValue({ error: null })

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Event',
          date: '2023-12-25T10:00:00Z',
          description: 'Test event description',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ ok: true })
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events')
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Test Event',
        event_date: '2023-12-25T10:00:00Z',
        description: 'Test event description',
        user_id: 'user-123',
      })
    })

    it('should create event with null description', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockResolvedValue({ error: null })

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Event without description',
          date: '2023-12-25T10:00:00Z',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ ok: true })
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Event without description',
        event_date: '2023-12-25T10:00:00Z',
        description: null,
        user_id: 'user-123',
      })
    })

    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Event',
          date: '2023-12-25T10:00:00Z',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should return 400 for invalid input - empty title', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: '',
          date: '2023-12-25T10:00:00Z',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid input' })
    })

    it('should return 400 for invalid input - invalid date', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Event',
          date: 'invalid-date',
        }),
      }

      const response = await POST(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid input' })
    })

    it('should return 500 when database insert fails', async () => {
      const mockUser = {
        id: 'user-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockResolvedValue({ error: new Error('Database error') })

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      })

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Event',
          date: '2023-12-25T10:00:00Z',
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