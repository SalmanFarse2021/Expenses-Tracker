import { useEffect, useState } from 'react'
import { fetchMe } from './api'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setUser(data.user)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-emerald-50 text-slate-700">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-500 mb-4" />
        <p className="text-sm tracking-wide uppercase text-slate-500">Warming things up…</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-sky-200/60 blur-[120px]" />
        <div className="absolute top-10 left-8 w-64 h-64 bg-emerald-200/70 blur-[140px]" />
      </div>

      <div className="relative z-10 pb-12">
        <Navbar user={user} onLogout={() => setUser(null)} />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/70 shadow-2xl shadow-slate-200 p-4 sm:p-8">
            {user ? <Dashboard /> : <Login />}
          </div>
        </main>
      </div>
    </div>
  )
}
