import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextField } from '../text-field'

describe('TextField', () => {
  it('should render input field', () => {
    render(<TextField placeholder="Enter text" />)
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<TextField id="test-input" label="Test Label" />)
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument()
  })

  it('should show required asterisk when required', () => {
    render(<TextField id="test-input" label="Test Label" required />)
    const label = screen.getByText(/test label/i).closest('label')
    expect(label?.textContent).toContain('*')
  })

  it('should accept user input', async () => {
    const user = userEvent.setup()
    render(<TextField placeholder="Enter text" />)

    const input = screen.getByPlaceholderText(/enter text/i)
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
  })

  it('should call onChange handler', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TextField placeholder="Enter text" onChange={onChange} />)

    const input = screen.getByPlaceholderText(/enter text/i)
    await user.type(input, 'a')

    expect(onChange).toHaveBeenCalled()
  })

  it('should display error message', () => {
    render(
      <TextField
        id="test-input"
        label="Test Label"
        error="This field is required"
      />
    )

    expect(screen.getByText(/this field is required/i)).toBeInTheDocument()
  })

  it('should have error styles when error is present', () => {
    render(
      <TextField
        id="test-input"
        label="Test Label"
        error="This field is required"
      />
    )

    const input = screen.getByLabelText(/test label/i)
    expect(input).toHaveClass('border-red-300')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('should display helper text', () => {
    render(
      <TextField
        id="test-input"
        label="Test Label"
        helperText="Enter your email address"
      />
    )

    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument()
  })

  it('should not display helper text when error is present', () => {
    render(
      <TextField
        id="test-input"
        label="Test Label"
        error="Error message"
        helperText="Helper text"
      />
    )

    expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument()
    expect(screen.getByText(/error message/i)).toBeInTheDocument()
  })

  it('should render left icon', () => {
    render(
      <TextField
        placeholder="Search"
        leftIcon={<span data-testid="left-icon">🔍</span>}
      />
    )

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('should render right icon', () => {
    render(
      <TextField
        placeholder="Password"
        rightIcon={<span data-testid="right-icon">👁️</span>}
      />
    )

    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('should apply left padding when left icon is present', () => {
    render(
      <TextField
        placeholder="Search"
        leftIcon={<span data-testid="left-icon">🔍</span>}
      />
    )

    const input = screen.getByPlaceholderText(/search/i)
    expect(input).toHaveClass('pl-10')
  })

  it('should apply right padding when right icon is present', () => {
    render(
      <TextField
        placeholder="Password"
        rightIcon={<span data-testid="right-icon">👁️</span>}
      />
    )

    const input = screen.getByPlaceholderText(/password/i)
    expect(input).toHaveClass('pr-10')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<TextField placeholder="Enter text" disabled />)

    const input = screen.getByPlaceholderText(/enter text/i)
    expect(input).toBeDisabled()
    expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed')
  })

  it('should accept custom className', () => {
    render(<TextField placeholder="Enter text" className="custom-class" />)

    const input = screen.getByPlaceholderText(/enter text/i)
    expect(input).toHaveClass('custom-class')
  })

  it('should forward ref to input element', () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement>
    render(<TextField ref={ref} placeholder="Enter text" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should support different input types', () => {
    render(<TextField type="email" placeholder="Enter email" />)

    const input = screen.getByPlaceholderText(/enter email/i)
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should have proper aria attributes', () => {
    render(
      <TextField
        id="test-input"
        label="Test Label"
        error="Error message"
      />
    )

    const input = screen.getByLabelText(/test label/i)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('should link error message with input via aria-describedby', () => {
    render(
      <TextField
        id="test-input"
        label="Test Label"
        error="Error message"
      />
    )

    const input = screen.getByLabelText(/test label/i)
    const errorMessage = screen.getByRole('alert')

    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
    expect(errorMessage).toHaveAttribute('id', 'test-input-error')
  })

  it('should have role alert for error message', () => {
    render(
      <TextField
        id="test-input"
        label="Test Label"
        error="Error message"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent(/error message/i)
  })
})
