import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'


export default function SpendPieChart({ items }) {
const byCat = items.filter(i=>i.type==='expense').reduce((acc, cur) => {
acc[cur.category] = (acc[cur.category] || 0) + cur.amount
return acc
}, {})
const data = Object.entries(byCat).map(([name, value]) => ({ name, value }))


if (data.length === 0) return <div className="text-gray-500">No expense data</div>


return (
<div style={{ width: '100%', height: 280 }}>
<ResponsiveContainer>
<PieChart>
<Pie dataKey="value" data={data} outerRadius={100} label />
<Tooltip />
<Legend />
</PieChart>
</ResponsiveContainer>
</div>
)
}