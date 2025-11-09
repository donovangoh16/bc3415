import { useParams, Link } from 'react-router-dom'
import { demoChats } from '../data/chats'
import ChatWindow from '../components/ChatWindow'
import AgentXPanel from '../components/AgentXPanel'

export default function ChatDetail() {
  const { issue } = useParams()
  const key = issue || 'limit_exceeded'
  const data = demoChats[key]
  const reasonLabels: Record<string, string> = {
    limit_exceeded: 'limit_exceeded',
    no_payee: 'no_payee',
    fraud: 'bank flagged as fraud',
  }
  const reason = reasonLabels[key] || key

  if (!data) {
    return (
      <div>
        <p className="mb-4">Unknown issue.</p>
        <Link to="/demo" className="underline">Back to demo</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/demo" className="text-white/70 hover:text-white">← Back</Link>
        <div>
          <h2 className="text-2xl font-semibold">{data.title}</h2>
          <p className="text-white/70">{data.issueLine}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-white/60">Reason</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/20 bg-white/5 text-white/90">{reason}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ChatWindow messages={data.messages} />
        </div>
        <div className="lg:col-span-2">
          <AgentXPanel issueKey={key} />
        </div>
      </div>
    </div>
  )
}
