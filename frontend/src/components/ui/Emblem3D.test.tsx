import { render, screen } from '@testing-library/react'
import { Wallet } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { Emblem3D } from './Emblem3D'

describe('Emblem3D component', () => {
  it('renders with an icon and default styling', () => {
    const { container } = render(<Emblem3D icon={Wallet} data-testid="emblem" />)
    const emblem = screen.getByTestId('emblem')
    expect(emblem).toBeInTheDocument()
    expect(emblem).toHaveClass('emblem-3d', 'emblem-indigo')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Emblem3D variant="emerald" data-testid="emblem" />)
    expect(screen.getByTestId('emblem')).toHaveClass('emblem-emerald')

    rerender(<Emblem3D variant="rose" data-testid="emblem" />)
    expect(screen.getByTestId('emblem')).toHaveClass('emblem-rose')

    rerender(<Emblem3D variant="violet" data-testid="emblem" />)
    expect(screen.getByTestId('emblem')).toHaveClass('emblem-violet')

    rerender(<Emblem3D variant="cyan" data-testid="emblem" />)
    expect(screen.getByTestId('emblem')).toHaveClass('emblem-cyan')
  })

  it('applies floating and pulse animations when configured', () => {
    render(<Emblem3D floating pulse data-testid="emblem" />)
    const emblem = screen.getByTestId('emblem')
    expect(emblem).toHaveClass('animate-float-subtle', 'animate-pulse-glow')
  })

  it('renders custom children when no icon is provided', () => {
    render(
      <Emblem3D data-testid="emblem">
        <span data-testid="custom-child">VIP</span>
      </Emblem3D>
    )
    expect(screen.getByTestId('custom-child')).toBeInTheDocument()
  })
})
