import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type AssistResult = {
  issue: string
  solve: string
  step_by_step_guide: string[]
  chunks: { id?: string; score?: number; source?: string; text?: string }[]
}

export default function AgentXPanel({ issueKey }: { issueKey: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AssistResult | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const steps = [
    'Connecting to AgentX',
    'Retrieving documentation',
    'Ranking relevant guidance',
    'Generating plan',
    'Finalizing guidance',
  ]
  const timerRef = useRef<number | null>(null)

  const onAssist = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    setStepIndex(0)
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 700)
    try {
      const url = `/api/assist?issue=${encodeURIComponent(issueKey)}&top_k=3`
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const js = (await res.json()) as AssistResult
      setData(js)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch guidance')
    } finally {
      setLoading(false)
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">AgentX</h3>
        <button
          onClick={onAssist}
          disabled={loading}
          className="px-3 py-1.5 text-sm rounded-md bg-accent/90 hover:bg-accent disabled:opacity-60"
        >
          {loading ? 'Working…' : 'Use AgentX'}
        </button>
      </div>

      {loading && (
        <div className="mb-4">
          <div className="h-1.5 w-full bg-white/10 rounded overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {steps.map((s, idx) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                    idx <= stepIndex ? 'bg-accent border-accent' : 'border-white/30'
                  }`}
                >
                  {idx < stepIndex ? '✓' : ''}
                </span>
                <span className={idx === stepIndex ? 'text-white' : 'text-white/75'}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="text-red-300 text-sm">{error}</div>
      )}

      {data && (
        <div className="space-y-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-white/60 mb-1">Issue</div>
            <div className="text-white/90 break-words whitespace-pre-wrap">{data.issue}</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wide text-white/60 mb-1">Recommended Action</div>
            <div className="text-white/90 break-words whitespace-pre-wrap">{data.solve}</div>
          </div>

          <div>
            <div className="text-sm uppercase tracking-wide text-white/60 mb-2">Step-by-step</div>
            <ul className="space-y-2">
              {data.step_by_step_guide.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2"
                >
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/70">{i + 1}</span>
                  <span className="text-white/90 break-words whitespace-pre-wrap">{s}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm uppercase tracking-wide text-white/60 mb-2">Sources</div>
            <ul className="space-y-1 text-sm">
              {data.chunks.map((c, i) => (
                <li key={i} className="opacity-90 break-words whitespace-pre-wrap">
                  <span className="text-white/70 break-all">{c.source}</span>
                  {c.text ? (
                    <>
                      <span> — </span>
                      <span className="text-white/90 break-words whitespace-pre-wrap">{c.text}</span>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
