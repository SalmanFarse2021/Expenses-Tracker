import { useState } from 'react'


export default function AddTransactionForm({ onAdd }) {
const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'General', date: '' })


const submit = async (e) => {
e.preventDefault()
const payload = { ...form, amount: Number(form.amount) }
if (!payload.date) payload.date = new Date()
await onAdd(payload)
setForm({ title: '', amount: '', type: 'expense', category: 'General', date: '' })
}


return (
<form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
<input className="border rounded p-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
<input className="border rounded p-2" placeholder="Amount" type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required />
<select className="border rounded p-2" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
<option value="expense">Expense</option>
<option value="income">Income</option>
</select>
<input className="border rounded p-2" placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
<input className="border rounded p-2" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
<button className="bg-gray-900 text-white rounded p-2">Add</button>
</form>
)
}