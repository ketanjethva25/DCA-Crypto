import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, CalendarDays, ChevronDown, Coins, Layers, PiggyBank, Repeat, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { buyDates, runDca } from './utils/calc'
import { CURRENCIES } from './data'
import { useCoins } from './useCoins'
import { Dropdown } from './components/Dropdown'
import { Num, Reveal } from './components/motion'
import { HeroArt } from './components/HeroArt'

const STEP_ICONS = [Repeat, CalendarDays, TrendingUp] // one icon for each step


// Date helpers (dates are text like "2026-10-28")
const iso = d => d.toISOString().slice(0, 10)
const daysAgo = n => iso(new Date(Date.now() - n * 86400000))

// Text for the page sections
const NAV = [['Calculator', '#calculator'], ['How it works', '#how'], ['FAQ', '#faq']]
const STEPS = [
  ['Choose your plan', 'Pick a coin, an amount, and weekly or monthly buying.'],
  ['Set the period', 'Choose a start and end date within the last 12 months.'],
  ['Read the results', 'See total invested, coins collected, value today and profit or loss.'],
]
const FAQ = [
  ['What is regular (DCA) investing?', 'You invest the same amount on a fixed schedule instead of making one big payment.'],
  ['Why only 12 months of history?', 'The free price data plan gives about one year of history, so older start dates are not allowed.'],
  ['Is this financial advice?', 'No. Past results do not predict the future.'],
]

// Shared style for inputs and dropdowns
const field = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base transition hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10'

