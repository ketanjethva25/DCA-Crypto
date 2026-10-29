// Tests for the calculation. Run with: npm test
import { describe, it, expect } from 'vitest'
import { buyDates, runDca } from './calc'

describe('buyDates', () => {
  it('makes weekly dates', () => expect(buyDates('2026-01-01', '2026-01-29', 'weekly')).toHaveLength(5))
  it('uses the last day of short months', () => {
    const d = buyDates('2026-01-31', '2026-04-30', 'monthly').map(x => x.toISOString().slice(0, 10))
    expect(d).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30'])
  })
})

describe('runDca', () => {
  it('calculates coins, value and profit', () => {
    const DAY = 86400000
    const prices = [[0, 100], [DAY, 200]] // price doubles
    const r = runDca(prices, [new Date(0)], 100) // buy 100 on day 0
    expect(r.coins).toBe(1)
    expect(r.currentValue).toBe(200)
    expect(r.profit).toBe(100)
    expect(r.profitPct).toBe(100)
  })
})
