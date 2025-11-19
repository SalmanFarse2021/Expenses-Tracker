const controlStyle =
  'rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100'

export default function Filters({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-slate-100/80 rounded-2xl px-4 py-2 border border-slate-200">
      <input
        type="date"
        className={controlStyle}
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
      />
      <input
        type="date"
        className={controlStyle}
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
      />
      <input
        placeholder="Category"
        className={controlStyle}
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
      />
      <button
        type="button"
        onClick={() => onChange({ from: '', to: '', category: '' })}
        className="text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-700"
      >
        Reset
      </button>
    </div>
  )
}
