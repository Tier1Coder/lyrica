import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '../../components/ui/Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('passes props to input', () => {
    render(<Input type="email" placeholder="Enter email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    render(<Input />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    expect(input).toHaveValue('test')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })
})