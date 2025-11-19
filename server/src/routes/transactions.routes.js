import { Router } from 'express'
import multer from 'multer'
import Transaction from '../models/Transaction.js'
import { ensureAuth } from '../middleware/auth.js'
import { extractExpensesFromFile } from '../services/gemini.js'


const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPG, PNG, or PDF files are allowed'))
  }
})

router.use(ensureAuth)

router.post('/extract', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please attach an image or PDF file.' })
      }

      const extraction = await extractExpensesFromFile(req.file)
      res.json(extraction)
    } catch (error) {
      console.error('Gemini extraction error:', error)
      res.status(500).json({ message: error.message || 'Failed to extract expenses from file.' })
    }
  })
})


// Create
router.post('/', async (req, res) => {
try {
const payload = { ...req.body, user: req.user._id }
if (!payload.paymentHistory || !payload.paymentHistory.length) {
payload.paymentHistory = [{
status: payload.paymentStatus || 'paid',
note: 'Initial status',
recordedBy: req.user._id
}]
}
const tx = await Transaction.create(payload)
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

router.post('/:id/payments', async (req, res) => {
try {
const { status, note, proofImage } = req.body
if (!status || !['paid', 'pending', 'partial'].includes(status)) {
return res.status(400).json({ message: 'Invalid status' })
}
const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id })
if (!tx) return res.status(404).json({ message: 'Not found' })
tx.paymentStatus = status
tx.paymentHistory.push({
status,
note,
proofImage,
recordedBy: req.user._id
})
await tx.save()
res.json(tx)
} catch (err) {
res.status(400).json({ message: err.message })
}
})

router.get('/payments/history', async (req, res) => {
try {
const entries = await Transaction.find({ user: req.user._id }, { paymentHistory: 1, title: 1, amount: 1 })
  .sort({ updatedAt: -1 })
  .lean()
const history = []
entries.forEach((tx) => {
tx.paymentHistory?.forEach((entry) => {
history.push({
transactionId: tx._id,
title: tx.title,
amount: tx.amount,
status: entry.status,
note: entry.note,
proofImage: entry.proofImage,
recordedAt: entry.recordedAt
})
})
})
history.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
res.json(history.slice(0, 50))
} catch (err) {
res.status(500).json({ message: err.message })
}
})

router.patch('/:id/reminder', async (req, res) => {
try {
const { enabled, remindAt, message } = req.body
const tx = await Transaction.findOneAndUpdate(
{ _id: req.params.id, user: req.user._id },
{
$set: {
reminders: {
enabled: Boolean(enabled),
remindAt: remindAt ? new Date(remindAt) : undefined,
message
}
}
},
{ new: true }
)
if (!tx) return res.status(404).json({ message: 'Not found' })
res.json(tx)
} catch (err) {
res.status(400).json({ message: err.message })
}
})


export default router
