import { useEffect, useMemo, useState } from 'react'
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchDashboardSummary
} from '../api'
import AddTransactionForm from './AddTransactionForm'
import TransactionTable from './TransactionTable'
import Filters from './Filters'
import SpendPieChart from './SpendPieChart'
import ReceiptImport from './ReceiptImport'
import { MonthlyTrendChart, PaymentHistoryChart } from './AnalyticsCharts'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ from: '', to: '', category: '' })
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [autofillData, setAutofillData] = useState(null)

  const loadTransactions = async () => {
    try {
      const data = await fetchTransactions(filters)
      setItems(data)
    } catch (err) {
      console.error('Error loading transactions:', err)
    }
  }

  const loadSummary = async () => {
    try {
      setSummaryLoading(true)
      const data = await fetchDashboardSummary()
      setSummary(data)
    } catch (err) {
      console.error('Error loading summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [filters])

  useEffect(() => {
    loadSummary()
  }, [])

  const totals = useMemo(() => {
    let income = 0
    let expense = 0

    for (const t of items) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }

    return { income, expense, net: income - expense }
  }, [items])

  const statCards = summary
    ? [
        {
          title: 'Today',
          value: summary.totals?.daily || 0,
          description: 'Expenses logged today',
          accent: 'from-sky-200 to-sky-400',
          icon: '☀️'
        },
        {
          title: 'This week',
          value: summary.totals?.weekly || 0,
          description: 'Last 7 days of spending',
          accent: 'from-emerald-200 to-emerald-400',
          icon: '📅'
        },
        {
          title: 'This month',
          value: summary.totals?.monthly || 0,
          description: 'Month-to-date expenses',
          accent: 'from-yellow-200 to-amber-400',
          icon: '📆'
        }
      ]
    : []

  return (
    <div className="space-y-10 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Overview</p>
          <h2 className="text-3xl font-semibold text-slate-900 mt-2">Your financial snapshot</h2>
        </div>
        <div className="px-4 py-2 rounded-full bg-slate-100 text-sm font-medium text-slate-600 border border-slate-200">
          {items.length} {items.length === 1 ? 'transaction' : 'transactions'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryLoading && !summary ? (
          <div className="col-span-3 text-center text-sm text-slate-500">Loading summary…</div>
        ) : (
          statCards.map((card) => <Stat key={card.title} {...card} />)
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900">Add transaction</h3>
              <p className="text-sm text-slate-500">Log new income or expenses in seconds.</p>
            </div>
            <span className="text-xs tracking-widest uppercase text-emerald-500 font-semibold">New</span>
          </div>
          <AddTransactionForm
            initialData={autofillData}
            onAdd={async (tx) => {
              await createTransaction(tx)
              await Promise.all([loadTransactions(), loadSummary()])
              setAutofillData(null)
            }}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900">Spending breakdown</h3>
              <p className="text-sm text-slate-500">See which categories drive your expenses.</p>
            </div>
          </div>
          <SpendPieChart items={items} categoryData={summary?.categoryWise} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900">Monthly spending trend</h3>
              <p className="text-sm text-slate-500">Track how expenses evolve month over month.</p>
            </div>
          </div>
          <MonthlyTrendChart data={summary?.monthlyTrend || []} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900">Group balances</h3>
              <p className="text-sm text-slate-500">How much you owe or are owed.</p>
            </div>
          </div>
          {summary?.groupBalances?.groups?.length ? (
            <div className="space-y-4">
              <BalanceBadge
                label="Owed to you"
                amount={summary.groupBalances.totalOwedToYou}
                tone="positive"
              />
              <BalanceBadge label="You owe" amount={summary.groupBalances.totalYouOwe} tone="warning" />
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {summary.groupBalances.groups.map((group) => (
                  <div key={group.name} className="rounded-xl border border-slate-100 p-3">
                    <p className="text-sm font-semibold text-slate-800">{group.name}</p>
                    <p className="text-xs text-slate-500">
                      Owed to you: ${group.owedToYou?.toFixed(2) || '0.00'} · You owe: ${group.youOwe?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No group activity yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900">Upcoming payments</h3>
              <p className="text-sm text-slate-500">Keep an eye on pending bills.</p>
            </div>
          </div>
          {summary?.upcomingPayments?.length ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {summary.upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{payment.title}</p>
                    <p className="text-xs text-slate-500">
                      Due {new Date(payment.dueDate).toLocaleDateString()} · {payment.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${payment.amount.toFixed(2)}</p>
                    <span className="text-xs uppercase tracking-widest text-amber-500">{payment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">All caught up.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900">Payment history</h3>
              <p className="text-sm text-slate-500">Recent payments over time.</p>
            </div>
          </div>
          <PaymentHistoryChart data={summary?.paymentHistory || []} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40 space-y-6">
        <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Transactions</h3>
            <p className="text-sm text-slate-500">Filter, edit or delete entries whenever you need.</p>
          </div>
          <Filters value={filters} onChange={setFilters} />
        </div>

        <TransactionTable
          items={items}
          onUpdate={async (id, data) => {
            await updateTransaction(id, data)
            await Promise.all([loadTransactions(), loadSummary()])
          }}
          onDelete={async (id) => {
            await deleteTransaction(id)
            await Promise.all([loadTransactions(), loadSummary()])
          }}
        />
      </div>

      <ReceiptImport
        onImport={async (tx) => {
          await createTransaction(tx)
          await Promise.all([loadTransactions(), loadSummary()])
        }}
        onAutofill={(item) => {
          setAutofillData({
            title: item.title || item.vendor || '',
            amount: item.amount,
            category: item.category || 'General',
            date: item.date,
            paymentMethod: item.paymentMethod || 'Card',
            notes: item.notes || '',
            type: item.type || 'expense'
          })
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}

function Stat({ title, value, description, accent, icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-xl shadow-slate-200/40">
      <div className={`absolute inset-0 opacity-60 blur-3xl bg-gradient-to-br ${accent}`} />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{title}</span>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="text-3xl font-semibold text-slate-900">${value?.toFixed(2) || '0.00'}</div>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

function BalanceBadge({ label, amount, tone }) {
  const color =
    tone === 'positive'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
      : 'text-amber-600 bg-amber-50 border-amber-100'

  return (
    <div className={`rounded-2xl border ${color} px-4 py-3`}>
      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{label}</p>
      <p className="text-2xl font-semibold">${amount?.toFixed(2) || '0.00'}</p>
    </div>
  )
}
