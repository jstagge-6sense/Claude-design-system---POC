import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('exposes role status with an accessible name', () => {
    render(<Spinner accessibleLabel="Loading segments" />)
    expect(screen.getByRole('status', { name: 'Loading segments' })).toBeTruthy()
  })
})
