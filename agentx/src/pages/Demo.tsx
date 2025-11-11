import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { demoChats } from '../data/chats'

type DocItem = { path: string; type: string; id_prefix: string }
type DocsResponse = { index_present: boolean; docs: DocItem[] }

export default function Demo() {
  const [docs, setDocs] = useState<DocsResponse | null>(null)
  const [docsErr, setDocsErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/docs')
        if (!res.ok) throw new Error(await res.text())
        const data = (await res.json()) as DocsResponse
        if (alive) setDocs(data)
      } catch (e: any) {
        if (alive) setDocsErr(e?.message || 'Failed to load documents')
      }
    })()
    return () => { alive = false }
  }, [])
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">AgentX Demo</h2>
        <p className="text-white/70">Choose a chat scenario to explore.</p>
      </div>
      <div className="mb-8 rounded-xl bg-white/5 border border-white/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Current Documents in Use</div>
          {docs && (
            <div className="text-xs text-white/80 flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${docs.index_present ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span>{docs.index_present ? 'Index ready' : 'Index not built'}</span>
            </div>
          )}
        </div>
        {docsErr && (
          <div className="text-sm text-red-300">{docsErr}</div>
        )}
        {docs && (
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {docs.docs.map((d) => (
              <li key={d.path} className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-sm font-medium truncate" title={d.path}>{d.path}</div>
                <div className="text-xs text-white/70 mt-1">{d.type.toUpperCase()} • id: {d.id_prefix}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
        {Object.entries(demoChats).map(([key, meta], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="group rounded-xl bg-white/5 border border-white/10 p-6 hover:-translate-y-1 transition transform shadow-lg hover:shadow-purple-900/30 h-full"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-lg font-medium">{meta.title}</h3>
                <p className="text-white/65 mt-2">{meta.issueLine}</p>
              </div>
              <div className="pt-6">
                <Link
                  to={`/demo/${key}`}
                  className="inline-block text-sm px-4 py-2 rounded-md bg-accent/90 hover:bg-accent transition"
                >
                  Open Chat
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
