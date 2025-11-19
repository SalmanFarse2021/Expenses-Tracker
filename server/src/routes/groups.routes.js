import { Router } from 'express'
import Group from '../models/Group.js'
import GroupExpense from '../models/GroupExpense.js'
import GroupMessage from '../models/GroupMessage.js'
import { ensureAuth } from '../middleware/auth.js'

const router = Router()
router.use(ensureAuth)

const memberIdentifier = (user) => user?.email?.toLowerCase()

const normalizeMembers = (members = [], currentUser) => {
  const existing = new Set()
  const normalized = []

  const pushMember = (member, role = 'member') => {
    if (!member?.email) return
    const email = member.email.toLowerCase()
    if (existing.has(email)) return
    existing.add(email)
    normalized.push({
      email,
      name: member.name || email,
      role,
      user: member.user
    })
  }

  pushMember(
    {
      email: memberIdentifier(currentUser),
      name: currentUser?.name,
      user: currentUser?._id
    },
    'owner'
  )

  members.forEach((m) => pushMember(m))
  return normalized
}

const buildSplits = (splitType, members, amount, inputSplits = []) => {
  if (!members?.length) {
    throw new Error('At least one member must be selected for the split.')
  }
  const normalizedMembers = members.map((m) => m.toLowerCase())
  const safeAmount = Number(amount)
  if (!safeAmount || safeAmount <= 0) {
    throw new Error('Amount must be greater than zero.')
  }

  const splits = []

  if (splitType === 'equal') {
    const each = Number((safeAmount / normalizedMembers.length).toFixed(2))
    normalizedMembers.forEach((member) => {
      splits.push({ member, amount: each })
    })
  } else if (splitType === 'percent') {
    let totalPercent = 0
    inputSplits.forEach((entry) => {
      if (!entry.member || typeof entry.percent !== 'number') {
        throw new Error('Percent split requires member and percent.')
      }
      totalPercent += entry.percent
    })
    if (Math.round(totalPercent) !== 100) {
      throw new Error('Percent splits must add up to 100%.')
    }
    inputSplits.forEach((entry) => {
      const member = entry.member.toLowerCase()
      if (!normalizedMembers.includes(member)) {
        throw new Error(`Member ${member} is not part of this expense.`)
      }
      const share = Number(((entry.percent / 100) * safeAmount).toFixed(2))
      splits.push({ member, amount: share, percent: entry.percent })
    })
  } else if (splitType === 'shares') {
    let totalShares = 0
    inputSplits.forEach((entry) => {
      if (!entry.member || typeof entry.shares !== 'number') {
        throw new Error('Share split requires member and shares count.')
      }
      totalShares += entry.shares
    })
    if (!totalShares) {
      throw new Error('Share splits must have at least one share.')
    }
    inputSplits.forEach((entry) => {
      const member = entry.member.toLowerCase()
      if (!normalizedMembers.includes(member)) {
        throw new Error(`Member ${member} is not part of this expense.`)
      }
      const share = Number(((entry.shares / totalShares) * safeAmount).toFixed(2))
      splits.push({ member, amount: share, shares: entry.shares })
    })
  } else if (splitType === 'exact' || splitType === 'settlement') {
    let total = 0
    inputSplits.forEach((entry) => {
      if (!entry.member || typeof entry.amount !== 'number') {
        throw new Error('Exact split requires member and amount.')
      }
      total += entry.amount
    })
    if (Number(total.toFixed(2)) !== Number(safeAmount.toFixed(2))) {
      throw new Error('Exact splits must add up to the total amount.')
    }
    inputSplits.forEach((entry) => {
      const member = entry.member.toLowerCase()
      if (!normalizedMembers.includes(member)) {
        throw new Error(`Member ${member} is not part of this expense.`)
      }
      splits.push({ member, amount: Number(entry.amount.toFixed(2)) })
    })
  } else {
    throw new Error('Unsupported split method.')
  }

  return splits
}

const calculateBalances = (group, expenses) => {
  const balances = {}
  const members = group.members.map((m) => m.email.toLowerCase())

  members.forEach((email) => {
    balances[email] = 0
  })

  expenses.forEach((expense) => {
    const payer = expense.paidBy?.toLowerCase()
    if (!balances[payer]) balances[payer] = 0
    balances[payer] += expense.amount

    expense.splits.forEach((split) => {
      const member = split.member?.toLowerCase()
      if (!balances[member]) balances[member] = 0
      balances[member] -= split.amount
    })
  })

  return members.map((email) => ({
    email,
    balance: Number((balances[email] || 0).toFixed(2))
  }))
}

router.post('/', async (req, res) => {
  try {
    const { name, category, photo, members = [] } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Group name is required.' })
    }

    const normalizedMembers = normalizeMembers(members, req.user)
    const group = await Group.create({
      name,
      category: category || 'Other',
      photo,
      owner: req.user._id,
      members: normalizedMembers,
      invitedEmails: normalizedMembers.map((m) => m.email)
    })

    res.status(201).json(group)
  } catch (err) {
    console.error('Create group error:', err)
    res.status(500).json({ message: 'Failed to create group.' })
  }
})

