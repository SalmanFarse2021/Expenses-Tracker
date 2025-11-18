import { useState } from 'react'

export default function TransactionTable({ items, onUpdate, onDelete }) {
	const [editId, setEditId] = useState(null);
	const [draft, setDraft] = useState({});

	const startEdit = (row) => { setEditId(row._id); setDraft({ ...row, date: row.date?.slice?.(0,10) }) }
const cancel = () => { setEditId(null); setDraft({}) }
const save = async () => { const { _id, ...data } = draft; await onUpdate(editId, data); cancel() }


return (
<div className="overflow-x-auto">
<table className="min-w-full text-sm">
<thead>
<tr className="text-left border-b">
<th className="p-2">Date</th>
<th className="p-2">Title</th>
<th className="p-2">Type</th>
<th className="p-2">Category</th>
<th className="p-2">Amount</th>
<th className="p-2 w-40">Actions</th>
</tr>
</thead>
<tbody>
{items.map(row => (
<tr key={row._id} className="border-b">
<td className="p-2">{editId===row._id ? (
<input type="date" className="border rounded p-1" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})} />
) : new Date(row.date).toLocaleDateString()}
</td>
<td className="p-2">{editId===row._id ? (
<input className="border rounded p-1" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} />
) : row.title}</td>
<td className="p-2">{editId===row._id ? (
<select className="border rounded p-1" value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})}>
<option value="expense">expense</option>
<option value="income">income</option>
</select>
) : row.type}</td>
<td className="p-2">{editId===row._id ? (
<input className="border rounded p-1" value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})} />
) : row.category}</td>
<td className="p-2">{editId===row._id ? (
<input type="number" step="0.01" className="border rounded p-1" value={draft.amount} onChange={e=>setDraft({...draft,amount:e.target.value})} />
) : `$${row.amount.toFixed(2)}`}</td>
<td className="p-2 flex gap-2">
{editId===row._id ? (
<>
<button className="px-2 py-1 bg-green-600 text-white rounded" onClick={save}>Save</button>
<button className="px-2 py-1 bg-gray-200 rounded" onClick={cancel}>Cancel</button>
</>
) : (
<>
<button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>startEdit(row)}>Edit</button>
<button className="px-2 py-1 bg-red-600 text-white rounded" onClick={()=>onDelete(row._id)}>Delete</button>
</>
)}
</td>
</tr>
))}
</tbody>
</table>
</div>
)
}