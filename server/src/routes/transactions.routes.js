import { Router } from 'express'
import Transaction from '../models/Transaction.js'
import { ensureAuth } from '../middleware/auth.js'


const router = Router()
router.use(ensureAuth)


// Create
router.post('/', async (req, res) => {
try {
const tx = await Transaction.create({ ...req.body, user: req.user._id })
res.status(201).json(tx)
} catch (err) {
res.status(400).json({ message: err.message })
}
})


// Read (with simple filters)
router.get('/', async (req, res) => {
try {
const { from, to, category } = req.query
const q = { user: req.user._id }
if (category) q.category = category
if (from || to) q.date = {}
if (from) q.date.$gte = new Date(from)
if (to) q.date.$lte = new Date(to)


const items = await Transaction.find(q).sort({ date: -1 })
res.json(items)
} catch (err) {
res.status(500).json({ message: err.message })
}
})


// Update
router.put('/:id', async (req, res) => {
try {
const updated = await Transaction.findOneAndUpdate(
{ _id: req.params.id, user: req.user._id },
req.body,
{ new: true }
)
if (!updated) return res.status(404).json({ message: 'Not found' })
res.json(updated)
} catch (err) {
res.status(400).json({ message: err.message })
}
})


// Delete
router.delete('/:id', async (req, res) => {
try {
const del = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id })
if (!del) return res.status(404).json({ message: 'Not found' })
res.json({ ok: true })
} catch (err) {
res.status(400).json({ message: err.message })
}
})


export default router