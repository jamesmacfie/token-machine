import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { fetchModels, tokensFor, type Model } from '../lib/pricing'
import { fetchRates, FALLBACK_RATES, type Rates } from '../lib/fx'

export const Route = createFileRoute('/')({ component: Home })

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 })
const full = new Intl.NumberFormat('en-US')
const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n < 1 ? 4 : 2 }).format(n)

function Home() {
  const [amount, setAmount] = useState('100000')
  const [currency, setCurrency] = useState('USD')
  const [ratio, setRatio] = useState(50) // % of tokens that are input
  const [filter, setFilter] = useState('')
  const [models, setModels] = useState<Model[]>([])
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES)
  const [fxFailed, setFxFailed] = useState(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = () => {
    setStatus('loading')
    fetchModels()
      .then((m) => {
        setModels(m)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
    fetchRates()
      .then(setRates)
      .catch(() => setFxFailed(true))
  }
  useEffect(load, [])

  const currencies = useMemo(
    () => Object.keys(rates).sort((a, b) => (a === 'USD' ? -1 : b === 'USD' ? 1 : a.localeCompare(b))),
    [rates],
  )

  const salaryUSD = useMemo(() => {
    const n = parseFloat(amount)
    const rate = rates[currency] ?? 1
    return Number.isFinite(n) && n > 0 ? n / rate : NaN
  }, [amount, currency, rates])

  const rows = useMemo(() => {
    if (!(salaryUSD > 0)) return []
    const q = filter.trim().toLowerCase()
    return models
      .filter((m) => !q || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))
      .map((m) => ({ ...m, tokens: tokensFor({ salaryUSD, costIn: m.costIn, costOut: m.costOut, ratioIn: ratio / 100 }) }))
      .filter((r) => Number.isFinite(r.tokens))
      .sort((a, b) => b.tokens - a.tokens)
  }, [models, salaryUSD, ratio, filter])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">💸 Token Machine</h1>
          <p className="mt-2 text-neutral-400">
            How many LLM tokens is your salary worth? Live prices from{' '}
            <a href="https://models.dev" className="underline hover:text-neutral-200">models.dev</a>.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="flex-1">
              <span className="mb-1 block text-sm font-medium text-neutral-400">Salary</span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-lg tabular-nums outline-none focus:border-emerald-500"
              />
            </label>
            <label className="sm:w-40">
              <span className="mb-1 block text-sm font-medium text-neutral-400">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-lg outline-none focus:border-emerald-500"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span className="text-emerald-400">{ratio}% input</span>
              <span className="text-neutral-400">Token mix</span>
              <span className="text-sky-400">{100 - ratio}% output</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={ratio}
              onChange={(e) => setRatio(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {fxFailed && (
            <p className="mt-3 text-xs text-amber-400">FX rates unavailable — showing USD only.</p>
          )}
        </div>

        <div className="mt-8">
          {status === 'loading' && <p className="text-neutral-400">Fetching live prices…</p>}
          {status === 'error' && (
            <div className="text-neutral-400">
              <p>Couldn’t load prices.</p>
              <button onClick={load} className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500">
                Retry
              </button>
            </div>
          )}
          {status === 'ready' && !(salaryUSD > 0) && (
            <p className="text-neutral-400">Enter a salary above to see your token wealth.</p>
          )}
          {status === 'ready' && salaryUSD > 0 && (
            <>
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter models… (e.g. gpt, claude, gemini)"
              className="mb-4 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 outline-none focus:border-emerald-500"
            />
            {rows.length === 0 && <p className="text-neutral-500">No models match “{filter}”.</p>}
            <ul className="space-y-2">
              {rows.map((r, i) => (
                <li
                  key={r.id}
                  className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3"
                >
                  <span className="w-6 shrink-0 text-right font-mono text-sm text-neutral-600">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.name}</div>
                    <div className="text-xs text-neutral-500">
                      {r.provider} · {money(r.costIn)}/{money(r.costOut)} per 1M in/out
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xl font-bold tabular-nums text-emerald-400">{compact.format(r.tokens)}</div>
                    <div className="text-xs text-neutral-600 tabular-nums">{full.format(Math.round(r.tokens))}</div>
                  </div>
                </li>
              ))}
            </ul>
            </>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-neutral-600">
          Prices & FX fetched live in your browser. For fun, not financial advice.
        </footer>
      </div>
    </div>
  )
}
