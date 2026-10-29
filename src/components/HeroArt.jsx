// A stack of gold coins. n = how many coins, cx = center position
function Stack({ cx, n }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const y = 250 - i * 13 // each coin sits a little higher than the one below
        return (
          <g key={i}>
            <rect x={cx - 34} y={y} width="68" height="12" fill="#c8962d" />
            <ellipse cx={cx} cy={y + 12} rx="34" ry="9" fill="#c8962d" />
            <ellipse cx={cx} cy={y} rx="34" ry="9" fill="#e3b650" stroke="#c8962d" strokeWidth="1.5" />
          </g>
        )
      })}
    </g>
  )
}

// Decorative hero illustration (not real data): growing coin stacks, a rising arrow and a Bitcoin coin.
export function HeroArt() {
  return (
    <svg viewBox="0 0 420 290" className="animate-floaty mx-auto w-full max-w-md" aria-hidden="true">
      {/* Ground line */}
      <line x1="50" y1="266" x2="330" y2="266" stroke="#16271f" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
      {/* Stacks grow from left to right */}
      <Stack cx={100} n={2} />
      <Stack cx={180} n={4} />
      <Stack cx={260} n={6} />
      {/* Rising arrow */}
      <polyline points="40,150 110,120 160,135 235,75 285,50" fill="none" stroke="#2f7d57" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="308,38 291.5,63 278.1,36.2" fill="#2f7d57" stroke="#2f7d57" strokeWidth="5" strokeLinejoin="round" />
      {/* Bitcoin coin: a letter B with two small lines, drawn so it works on every device */}
      <circle cx="350" cy="190" r="44" fill="#e0a33e" />
      <circle cx="350" cy="190" r="36" fill="none" stroke="#f3cd84" strokeWidth="2.5" />
      <text x="350" y="206" textAnchor="middle" fontSize="46" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">B</text>
      <path d="M341 163v9M359 163v9M341 208v9M359 208v9" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}
