import { useEffect, useState } from 'react'
import { fetchMe } from './api'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Dashboard from './components/Dashboard'


export default function App() {
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)


useEffect(() => {
fetchMe().then((data) => {
setUser(data.user)
}).finally(() => setLoading(false))
}, [])


if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>


return (
<div className="min-h-screen bg-gray-50 text-gray-900">
<Navbar user={user} onLogout={() => setUser(null)} />
<main className="max-w-5xl mx-auto p-4">
{user ? <Dashboard /> : <Login />}
</main>
</div>
)
}