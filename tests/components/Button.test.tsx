import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../../components/ui/Button'

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toHaveClass('bg-secondary')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toHaveClass('bg-transparent')
  })

  it('renders with danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByRole('button', { name: /danger/i })
    expect(button).toHaveClass('bg-danger')
  })

  it('passes other props to button', () => {
    render(<Button type="submit" disabled>Submit</Button>)
    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeDisabled()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    const button = screen.getByRole('button', { name: /click/i })
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: /custom/i })
    expect(button).toHaveClass('custom-class')
  })
})