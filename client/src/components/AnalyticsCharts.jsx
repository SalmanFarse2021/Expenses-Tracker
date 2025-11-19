import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts'

export const MonthlyTrendChart = ({ data = [] }) => {
  if (!data.length) {
    return <p className="text-sm text-slate-500">No monthly data yet.</p>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const PaymentHistoryChart = ({ data = [] }) => {
  if (!data.length) {
    return <p className="text-sm text-slate-500">No payment history.</p>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#6366f1" name="Amount" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
