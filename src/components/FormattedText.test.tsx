import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormattedText } from './FormattedText'

describe('FormattedText', () => {
  it('renders plain text without mentions', () => {
    render(<FormattedText text="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders text with @mention as styled span', () => {
    render(<FormattedText text="Hi @john!" />)
    expect(screen.getByText('@john')).toBeInTheDocument()
    expect(screen.getByText('Hi ')).toBeInTheDocument()
    expect(screen.getByText('!')).toBeInTheDocument()
  })

  it('renders multiple mentions', () => {
    render(<FormattedText text="@alice and @bob" />)
    expect(screen.getByText('@alice')).toBeInTheDocument()
    expect(screen.getByText(' and ')).toBeInTheDocument()
    expect(screen.getByText('@bob')).toBeInTheDocument()
  })
})
