import React from 'react'
import { render, screen } from '@testing-library/react'
import ContainerEventTitle from '../components/ui/ContainerEventTitle'

describe('ContainerEventTitle', () => {
  it('renders the title text', () => {
    render(<ContainerEventTitle title="Test Event" />)
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('renders the event icon image', () => {
    render(<ContainerEventTitle title="Test Event" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/illustrations/parachute.png')
  })
})
