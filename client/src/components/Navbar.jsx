import { logout } from '../api'

export default function Navbar({ user, onLogout }) {
  const handleLogout = async () => {
    await logout()
    onLogout()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-1">Expense OS</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
            💸 <span className="bg-gradient-to-r from-sky-500 via-emerald-500 to-yellow-500 bg-clip-text text-transparent">Expense Tracker</span>
          </h1>
        </div>

        {user ? (
          <div className="flex items-center gap-3 bg-white rounded-full pl-2 pr-3 py-1 border border-slate-100 shadow-sm">
            <img src={user?.avatar} alt="avatar" className="w-9 h-9 rounded-full border border-slate-200" />
            <div className="hidden sm:block text-sm leading-tight">
              <p className="text-slate-900 font-medium">{user?.name}</p>
              <p className="text-slate-500 text-xs">Logged in</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
