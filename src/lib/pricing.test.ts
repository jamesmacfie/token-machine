import { describe, it, expect } from 'vitest'
import { tokensFor } from './pricing'

describe('tokensFor', () => {
  it('$100 at $1/1M in & out, 50/50 -> 100M tokens', () => {
    expect(tokensFor({ salaryUSD: 100, costIn: 1, costOut: 1, ratioIn: 0.5 })).toBe(100_000_000)
  })

  it('leans toward the cheaper side as ratio shifts', () => {
    const args = { salaryUSD: 100, costIn: 10, costOut: 1 } // input pricier
    const moreOutput = tokensFor({ ...args, ratioIn: 0.1 })
    const moreInput = tokensFor({ ...args, ratioIn: 0.9 })
    expect(moreOutput).toBeGreaterThan(moreInput) // more of the cheap (output) side = more tokens
  })

  it('free model -> Infinity (filtered out in UI)', () => {
    expect(tokensFor({ salaryUSD: 100, costIn: 0, costOut: 0, ratioIn: 0.5 })).toBe(Infinity)
  })
})