router.get('/', async (req, res) => {
  try {
    const email = memberIdentifier(req.user)
    const groups = await Group.find({
      $or: [{ owner: req.user._id }, { 'members.email': email }]
    })
      .sort({ createdAt: -1 })
      .lean()

    res.json(groups)
  } catch (err) {
    console.error('List groups error:', err)
    res.status(500).json({ message: 'Failed to load groups.' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).lean()
    if (!group) return res.status(404).json({ message: 'Group not found.' })

    const email = memberIdentifier(req.user)
    const isMember = group.owner.toString() === req.user._id.toString() || group.members.some((m) => m.email === email)
    if (!isMember) return res.status(403).json({ message: 'Not authorized.' })

    const expenses = await GroupExpense.find({ group: group._id }).sort({ createdAt: -1 }).lean()
    const messages = await GroupMessage.find({ group: group._id }).sort({ createdAt: -1 }).limit(50).lean()
    const balances = calculateBalances(group, expenses)

    res.json({
      group,
      expenses,
      balances,
      messages
    })
  } catch (err) {
    console.error('Get group error:', err)
    res.status(500).json({ message: 'Failed to load group.' })
  }
})

router.post('/:id/expenses', async (req, res) => {
  try {
    const { title, amount, currency, paidBy, splitType, includedMembers = [], splits = [], notes, proofImage } = req.body
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ message: 'Group not found.' })

    const email = memberIdentifier(req.user)
    const isMember = group.owner.toString() === req.user._id.toString() || group.members.some((m) => m.email === email)
    if (!isMember) return res.status(403).json({ message: 'Not authorized.' })

    const members = includedMembers.length
      ? includedMembers.map((m) => m.toLowerCase())
      : group.members.map((m) => m.email.toLowerCase())
    const splitsResult = buildSplits(splitType || 'equal', members, amount, splits)

    const expense = await GroupExpense.create({
      group: group._id,
      title,
      amount,
      currency: currency || group.settings?.currency || 'USD',
      paidBy: paidBy?.toLowerCase() || email,
      includedMembers: members,
      splitType: splitType || 'equal',
      splits: splitsResult,
      notes,
      proofImage,
      type: 'expense'
    })

    res.status(201).json(expense)
  } catch (err) {
    console.error('Add group expense error:', err)
    res.status(500).json({ message: err.message || 'Failed to add expense.' })
  }
})

router.post('/:id/settlements', async (req, res) => {
  try {
    const { from, to, amount, proofImage, notes } = req.body
    if (!from || !to || !amount) {
      return res.status(400).json({ message: 'From, to, and amount are required for settlement.' })
    }
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ message: 'Group not found.' })

    const fromMember = from.toLowerCase()
    const toMember = to.toLowerCase()
    const splits = buildSplits('settlement', [toMember], amount, [{ member: toMember, amount: Number(amount) }])

    const expense = await GroupExpense.create({
      group: group._id,
      title: `Settlement from ${fromMember} to ${toMember}`,
      amount,
      currency: group.settings?.currency || 'USD',
      paidBy: fromMember,
      includedMembers: [toMember],
      splitType: 'settlement',
      splits,
      notes,
      proofImage,
      type: 'settlement',
      status: 'settled'
    })

    res.status(201).json(expense)
  } catch (err) {
    console.error('Settlement error:', err)
    res.status(500).json({ message: err.message || 'Failed to record settlement.' })
  }
})

router.patch('/:id/expenses/:expenseId/payments', async (req, res) => {
  try {
    const { expenseId } = req.params
    const { payments = [] } = req.body
    const expense = await GroupExpense.findById(expenseId)
    if (!expense) return res.status(404).json({ message: 'Expense not found.' })

    payments.forEach((payment) => {
      const split = expense.splits.find((s) => s.member === payment.member?.toLowerCase())
      if (split) {
        split.status = payment.status || split.status
        split.proofImage = payment.proofImage || split.proofImage
        split.notes = payment.notes || split.notes
      }
    })

    expense.status = expense.splits.every((s) => s.status === 'paid' || s.status === 'verified') ? 'settled' : 'partial'
    await expense.save()

    res.json(expense)
  } catch (err) {
    console.error('Update payment error:', err)
    res.status(500).json({ message: err.message || 'Failed to update payment status.' })
  }
})

router.post('/:id/chat', async (req, res) => {
  try {
    const { message, attachments = [] } = req.body
    if (!message) return res.status(400).json({ message: 'Message cannot be empty.' })
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ message: 'Group not found.' })

    const email = memberIdentifier(req.user)
    const isMember = group.owner.toString() === req.user._id.toString() || group.members.some((m) => m.email === email)
    if (!isMember) return res.status(403).json({ message: 'Not authorized.' })

    const chatMessage = await GroupMessage.create({
      group: group._id,
      sender: {
        user: req.user._id,
        name: req.user.name,
        email
      },
      message,
      attachments
    })

    res.status(201).json(chatMessage)
  } catch (err) {
    console.error('Chat message error:', err)
    res.status(500).json({ message: 'Failed to send message.' })
  }
})

router.get('/:id/chat', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ message: 'Group not found.' })
    const email = memberIdentifier(req.user)
    const isMember = group.owner.toString() === req.user._id.toString() || group.members.some((m) => m.email === email)
    if (!isMember) return res.status(403).json({ message: 'Not authorized.' })

    const messages = await GroupMessage.find({ group: group._id }).sort({ createdAt: -1 }).limit(100).lean()
    res.json(messages)
  } catch (err) {
    console.error('Fetch chat error:', err)
    res.status(500).json({ message: 'Failed to load chat.' })
  }
})

export default router
