import { ChatMessage } from '../data/chats'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function ChatWindow({
  messages,
  height,
  editable = false,
  inputValue,
  onInputChange,
  onSend,
  sending = false,
}: {
  messages: ChatMessage[]
  height?: string
  editable?: boolean
  inputValue?: string
  onInputChange?: (v: string) => void
  onSend?: () => void
  sending?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className="flex flex-col rounded-xl bg-white/5 border border-white/10">
      <div
        ref={scrollRef}
        className={`p-4 ${height || 'h-96'} overflow-auto`}
      >
        <div className="space-y-3">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`max-w-[82%] ${m.role === 'customer' ? 'mr-auto' : 'ml-auto'}`}
            >
              <div
                className={`px-3 py-2 rounded-2xl text-sm shadow ${
                  m.role === 'customer'
                    ? 'bg-slate/60 rounded-bl-sm'
                    : 'bg-accent/80 rounded-br-sm'
                }`}
              >
                <div className="opacity-80 mb-1 text-[11px] flex items-center gap-2">
                  <span>{m.role === 'customer' ? 'Customer' : 'Agent'}</span>
                  <span className="opacity-70">•</span>
                  <span className="opacity-70">{m.time}</span>
                </div>
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 p-2">
        <form
          className={`flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 ${editable ? '' : 'opacity-70'}`}
          onSubmit={(e) => {
            e.preventDefault()
            if (editable && onSend) onSend()
          }}
        >
          <textarea
            disabled={!editable}
            placeholder={editable ? 'Type a message… (Shift+Enter for newline)' : 'Insert guidance to reply'}
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-white/40 resize-y min-h-[2.5rem] max-h-40"
            rows={3}
            value={inputValue || ''}
            onChange={(e) => onInputChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (editable && onSend) onSend()
              }
            }}
          />
          <button
            type="submit"
            disabled={!editable || sending || !(inputValue && inputValue.trim())}
            className="text-xs px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
