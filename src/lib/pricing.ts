// LLM pricing from models.dev (CORS-open, no key). cost.input/output are USD per 1M tokens.

export const PROVIDERS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  llama: 'Meta', // Meta's pricing lives under the `llama` provider key
  xai: 'xAI',
  mistral: 'Mistral',
  deepseek: 'DeepSeek',
}

export type Model = {
  id: string
  name: string
  provider: string // display label
  costIn: number // USD per 1M input tokens
  costOut: number // USD per 1M output tokens
}

// Pure — the entire app's math. Returns tokens buyable, or Infinity for a free model.
export function tokensFor({
  salaryUSD,
  costIn,
  costOut,
  ratioIn,
}: {
  salaryUSD: number
  costIn: number
  costOut: number
  ratioIn: number
}): number {
  const blendedPer1M = ratioIn * costIn + (1 - ratioIn) * costOut
  if (!(blendedPer1M > 0)) return Infinity
  return (salaryUSD * 1_000_000) / blendedPer1M
}

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch('https://models.dev/api.json')
  if (!res.ok) throw new Error(`models.dev ${res.status}`)
  const data: Record<string, { models: Record<string, any> }> = await res.json()

  const out: Model[] = []
  for (const [key, label] of Object.entries(PROVIDERS)) {
    const models = data[key]?.models
    if (!models) continue
    for (const m of Object.values(models)) {
      const costIn = m?.cost?.input
      const costOut = m?.cost?.output
      if (typeof costIn !== 'number' || typeof costOut !== 'number') continue
      if (costIn <= 0 && costOut <= 0) continue // free / unpriced
      out.push({ id: `${key}/${m.id}`, name: m.name ?? m.id, provider: label, costIn, costOut })
    }
  }
  return out
}
