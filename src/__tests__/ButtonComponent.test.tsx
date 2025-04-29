import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ButtonComponent, ButtonStyle } from '../components/ui/ButtonComponent'

describe('ButtonComponent', () => {
  it('renders the button with the given text', () => {
    render(<ButtonComponent text="Click me" style={ButtonStyle.PRIMARY} />)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies the primary button style when ButtonStyle.PRIMARY is used', () => {
    const { container } = render(<ButtonComponent text="Primary" style={ButtonStyle.PRIMARY} />)
    expect(container.firstChild).toHaveClass('button-primary')
  })

  it('applies the secondary button style when ButtonStyle.SECONDARY is used', () => {
    const { container } = render(<ButtonComponent text="Secondary" style={ButtonStyle.SECONDARY} />)
    expect(container.firstChild).toHaveClass('button-secondary')
  })

  it('calls onClick when the button is clicked', () => {
    const handleClick = jest.fn()
    render(<ButtonComponent text="Click me" style={ButtonStyle.PRIMARY} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button', { name: /click me/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
