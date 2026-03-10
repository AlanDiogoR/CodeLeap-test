import { describe, it, expect } from 'vitest'
import { USERNAME_REGEX, SANITIZE_REGEX } from './validation'

describe('USERNAME_REGEX', () => {
  it('allows alphanumeric characters', () => {
    expect('john').toMatch(USERNAME_REGEX)
    expect('user123').toMatch(USERNAME_REGEX)
    expect('JohnDoe').toMatch(USERNAME_REGEX)
  })

  it('allows spaces', () => {
    expect('john doe').toMatch(USERNAME_REGEX)
    expect('  ').toMatch(USERNAME_REGEX)
  })

  it('allows underscore and hyphen', () => {
    expect('john_doe').toMatch(USERNAME_REGEX)
    expect('john-doe').toMatch(USERNAME_REGEX)
  })

  it('rejects angle brackets (XSS)', () => {
    expect('john<script>').not.toMatch(USERNAME_REGEX)
    expect('<script>alert(1)</script>').not.toMatch(USERNAME_REGEX)
    expect('user<>').not.toMatch(USERNAME_REGEX)
  })

  it('rejects special characters', () => {
    expect('john@email.com').not.toMatch(USERNAME_REGEX)
    expect('user!').not.toMatch(USERNAME_REGEX)
    expect('user#').not.toMatch(USERNAME_REGEX)
    expect('user$').not.toMatch(USERNAME_REGEX)
    expect("o'brien").not.toMatch(USERNAME_REGEX)
  })
})

describe('SANITIZE_REGEX', () => {
  it('matches angle brackets', () => {
    expect('<script>').toMatch(SANITIZE_REGEX)
    expect('a<b>c').toMatch(SANITIZE_REGEX)
  })

  it('does not match safe characters', () => {
    expect('hello world').not.toMatch(SANITIZE_REGEX)
    expect('user123').not.toMatch(SANITIZE_REGEX)
  })
})
