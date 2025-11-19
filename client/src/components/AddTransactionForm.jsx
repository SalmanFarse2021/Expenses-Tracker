import { useEffect, useState } from 'react'

const inputStyle =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition'

const defaultForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: 'General',
  date: '',
  paymentMethod: 'Card',
  notes: '',
  receiptFile: null
}

export default function AddTransactionForm({ onAdd, initialData }) {
  const [form, setForm] = useState(defaultForm)
  const [previewReceipt, setPreviewReceipt] = useState(null)

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        amount: initialData.amount || prev.amount,
        date: initialData.date ? initialData.date.slice(0, 10) : prev.date,
        paymentMethod: initialData.paymentMethod || prev.paymentMethod
      }))
    }
  }, [initialData])

  const handleFileChange = (file) => {
    if (!file) {
      setForm((prev) => ({ ...prev, receiptFile: null }))
      setPreviewReceipt(null)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, receiptFile: reader.result }))
      setPreviewReceipt(file.type.includes('pdf') ? 'PDF uploaded' : reader.result)
    }
    reader.readAsDataURL(file)
  }

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      amount: Number(form.amount),
      type: form.type,
      category: form.category || 'General',
      date: form.date ? new Date(form.date) : new Date(),
      paymentMethod: form.paymentMethod,
      notes: form.notes,
      receiptImage: form.receiptFile
    }

    await onAdd(payload)
    setForm(defaultForm)
    setPreviewReceipt(null)
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <input
        className={inputStyle}
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />

      <input
        className={inputStyle}
        placeholder="Amount"
        type="number"
        step="0.01"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />

      <select className={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        className={inputStyle}
        placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

      <input className={inputStyle} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

      <select
        className={inputStyle}
        value={form.paymentMethod}
        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
      >
        <option value="Cash">Cash</option>
        <option value="Card">Card</option>
        <option value="UPI">UPI</option>
        <option value="Bank Transfer">Bank Transfer</option>
        <option value="Other">Other</option>
      </select>

      <textarea
        className={`${inputStyle} min-h-[80px] sm:col-span-2`}
        placeholder="Description / notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <label className="sm:col-span-2 flex flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-sm text-slate-600 cursor-pointer">
        <span className="font-semibold text-slate-700">Attach receipt (optional)</span>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
        {previewReceipt ? (
          <span className="text-emerald-600 text-sm">{typeof previewReceipt === 'string' ? 'Receipt attached' : 'Receipt attached'}</span>
        ) : (
          <span className="text-xs text-slate-400">PNG, JPG or PDF up to 5MB</span>
        )}
      </label>

      <button className="rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-200 transition hover:translate-y-[1px] sm:col-span-2">
        Add transaction
      </button>
    </form>
  )
}
