import { render, screen } from '@testing-library/react'
import FeatureGate from '../../components/ui/FeatureGate'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn().mockImplementation(() => {
    throw new Error('Not found')
  }),
}))

describe('FeatureGate', () => {
  it('renders children if enabled', () => {
    render(<FeatureGate enabled={true}><div>Test</div></FeatureGate>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('calls notFound if not enabled', () => {
    expect(() => render(<FeatureGate enabled={false}><div>Test</div></FeatureGate>)).toThrow('Not found')
  })
})