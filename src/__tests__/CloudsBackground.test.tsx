import React from 'react'
import { render } from '@testing-library/react'
import CloudsBackground from '../components/ui/CloudsBackground'

describe('CloudsBackground', () => {
  it('renders without crashing', () => {
    render(<CloudsBackground />)
  })
})
