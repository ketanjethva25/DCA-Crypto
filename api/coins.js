// Serverless function on Vercel.  URL: /api/coins?currency=inr
// Returns the top 50 coins by market value, each with a name, symbol, real icon link and live price.
// It is used to fill the coin dropdown.
// Explains a CoinGecko error in simple words (the real reason is also printed in the terminal)
function explain(status) {
  if (status === 401 || status === 403) return 'CoinGecko rejected the request. Check that COINGECKO_API_KEY is set and correct.'
  if (status === 429) return 'Too many requests to CoinGecko. Please wait a minute and try again.'
  return 'CoinGecko could not return the data (status ' + status + ').'
}

export default async function handler(req, res) {
  const { currency = 'inr' } = req.query

  // Only allow a simple 3-letter currency code
  if (!/^[a-z]{3}$/.test(currency)) return res.status(400).json({ error: 'Invalid input' })

  try {
    const key = process.env.COINGECKO_API_KEY
    if (!key) console.warn('COINGECKO_API_KEY is not set. Add it to your .env file and restart the server.')
    const headers = key ? { 'x-cg-demo-api-key': key } : {}
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1&sparkline=false`
    const r = await fetch(url, { headers })
    if (!r.ok) {
      console.error('CoinGecko error', r.status, await r.text())
      return res.status(502).json({ error: explain(r.status) })
    }

    // Send only the fields the app needs
    const coins = (await r.json()).map(({ id, name, symbol, image, current_price }) => ({ id, name, symbol, image, current_price }))

    // Cache for 60 seconds so many visitors do not use up the API limit
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    res.status(200).json(coins)
  } catch (e) {
    console.error('Request failed', e)
    res.status(502).json({ error: 'Could not reach CoinGecko. Check your internet connection.' })
  }
}
