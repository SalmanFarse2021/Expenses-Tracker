import { useState } from 'react'
import { extractTransactionsFromFile } from '../api'

export default function ReceiptImport({ onImport, onAutofill }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError('')
    setResults([])
    setSummary(null)

    try {
      const data = await extractTransactionsFromFile(file)
      setResults(
        (data.items || []).map((item) => ({
          ...item,
          paymentMethod: item.paymentMethod || 'Card',
          notes: item.notes || '',
          vendor: item.vendor || item.title
        }))
      )
      setSummary(data.summary || null)
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to extract transactions.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (item) => {
    await onImport({
      title: item.title,
      amount: item.amount,
      type: item.type || 'expense',
      category: item.category || 'General',
      date: item.date ? new Date(item.date) : new Date()
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-900">Import from receipt or PDF</h3>
          <p className="text-sm text-slate-500">Send files to Gemini AI to auto-detect expenses.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-indigo-500">AI</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label
          htmlFor="receipt-upload"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center cursor-pointer"
        >
          <span className="text-3xl">📎</span>
          <div className="text-sm">
            <p className="font-semibold text-slate-800">{file ? file.name : 'Drop a receipt or statement'}</p>
            <p className="text-slate-500">PNG, JPG, or PDF up to 6MB</p>
          </div>
          <input
            id="receipt-upload"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <button
          type="submit"
          disabled={!file || loading}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/40 transition disabled:opacity-60"
        >
          {loading ? 'Analyzing…' : 'Extract expenses'}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}

      {summary ? (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-800">
          <p className="font-semibold">Gemini summary</p>
          <p>Total detected: {summary.currency} {Number(summary.total || 0).toFixed(2)}</p>
          {summary.notes ? <p className="text-indigo-700 mt-1">{summary.notes}</p> : null}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            Detected items ({results.length}) — click to add
          </p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {results.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    {item.category} · {item.type}
                  </p>
                  {item.date ? (
                    <p className="text-xs text-slate-500 mt-1">Date: {new Date(item.date).toLocaleDateString()}</p>
                  ) : null}
                  {item.tax ? <p className="text-xs text-slate-500">Tax: ${Number(item.tax).toFixed(2)}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-slate-900">
                    {item.currency || 'USD'} {Number(item.amount || 0).toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-white border border-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                      onClick={() => onAutofill?.(item)}
                    >
                      Autofill
                    </button>
                    <button
                      className="rounded-full bg-slate-900 text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
                      onClick={() => handleAdd(item)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
