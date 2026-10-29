// Coins and currencies shown in the dropdowns.
// value = id used by the API, label = name shown, sub = short code, badge = small colored circle.
export const COINS = [
  { value: 'bitcoin', label: 'Bitcoin', sub: 'BTC', badge: { text: 'BTC', color: '#b7791f' } },
  { value: 'ethereum', label: 'Ethereum', sub: 'ETH', badge: { text: 'ETH', color: '#5a67a8' } },
  { value: 'solana', label: 'Solana', sub: 'SOL', badge: { text: 'SOL', color: '#2f8f83' } },
  { value: 'binancecoin', label: 'BNB', sub: 'BNB', badge: { text: 'BNB', color: '#a98307' } },
  { value: 'ripple', label: 'XRP', sub: 'XRP', badge: { text: 'XRP', color: '#3b4a5a' } },
  { value: 'dogecoin', label: 'Dogecoin', sub: 'DOGE', badge: { text: 'DOGE', color: '#a6812b' } },
  { value: 'cardano', label: 'Cardano', sub: 'ADA', badge: { text: 'ADA', color: '#2f6fa3' } },
]

// icon = country flag image (from flagcdn.com). If it cannot load, the badge is shown instead.
export const CURRENCIES = [
  { value: 'inr', icon: 'https://flagcdn.com/w80/in.png', label: 'Indian Rupee', sub: 'INR', badge: { text: '₹', color: '#475569' } },
  { value: 'usd', icon: 'https://flagcdn.com/w80/us.png', label: 'US Dollar', sub: 'USD', badge: { text: '$', color: '#475569' } },
  { value: 'eur', icon: 'https://flagcdn.com/w80/eu.png', label: 'Euro', sub: 'EUR', badge: { text: '€', color: '#475569' } },
  { value: 'gbp', icon: 'https://flagcdn.com/w80/gb.png', label: 'British Pound', sub: 'GBP', badge: { text: '£', color: '#475569' } },
  { value: 'aed', icon: 'https://flagcdn.com/w80/ae.png', label: 'UAE Dirham', sub: 'AED', badge: { text: 'AED', color: '#475569' } },
]
