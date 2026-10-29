import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

// Small colored circle with a short code (for example BTC). Used when there is no icon image.
export function Badge({ text, color }) {
  return <span className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full px-1.5 text-[10px] font-bold" style={{ background: color + '1f', color }}>{text}</span>
}

// Shows the real coin icon. If the image cannot load, it shows the colored badge instead.
function Avatar({ o }) {
  const [failed, setFailed] = useState(false)
  if (o.icon && !failed) return <img src={o.icon} alt="" width="28" height="28" loading="lazy" onError={() => setFailed(true)} className="h-7 w-7 shrink-0 rounded-full object-cover" />
  return <Badge {...(o.badge || { text: o.sub.slice(0, 4), color: '#475569' })} />
}

// A custom dropdown with optional search.
// options: [{ value, label, sub, icon?, badge?, right? }]   right = text on the right side (for example the price)
// It works with mouse and keyboard (Arrow keys, Enter, Escape).
export function Dropdown({ label, value, onChange, options, searchable = false }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0) // highlighted row
  const box = useRef(null)
  const list = useRef(null)
  const current = options.find(o => o.value === value) || options[0]

  // Options that match the search text (name or symbol)
  const q = query.trim().toLowerCase()
  const shown = q ? options.filter(o => (o.label + ' ' + o.sub).toLowerCase().includes(q)) : options

  // Close the list when the user clicks outside
  useEffect(() => {
    const close = e => box.current && !box.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  // Keep the highlighted row visible while using the arrow keys
  useEffect(() => { list.current?.children[idx]?.scrollIntoView({ block: 'nearest' }) }, [idx, open])

  const pick = o => { onChange(o.value); setOpen(false); setQuery('') }
  const toggle = () => { setQuery(''); setIdx(Math.max(0, options.indexOf(current))); setOpen(o => !o) }
  const onKey = e => {
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') { e.preventDefault(); open ? setIdx(i => Math.min(i + 1, shown.length - 1)) : toggle() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && open) { e.preventDefault(); shown[idx] && pick(shown[idx]) }
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.tagName === 'BUTTON') { e.preventDefault(); toggle() }
  }

  return (
    <div ref={box} className="relative" onKeyDown={onKey}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <button type="button" onClick={toggle} aria-label={label} aria-haspopup="listbox" aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg border border-line bg-white px-3 py-2 text-left transition hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10">
        <Avatar key={current.icon} o={current} />
        <span className="min-w-0 flex-1 truncate text-base">{current.label} <span className="text-sm text-muted">{current.sub}</span></span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="animate-pop absolute z-30 mt-2 w-full min-w-72 rounded-xl border border-line bg-white p-2 shadow-xl shadow-ink/10">
          {searchable && (
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input autoFocus value={query} onChange={e => { setQuery(e.target.value); setIdx(0) }} placeholder="Search by name or symbol" aria-label="Search"
                className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </div>
          )}
          <ul role="listbox" ref={list} className="max-h-72 overflow-y-auto">
            {shown.map((o, i) => (
              <li key={o.value} role="option" aria-selected={o.value === value} onMouseEnter={() => setIdx(i)} onClick={() => pick(o)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 ${i === idx ? 'bg-primary/10' : ''}`}>
                <Avatar key={o.icon} o={o} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{o.label} <span className="font-normal text-muted">{o.sub}</span></span>
                {o.right && <span className="text-sm text-muted">{o.right}</span>}
                {o.value === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </li>
            ))}
            {shown.length === 0 && <li className="px-3 py-4 text-sm text-muted">No coins found</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
