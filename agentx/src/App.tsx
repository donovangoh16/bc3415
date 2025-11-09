import { Outlet, Link, useLocation } from 'react-router-dom'

export default function App() {
  const loc = useLocation()
  const isLanding = loc.pathname === '/'
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate to-navy bg-[length:200%_200%] animate-gradient-x">
      {!isLanding && (
        <header className="sticky top-0 backdrop-blur bg-navy/50 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link to="/" className="font-semibold tracking-wide">AgentX</Link>
            <nav className="text-sm opacity-80">
              <Link to="/demo" className="hover:opacity-100">Demo</Link>
            </nav>
          </div>
        </header>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}

