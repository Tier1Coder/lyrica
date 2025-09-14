import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '@/components/ui/Input'

describe('Input', () => {
  it('should render with default props', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('w-full', 'rounded-md', 'border', 'border-gray-300')
  })

  it('should render with custom className', () => {
    render(<Input className="custom-class" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('should forward other props to input element', () => {
    render(<Input type="email" placeholder="Enter email" required />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
    expect(input).toHaveAttribute('required')
  })

  it('should handle user input', async () => {
    const user = userEvent.setup()
    render(<Input />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'test input')

    expect(input).toHaveValue('test input')
  })

  it('should forward ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)

    expect(ref).toHaveBeenCalled()
  })
})