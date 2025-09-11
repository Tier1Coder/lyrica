const features = {
  // Toggle optional modules here. Set to false to disable.
  useCalendar: true,
  useMaps: true,
  useBlog: true,
  useContact: true,
  useBookings: true,
} as const

export type Features = typeof features
export default features
