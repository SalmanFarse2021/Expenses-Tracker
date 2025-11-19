export default function Login() {
  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-800">
      <p className="text-xs uppercase tracking-[0.4em] text-sky-500 mb-4">Personal finance hub</p>
      <h2 className="text-4xl font-semibold mb-4 text-slate-900">Welcome back</h2>
      <p className="mb-8 text-slate-600 max-w-md">
        Connect your Google account to sync transactions, visualize your spending, and keep your financial life on track.
      </p>
      <button
        onClick={loginWithGoogle}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-sky-500 text-white font-semibold shadow-lg shadow-sky-200 hover:-translate-y-[1px] transition-all"
      >
        <span role="img" aria-hidden="true">
          🔐
        </span>
        Continue with Google
      </button>
    </div>
  )
}
