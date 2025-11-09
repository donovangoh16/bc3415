import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Pipeline from '../components/Pipeline'

export default function Landing() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 floating-dots animate-slow-pulse" />
      <div className="absolute -top-20 -left-20 h-72 w-72 bg-purple-500/20 blur-3xl rounded-full animate-slow-pulse" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 bg-indigo-500/20 blur-3xl rounded-full animate-slow-pulse" />

      <div className="relative text-center space-y-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl font-semibold"
        >
          AgentX
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-white/80 max-w-2xl mx-auto"
        >
          A professional assistant that empowers banking customer agents with
          instant, step‑by‑step guidance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <span className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5">Fast, factual answers</span>
          <span className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5">RAG powered</span>
          <span className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5">Built for agent desks</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link
            to="/demo"
            className="inline-block px-6 py-3 rounded-lg bg-accent hover:bg-purple-600 transition shadow-lg shadow-purple-800/30"
          >
            View Demo
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6"
        >
          <div className="mx-auto rounded-2xl bg-white/5 border border-white/10 p-4 shadow-xl">
            <Pipeline />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
