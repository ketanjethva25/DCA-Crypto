import { useEffect, useState } from 'react'
import { COINS } from './data'

// Loads the top coins (real icon, name, symbol and live price) for the coin dropdown.
// While loading, or if the request fails, the short built-in list from data.js is used.
export function useCoins(currency) {
  const [coins, setCoins] = useState(COINS)

  useEffect(() => {
    let cancelled = false // ignore old responses if the currency changes quickly
    // Small prices (for example 0.0000123) need more decimals than big prices
    const money = p => new Intl.NumberFormat(currency === 'inr' ? 'en-IN' : 'en-US', { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: p < 1 ? 6 : 2 }).format(p)

    fetch(`/api/coins?currency=${currency}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(list => !cancelled && setCoins(list.map(c => ({ value: c.id, label: c.name, sub: c.symbol.toUpperCase(), icon: c.image, right: money(c.current_price) }))))
      .catch(() => {}) // keep the built-in list

    return () => { cancelled = true }
  }, [currency])

  return coins
}
