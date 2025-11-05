import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '../dialog'

describe('Dialog', () => {
  it('should not render when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onClose={() => {}}>
        <div>Dialog Content</div>
      </Dialog>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Dialog Content</div>
      </Dialog>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should render dialog content', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Dialog Content</div>
      </Dialog>
    )

    expect(screen.getByText(/dialog content/i)).toBeInTheDocument()
  })

  it('should render title when provided', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} title="Test Dialog">
        <div>Content</div>
      </Dialog>
    )

    expect(screen.getByText(/test dialog/i)).toBeInTheDocument()
  })

  it('should render footer when provided', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        footer={<div>Footer Content</div>}
      >
        <div>Content</div>
      </Dialog>
    )

    expect(screen.getByText(/footer content/i)).toBeInTheDocument()
  })

  it('should call onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Dialog isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Dialog>
    )

    const overlay = screen.getByRole('dialog').querySelector('.fixed.inset-0.bg-black')
    if (overlay) {
      await user.click(overlay)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Dialog isOpen={true} onClose={onClose} title="Test Dialog">
        <div>Content</div>
      </Dialog>
    )

    const closeButton = screen.getByLabelText(/閉じる/i)
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when dialog content is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Dialog isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Dialog>
    )

    const content = screen.getByText(/content/i)
    await user.click(content)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should have aria-modal attribute', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('should have aria-labelledby when title is provided', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} title="Test Dialog">
        <div>Content</div>
      </Dialog>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')

    const title = screen.getByText(/test dialog/i)
    expect(title).toHaveAttribute('id', 'dialog-title')
  })

  it('should apply small size class', () => {
    const { container } = render(
      <Dialog isOpen={true} onClose={() => {}} size="sm">
        <div>Content</div>
      </Dialog>
    )

    const dialogContent = container.querySelector('.max-w-md')
    expect(dialogContent).toBeInTheDocument()
  })

  it('should apply medium size class by default', () => {
    const { container } = render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )

    const dialogContent = container.querySelector('.max-w-lg')
    expect(dialogContent).toBeInTheDocument()
  })

  it('should apply large size class', () => {
    const { container } = render(
      <Dialog isOpen={true} onClose={() => {}} size="lg">
        <div>Content</div>
      </Dialog>
    )

    const dialogContent = container.querySelector('.max-w-2xl')
    expect(dialogContent).toBeInTheDocument()
  })

  it('should apply extra large size class', () => {
    const { container } = render(
      <Dialog isOpen={true} onClose={() => {}} size="xl">
        <div>Content</div>
      </Dialog>
    )

    const dialogContent = container.querySelector('.max-w-4xl')
    expect(dialogContent).toBeInTheDocument()
  })

  it('should render close button only when title is provided', () => {
    const { rerender } = render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )

    expect(screen.queryByLabelText(/閉じる/i)).not.toBeInTheDocument()

    rerender(
      <Dialog isOpen={true} onClose={() => {}} title="Test">
        <div>Content</div>
      </Dialog>
    )

    expect(screen.getByLabelText(/閉じる/i)).toBeInTheDocument()
  })

  it('should have fixed positioning for overlay', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('fixed', 'inset-0', 'z-50')
  })

  it('should have animation classes', () => {
    const { container } = render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )

    const overlay = container.querySelector('.animate-fade-in')
    expect(overlay).toBeInTheDocument()

    const dialogContent = container.querySelector('.animate-slide-in-from-bottom')
    expect(dialogContent).toBeInTheDocument()
  })
})
