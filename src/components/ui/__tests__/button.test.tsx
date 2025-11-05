import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onPress when clicked', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()

    render(<Button onPress={onPress}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should not call onPress when disabled', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()

    render(
      <Button onPress={onPress} isDisabled>
        Click me
      </Button>
    )

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(onPress).not.toHaveBeenCalled()
  })

  it('should apply primary variant styles by default', () => {
    render(<Button>Primary Button</Button>)
    const button = screen.getByRole('button', { name: /primary button/i })
    expect(button).toHaveClass('bg-blue-600')
  })

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button', { name: /secondary button/i })
    expect(button).toHaveClass('bg-gray-200')
  })

  it('should apply danger variant styles', () => {
    render(<Button variant="danger">Danger Button</Button>)
    const button = screen.getByRole('button', { name: /danger button/i })
    expect(button).toHaveClass('bg-red-600')
  })

  it('should apply ghost variant styles', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    const button = screen.getByRole('button', { name: /ghost button/i })
    expect(button).toHaveClass('bg-transparent')
  })

  it('should apply medium size styles by default', () => {
    render(<Button>Medium Button</Button>)
    const button = screen.getByRole('button', { name: /medium button/i })
    expect(button).toHaveClass('px-4', 'py-2', 'text-base')
  })

  it('should apply small size styles', () => {
    render(<Button size="sm">Small Button</Button>)
    const button = screen.getByRole('button', { name: /small button/i })
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
  })

  it('should apply large size styles', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button', { name: /large button/i })
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    const button = screen.getByRole('button', { name: /custom button/i })
    expect(button).toHaveClass('custom-class')
  })

  it('should have button type by default', () => {
    render(<Button>Button</Button>)
    const button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should support submit type', () => {
    render(<Button type="submit">Submit</Button>)
    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should support reset type', () => {
    render(<Button type="reset">Reset</Button>)
    const button = screen.getByRole('button', { name: /reset/i })
    expect(button).toHaveAttribute('type', 'reset')
  })

  it('should be disabled when isDisabled prop is true', () => {
    render(<Button isDisabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  it('should have disabled opacity when disabled', () => {
    render(<Button isDisabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('should have base styles', () => {
    render(<Button>Styled Button</Button>)
    const button = screen.getByRole('button', { name: /styled button/i })
    expect(button).toHaveClass(
      'font-medium',
      'rounded-lg',
      'transition-colors',
      'focus:outline-none'
    )
  })

  it('should be accessible via keyboard', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()

    render(<Button onPress={onPress}>Keyboard Button</Button>)

    const button = screen.getByRole('button', { name: /keyboard button/i })
    button.focus()
    expect(button).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should support space key activation', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()

    render(<Button onPress={onPress}>Space Button</Button>)

    const button = screen.getByRole('button', { name: /space button/i })
    button.focus()

    await user.keyboard('{ }')
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
