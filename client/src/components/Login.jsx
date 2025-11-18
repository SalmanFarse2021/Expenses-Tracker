export default function Login() {
const loginWithGoogle = () => {
window.location.href = '/api/auth/google'
}
return (
<div className="flex flex-col items-center justify-center py-24">
<h2 className="text-3xl font-semibold mb-6">Welcome</h2>
<p className="mb-8 text-gray-600">Sign in to manage your expenses</p>
<button onClick={loginWithGoogle} className="px-4 py-2 rounded bg-blue-600 text-white">
Continue with Google
</button>
</div>
)
}