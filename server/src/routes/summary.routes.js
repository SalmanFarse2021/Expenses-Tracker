import { Router } from 'express'
import Transaction from '../models/Transaction.js'
import { ensureAuth } from '../middleware/auth.js'

const router = Router()
router.use(ensureAuth)

const startOfDay = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const startOfWeek = (date) => {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return startOfDay(d)
}

const startOfMonth = (date) => {
  const d = startOfDay(date)
  d.setDate(1)
  return d
}

router.get('/', async (req, res) => {
  try {
    const userId = req.user._id
    const now = new Date()
    const dayStart = startOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    const transactions = await Transaction.find({ user: userId }).lean()
    const expenses = transactions.filter((tx) => tx.type === 'expense')

    const sumByFilter = (filterStart) =>
      expenses.reduce((acc, tx) => {
        if (tx.date && new Date(tx.date) >= filterStart) {
          return acc + tx.amount
        }
        return acc
      }, 0)

    const totals = {
      daily: Number(sumByFilter(dayStart).toFixed(2)),
      weekly: Number(sumByFilter(weekStart).toFixed(2)),
      monthly: Number(sumByFilter(monthStart).toFixed(2))
    }

    const categoryTotals = expenses
      .filter((tx) => new Date(tx.date) >= monthStart)
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount
        return acc
      }, {})

    const categoryWise = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2))
    }))

    const upcomingPayments = transactions
      .filter((tx) => tx.paymentStatus !== 'paid' || (tx.dueDate && new Date(tx.dueDate) > now))
      .map((tx) => ({
        id: tx._id,
        title: tx.title,
        dueDate: tx.dueDate || tx.date,
        amount: tx.amount,
        status: tx.paymentStatus || 'pending',
        paymentMethod: tx.paymentMethod || 'Card'
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)

    const groupTransactions = transactions.filter((tx) => tx.groupName && Array.isArray(tx.splits) && tx.splits.length)
    const groupBalancesMap = {}

    for (const tx of groupTransactions) {
      const totalSplit = tx.splits.reduce((acc, split) => acc + (split.amount || 0), 0)
      const perGroup = groupBalancesMap[tx.groupName] || { name: tx.groupName, owedToYou: 0, youOwe: 0 }
      const paidByUser = tx.paidBy === req.user.email || tx.paidBy === req.user.name || !tx.paidBy

      for (const split of tx.splits) {
        if (!split.member || split.member === req.user.email || split.member === req.user.name) {
          if (!paidByUser) {
            perGroup.youOwe += split.amount || 0
          }
        } else if (paidByUser) {
          perGroup.owedToYou += split.amount || 0
        }
      }

      if (!paidByUser && tx.amount > totalSplit) {
        perGroup.youOwe += tx.amount - totalSplit
      }

      groupBalancesMap[tx.groupName] = perGroup
    }

    const groupBalances = {
      totalOwedToYou: Number(
        Object.values(groupBalancesMap).reduce((acc, group) => acc + group.owedToYou, 0).toFixed(2)
      ),
      totalYouOwe: Number(
        Object.values(groupBalancesMap).reduce((acc, group) => acc + group.youOwe, 0).toFixed(2)
      ),
      groups: Object.values(groupBalancesMap)
    }

    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('default', { month: 'short' })
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const total = expenses.reduce((acc, tx) => {
        const txDate = new Date(tx.date)
        if (txDate >= start && txDate < end) {
          return acc + tx.amount
        }
        return acc
      }, 0)
      months.push({ month: label, amount: Number(total.toFixed(2)) })
    }

    const paymentHistory = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .reverse()
      .map((tx) => ({
        label: new Date(tx.date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
        amount: tx.amount,
        type: tx.type
      }))

    res.json({
      totals,
      categoryWise,
      upcomingPayments,
      groupBalances,
      monthlyTrend: months,
      paymentHistory
    })
  } catch (err) {
    console.error('Summary fetch error:', err)
    res.status(500).json({ message: 'Failed to load dashboard summary' })
  }
})

export default router
