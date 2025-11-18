export default function Filters({ value, onChange }) {
return (
<div className="flex gap-2 items-center">
<input type="date" className="border rounded p-1" value={value.from} onChange={e=>onChange({ ...value, from: e.target.value })} />
<input type="date" className="border rounded p-1" value={value.to} onChange={e=>onChange({ ...value, to: e.target.value })} />
<input placeholder="Category" className="border rounded p-1" value={value.category} onChange={e=>onChange({ ...value, category: e.target.value })} />
</div>
)
}