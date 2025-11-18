import { useEffect, useMemo, useState } from 'react'
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../api'
import AddTransactionForm from './AddTransactionForm'
import TransactionTable from './TransactionTable'
import Filters from './Filters'
import SpendPieChart from './SpendPieChart'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ from: '', to: '', category: '' })

  const load = async () => {
    try {
      const data = await fetchTransactions(filters)
      setItems(data)
    } catch (err) {
      console.error('Error loading transactions:', err)
    }
  }

  useEffect(() => {
    load()
  }, [filters])

  const totals = useMemo(() => {
    let income = 0,
      expense = 0
    for (const t of items) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense, net: income - expense }
  }, [items])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Stat title="Income" value={totals.income} />
        <Stat title="Expense" value={totals.expense} />
        <Stat title="Net" value={totals.net} />
      </div>

      {/* Add Form + Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-semibold mb-4">Add Transaction</h3>
          <AddTransactionForm
            onAdd={async (tx) => {
              await createTransaction(tx)
              await load()
            }}
          />
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-semibold mb-4">Spending Breakdown</h3>
          <SpendPieChart items={items} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Transactions</h3>
          <Filters value={filters} onChange={setFilters} />
        </div>

        <TransactionTable
          items={items}
          onUpdate={async (id, data) => {
            await updateTransaction(id, data)
            await load()
          }}
          onDelete={async (id) => {
            await deleteTransaction(id)
            await load()
          }}
        />
      </div>
    </div>
  )
}

function Stat({ title, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow text-center">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">${value?.toFixed(2) || '0.00'}</div>
    </div>
  )
}
