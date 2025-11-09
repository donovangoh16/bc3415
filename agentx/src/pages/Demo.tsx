import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { demoChats } from '../data/chats'

export default function Demo() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">AgentX Demo</h2>
        <p className="text-white/70">Choose a chat scenario to explore.</p>
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
