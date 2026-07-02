// FX rates from open.er-api.com (CORS-open, no key). rates[X] = units of X per 1 USD.

export type Rates = Record<string, number>

// Used only if the FX fetch fails, so the currency picker still works in USD.
export const FALLBACK_RATES: Rates = { USD: 1 }

export async function fetchRates(): Promise<Rates> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD')
  if (!res.ok) throw new Error(`fx ${res.status}`)
  const data = await res.json()
  if (data.result !== 'success' || !data.rates) throw new Error('fx bad payload')
  return data.rates as Rates
}