export default function App() {
  // What the user chooses
  const [coin, setCoin] = useState('bitcoin')
  const [cur, setCur] = useState('inr')
  const [amount, setAmount] = useState('5000')
  const [freq, setFreq] = useState('monthly')
  const [start, setStart] = useState(daysAgo(180))
  const [end, setEnd] = useState(daysAgo(0))

  // Status and result
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [res, setRes] = useState(null)
  const coins = useCoins(cur) // top coins with real icons and live prices

  // Check the inputs. Returns an error message, or '' if everything is fine
  function validate() {
    const a = parseFloat(amount)
    if (!Number.isFinite(a) || a <= 0) return 'Enter an amount greater than 0.'
    if (!start || !end) return 'Choose a start date and an end date.'
    if (end <= start) return 'The end date must be after the start date.'
    if (end > daysAgo(0)) return 'The end date cannot be in the future.'
    if (start < daysAgo(364)) return 'The start date must be within the last 12 months.'
    return ''
  }

  // Runs when the user clicks "Calculate"
  async function calculate() {
    const problem = validate()
    setError(problem)
    if (problem) return

    setLoading(true)
    try {
      // Ask our serverless function for the price history
      const r = await fetch(`/api/history?coin=${coin}&currency=${cur}&from=${start}`)
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Something went wrong.')

      // Make the buy dates, then run the calculation
      const dates = buyDates(start, end, freq)
      const out = runDca(data.prices, dates, parseFloat(amount))

      // Chart data = one point per purchase + a final "Today" point
      const chart = [...out.rows.map(x => ({ date: x.date, invested: x.invested, value: x.value })), { date: 'Today', invested: out.invested, value: out.currentValue }]
      setRes({ ...out, chart, cur, coinName: coins.find(c => c.value === coin)?.label || coin }) // save cur so the format does not change later
    } catch (e) {
      setRes(null)
      setError(e.message || 'Could not load price history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Format numbers as money (for example 1,50,000.00 for INR)
  const money = (v, c = res?.cur || cur) => new Intl.NumberFormat(c === 'inr' ? 'en-IN' : 'en-US', { style: 'currency', currency: c.toUpperCase(), maximumFractionDigits: 2 }).format(v)
  const compact = v => new Intl.NumberFormat('en', { notation: 'compact' }).format(v)
  const up = res && res.profit >= 0

  return (
    <div id="top">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/80 text-ink backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5" aria-label="Main">
          <a href="#top" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white"><Layers className="h-5 w-5" /></span>DCA Crypto
          </a>
          <div className="flex items-center gap-1 text-sm font-medium text-muted">
            {NAV.map(([t, h]) => <a key={h} href={h} className="rounded-md px-3 py-2 transition-colors hover:bg-page hover:text-ink">{t}</a>)}
          </div>
        </nav>
      </header>

      {/* Hero section: light banner with an illustration on the right */}
      <section className="dots border-b border-line bg-white pb-16 pt-12 sm:pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-rise">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Monthly Crypto Investment <span className="text-primary">(DCA)</span> Calculator</h1>
            <p className="mt-5 text-lg">See how your regular investments could grow over time using <span className="text-primary">historical data.</span></p>
            <p className="mt-3 max-w-lg text-muted">Enter a monthly investment amount, select a cryptocurrency and time period to calculate your accumulated coins and potential returns.</p>
            <a href="#calculator" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">Start calculating<ArrowRight className="h-4 w-4" /></a>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6">
              {[[Coins, coins.length, 'Top coins'], [CalendarDays, '12 months', 'Price history'], [Repeat, 'Weekly or monthly', 'Purchase plans']].map(([I, v, l]) => (
                <div key={l}><dt className="flex items-center gap-1.5 text-sm text-muted"><I className="h-4 w-4" />{l}</dt><dd className="mt-1 font-semibold sm:text-lg">{v}</dd></div>
              ))}
            </dl>
          </div>
          <HeroArt />
        </div>
      </section>

      <main>
        {/* Calculator: form on the left, results on the right */}
        <section id="calculator" className="mx-auto grid max-w-6xl gap-6 px-5 py-14 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-lg shadow-ink/5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Wallet className="h-4 w-4" /></span>Your plan</h2>
            <div className="mt-5 space-y-4">
              <Dropdown label="Coin" value={coin} onChange={setCoin} options={coins} searchable />
              <Dropdown label="Currency" value={cur} onChange={setCur} options={CURRENCIES} />
              <label className="block text-sm font-medium"><span className="mb-1.5 block">Amount per purchase</span>
                <input className={field} type="number" min="0" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} />
              </label>

              {/* Weekly or monthly choice */}
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">How often</legend>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-page p-1">
                  {['weekly', 'monthly'].map(f => (
                    <button key={f} type="button" onClick={() => setFreq(f)} aria-pressed={freq === f} className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${freq === f ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink'}`}>{f}</button>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium"><span className="mb-1.5 block">Start date</span>
                  <input className={field + ' px-2'} type="date" value={start} max={daysAgo(0)} onChange={e => setStart(e.target.value)} />
                </label>
                <label className="block text-sm font-medium"><span className="mb-1.5 block">End date</span>
                  <input className={field + ' px-2'} type="date" value={end} max={daysAgo(0)} onChange={e => setEnd(e.target.value)} />
                </label>
              </div>
            </div>

            {error && <p className="mt-4 rounded-lg bg-loss/10 px-3 py-2 text-sm text-loss" role="alert">{error}</p>}

            <button onClick={calculate} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60">
              {loading ? 'Calculating...' : <>Calculate<ArrowRight className="h-4 w-4" /></>}
            </button>
            <p className="mt-3 text-xs text-muted">History is limited to the last 12 months.</p>
          </div>

          {/* Results */}
          <div className="min-w-0" aria-live="polite">
            {!res && !loading && (
              <div className="grid h-full min-h-72 place-items-center rounded-2xl border border-dashed border-line bg-white p-8 text-center text-muted">
                <div><PiggyBank className="mx-auto h-10 w-10 text-primary/50" /><p className="mt-3 text-lg font-semibold text-ink">Your results will appear here</p><p className="mt-1">Choose a coin, an amount and a date range, then select Calculate.</p></div>
              </div>
            )}

            {loading && <div className="animate-pulse space-y-4" role="status"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-line" />)}</div><div className="h-72 rounded-xl bg-line" /><span className="sr-only">Loading</span></div>}

            {res && !loading && (
              <div className="animate-rise space-y-6">
                <h2 className="text-lg font-semibold">{res.coinName}: {res.rows.length} purchases of {money(res.invested / res.rows.length)}</h2>

                {/* Four summary cards with icons. Numbers count up */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card icon={Wallet} label="Total invested" value={res.invested} format={money} />
                  <Card icon={Coins} label="Coins collected" value={res.coins} format={v => v.toFixed(6)} />
                  <Card icon={TrendingUp} label="Value today" value={res.currentValue} format={money} />
                  <Card icon={up ? TrendingUp : TrendingDown} label={up ? 'Profit' : 'Loss'} value={res.profit} format={v => `${v >= 0 ? '+' : '-'}${money(Math.abs(v))}`} color={up ? 'text-gain' : 'text-loss'} chip={up ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'} note={`${up ? '+' : ''}${res.profitPct.toFixed(2)}%`} />
                </div>

                {/* Area chart: money put in vs. value of the coins */}
                <section className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                  <h3 className="mb-3 font-semibold">Money invested vs. value of your coins</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={res.chart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#e6eaf1" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={36} />
                      <YAxis tick={{ fontSize: 12 }} width={56} tickFormatter={compact} />
                      <Tooltip formatter={v => money(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="invested" name="Total invested" stroke="#8a96ab" fill="#8a96ab" fillOpacity={0.08} strokeWidth={2} />
                      <Area type="monotone" dataKey="value" name="Value of coins" stroke="#2f7d57" fill="#2f7d57" fillOpacity={0.14} strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </section>

                {/* Table with every purchase */}
                <section className="rounded-2xl border border-line bg-white">
                  <h3 className="p-4 font-semibold sm:px-5">Every purchase</h3>
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full min-w-34rem text-left text-sm">
                      <thead className="sticky top-0 bg-white text-muted">
                        <tr>{['Date', 'Price', 'Coins bought', 'Worth today', 'Change'].map(h => <th key={h} className="border-y border-line px-4 py-2 font-medium sm:px-5">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {res.rows.map(r => {
                          const change = (res.currentPrice / r.price - 1) * 100 // how much this purchase gained or lost
                          return (
                            <tr key={r.date} className="border-b border-line transition-colors last:border-0 hover:bg-page">
                              <td className="px-4 py-2.5 sm:px-5">{r.date}</td>
                              <td className="px-4 py-2.5 sm:px-5">{money(r.price)}</td>
                              <td className="px-4 py-2.5 sm:px-5">{r.bought.toFixed(6)}</td>
                              <td className="px-4 py-2.5 sm:px-5">{money(r.bought * res.currentPrice)}</td>
                              <td className="px-4 py-2.5 sm:px-5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${change >= 0 ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'}`}>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </div>
        </section>

        {/* How it works: three steps */}
        <section id="how" className="border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <Reveal><h2 className="text-2xl font-bold sm:text-3xl">How it works</h2></Reveal>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map(([t, d], i) => {
                const Icon = STEP_ICONS[i]
                return (
                  <Reveal key={t} delay={i * 120}>
                    <div className="border-l-2 border-primary pl-5">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                      <p className="mt-4 text-sm font-semibold text-primary">Step {i + 1}</p>
                      <h3 className="mt-1 text-lg font-semibold">{t}</h3>
                      <p className="mt-1 text-muted">{d}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ: click a question to open the answer */}
        <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
          <Reveal><h2 className="text-2xl font-bold sm:text-3xl">Frequently asked questions</h2></Reveal>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">{q}<ChevronDown className="h-5 w-5 text-muted transition-transform group-open:rotate-180" /></summary>
                <p className="mt-2 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-ink text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10"><Layers className="h-4 w-4" /></span>DCA Crypto</div>
          <p className="max-w-md text-sm">Prices from CoinGecko. Estimates only, not financial advice.</p>
        </div>
      </footer>
    </div>
  )
}

// Compact numbers for the chart axis, for example 1500000 -> 1.5M
const compact = v => new Intl.NumberFormat('en', { notation: 'compact' }).format(v)

// A summary card with an icon. The number counts up smoothly.
function Card({ icon: Icon, label, value, format, color = 'text-ink', chip = 'bg-primary/10 text-primary', note }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2 text-sm text-muted"><span className={`grid h-7 w-7 place-items-center rounded-lg ${chip}`}><Icon className="h-4 w-4" /></span>{label}</div>
      <p className={`mt-2 text-xl font-semibold ${color}`}><Num value={value} format={format} /></p>
      {note && <p className={`text-sm font-medium ${color}`}>{note}</p>}
    </div>
  )
}
