// Serverless function on Vercel.
// URL: /api/history?coin=bitcoin&currency=inr&from=2026-01-01
// It returns daily prices from the "from" date until now.
// Why a function? It keeps the API key private and lets us cache answers.
const DAY = 86400

// Explains a CoinGecko error in simple words (the real reason is also printed in the terminal)
function explain(status) {
  if (status === 401 || status === 403) return 'CoinGecko rejected the request. Check that COINGECKO_API_KEY is set and correct.'
  if (status === 429) return 'Too many requests to CoinGecko. Please wait a minute and try again.'
  return 'CoinGecko could not return the data (status ' + status + ').'
}

export default async function handler(req, res) {
  const { coin = 'bitcoin', currency = 'inr', from } = req.query

  // Only allow simple values
  if (!/^[a-z0-9-]+$/.test(coin) || !/^[a-z]{3}$/.test(currency) || !/^\d{4}-\d{2}-\d{2}$/.test(from || '')) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  const now = Math.floor(Date.now() / 1000)
  const fromTs = Math.floor(new Date(from + 'T00:00:00Z').getTime() / 1000) - DAY // 1 day earlier gives a price for the first buy

  // The free CoinGecko plan only gives about 365 days of history
  if (Number.isNaN(fromTs) || fromTs > now || now - fromTs > 365 * DAY) {
    return res.status(400).json({ error: 'Start date must be within the last 12 months.' })
  }

  try {
    const key = process.env.COINGECKO_API_KEY
    if (!key) console.warn('COINGECKO_API_KEY is not set. Add it to your .env file and restart the server.')
    const headers = key ? { 'x-cg-demo-api-key': key } : {}
    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range?vs_currency=${currency}&from=${fromTs}&to=${now}`
    const r = await fetch(url, { headers })
    if (!r.ok) {
      console.error('CoinGecko error', r.status, await r.text())
      return res.status(502).json({ error: explain(r.status) })
    }

    const { prices } = await r.json()
    if (!Array.isArray(prices) || prices.length === 0) return res.status(502).json({ error: 'CoinGecko returned no prices for this period.' })

    // Cache for 5 minutes to protect the API limit
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({ prices })
  } catch (e) {
    console.error('Request failed', e)
    res.status(502).json({ error: 'Could not reach CoinGecko. Check your internet connection.' })
  }
}
