import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#0ea5e9', '#f97316', '#22c55e', '#a855f7', '#e11d48', '#facc15', '#14b8a6', '#8b5cf6']

export default function SpendPieChart({ items = [], categoryData }) {
  let data = []

  if (Array.isArray(categoryData) && categoryData.length) {
    data = categoryData.map((entry) => ({ name: entry.category, value: entry.amount }))
  } else {
    const byCat = items
      .filter((i) => i.type === 'expense')
      .reduce((acc, cur) => {
        acc[cur.category] = (acc[cur.category] || 0) + cur.amount
        return acc
      }, {})

    data = Object.entries(byCat).map(([name, value]) => ({ name, value }))
  }

  if (!data.length) {
    return <div className="text-sm text-slate-500">No expense data yet.</div>
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} outerRadius={110} label className="text-slate-600">
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
