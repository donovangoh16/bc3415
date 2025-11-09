import { motion } from 'framer-motion'

const steps = [
  { key: 'collect', title: 'Collect', desc: 'Load FAQs & PDFs' },
  { key: 'embed', title: 'Chunk + Embed', desc: 'FAISS index (MiniLM)' },
  { key: 'retrieve', title: 'Retrieve + Rank', desc: 'Top‑K relevant chunks' },
  { key: 'generate', title: 'Generate', desc: 'LLM → concise JSON' },
  { key: 'present', title: 'Present', desc: 'Step-by-step for agents' },
]

export default function Pipeline() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-left text-sm text-white/75 mb-3">How it works</div>
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative items-stretch">
          {steps.map((s, i) => (
            <div key={s.key} className="relative flex flex-col items-center text-center h-full">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 w-full h-full min-h-[112px] flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-accent/90 text-white text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-white/70 mt-1">{s.desc}</div>
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 right-[-12%] w-[24%]">
                  <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="w-full h-1.5">
                    <defs>
                      <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="rgba(124,58,237,0.8)" />
                      </marker>
                    </defs>
                    <line x1="0" y1="3" x2="95" y2="3" stroke="rgba(124,58,237,0.7)" strokeWidth="3" strokeDasharray="6 6" className="dash-anim" />
                    <line x1="0" y1="3" x2="100" y2="3" stroke="transparent" strokeWidth="0" markerEnd="url(#arrowHead)" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
