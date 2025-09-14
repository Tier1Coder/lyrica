import { render } from '@testing-library/react'
import FeatureGate from '@/components/ui/FeatureGate'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

describe('FeatureGate', () => {
  it('should render children when enabled is true', () => {
    const { getByText } = render(
      <FeatureGate enabled={true}>
        <div>Test Content</div>
      </FeatureGate>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('should call notFound when enabled is false', () => {
    expect(() => {
      render(
        <FeatureGate enabled={false}>
          <div>Test Content</div>
        </FeatureGate>
      )
    }).toThrow('NEXT_NOT_FOUND')
  })
})