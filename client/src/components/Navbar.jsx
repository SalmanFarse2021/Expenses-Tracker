import { logout } from '../api'


export default function Navbar({ user, onLogout }) {
const handleLogout = async () => {
await logout()
onLogout()
window.location.href = '/'
}


return (
<header className="border-b bg-white">
<div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
<h1 className="font-bold text-xl">💸 Expense Tracker</h1>
{user ? (
<div className="flex items-center gap-3">
<img src={user?.avatar} alt="avatar" className="w-8 h-8 rounded-full"/>
<span className="hidden sm:inline">{user?.name}</span>
<button onClick={handleLogout} className="px-3 py-1.5 rounded bg-gray-900 text-white">Logout</button>
</div>
) : null}
</div>
</header>
)
}