// Calculation logic for the investment calculator. Kept separate from the UI so it is easy to test.
const DAY = 86400000 // milliseconds in one day

// Turn "2026-01-31" into a date at midnight UTC
export function toUtc(text) {
  return new Date(text + 'T00:00:00Z')
}

// Make the list of days when the user buys.
// frequency: 'weekly' (every 7 days) or 'monthly' (same day each month)
export function buyDates(startText, endText, frequency) {
  const start = toUtc(startText)
  const end = toUtc(endText)
  const dates = []

  if (frequency === 'weekly') {
    for (let t = start.getTime(); t <= end.getTime(); t += 7 * DAY) dates.push(new Date(t))
    return dates
  }

  // Monthly: if a month is shorter (for example 31 Jan -> February), use its last day
  for (let i = 0; ; i++) {
    const first = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1))
    const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
    first.setUTCDate(Math.min(start.getUTCDate(), lastDay))
    if (first > end) break
    dates.push(first)
  }
  return dates
}

// Find the price closest to a given time.
// prices is a list like [[timestamp, price], [timestamp, price], ...]
export function closestPrice(prices, time) {
  let best = prices[0]
  for (const p of prices) {
    if (Math.abs(p[0] - time) < Math.abs(best[0] - time)) best = p
  }
  return best[1]
}

// Main calculation. Buys "amount" on every date, then values everything at the latest price.
export function runDca(prices, dates, amount) {
  const currentPrice = prices[prices.length - 1][1] // latest price = "today"
  let coins = 0
  let invested = 0

  // One row per purchase, with running totals for the table and the chart
  const rows = dates.map(d => {
    const price = closestPrice(prices, d.getTime())
    const bought = amount / price // coins bought on this day
    coins += bought
    invested += amount
    return { date: d.toISOString().slice(0, 10), price, bought, invested, coins, value: coins * price }
  })

  const currentValue = coins * currentPrice
  const profit = currentValue - invested
  return { rows, invested, coins, currentPrice, currentValue, profit, profitPct: invested ? (profit / invested) * 100 : 0 }
}
