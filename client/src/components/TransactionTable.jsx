import { useState } from 'react'

const inputStyle =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100'
const buttonBase =
  'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition hover:opacity-90 focus:outline-none'
const formatCurrency = (value) => `$${Number(value ?? 0).toFixed(2)}`

export default function TransactionTable({ items, onUpdate, onDelete }) {
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})

  const startEdit = (row) => {
    setEditId(row._id)
    setDraft({ ...row, date: row.date?.slice?.(0, 10) })
  }

  const cancel = () => {
    setEditId(null)
    setDraft({})
  }

  const save = async () => {
    const { _id, ...data } = draft
    await onUpdate(editId, data)
    cancel()
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        No transactions yet. Start by logging one above.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-slate-600">
        <thead>
          <tr className="text-left text-xs uppercase tracking-widest text-slate-500">
            <th className="pb-3">Date</th>
            <th className="pb-3">Title</th>
            <th className="pb-3">Type</th>
            <th className="pb-3">Category</th>
            <th className="pb-3 text-right">Amount</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr
              key={row._id}
              className={`border-t border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
            >
              <td className="px-2 py-3">
                {editId === row._id ? (
                  <input
                    type="date"
                    className={inputStyle}
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                ) : (
                  new Date(row.date).toLocaleDateString()
                )}
              </td>

              <td className="px-2 py-3 font-medium text-slate-900">
                {editId === row._id ? (
                  <input
                    className={inputStyle}
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                ) : (
                  row.title
                )}
              </td>

              <td className="px-2 py-3">
                {editId === row._id ? (
                  <select
                    className={inputStyle}
                    value={draft.type}
                    onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                  >
                    <option value="expense">expense</option>
                    <option value="income">income</option>
                  </select>
                ) : (
                  <TypeBadge type={row.type} />
                )}
              </td>

              <td className="px-2 py-3">
                {editId === row._id ? (
                  <input
                    className={inputStyle}
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  />
                ) : (
                  <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {row.category}
                  </span>
                )}
              </td>

              <td className="px-2 py-3 text-right font-semibold text-slate-900">
                {editId === row._id ? (
                  <input
                    type="number"
                    step="0.01"
                    className={inputStyle}
                    value={draft.amount}
                    onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                  />
                ) : (
                  formatCurrency(row.amount)
                )}
              </td>

              <td className="px-2 py-3">
                <div className="flex justify-end gap-2">
                  {editId === row._id ? (
                    <div className="flex gap-2">
                      <button className={`${buttonBase} bg-emerald-500 text-white`} onClick={save}>
                        Save
                      </button>
                      <button className={`${buttonBase} bg-slate-100 text-slate-600`} onClick={cancel}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button className={`${buttonBase} bg-blue-500 text-white`} onClick={() => startEdit(row)}>
                        Edit
                      </button>
                      <button className={`${buttonBase} bg-rose-500 text-white`} onClick={() => onDelete(row._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TypeBadge({ type }) {
  const isIncome = type === 'income'

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}
    >
      {isIncome ? 'Income' : 'Expense'}
    </span>
  )
}
