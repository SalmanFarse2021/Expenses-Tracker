import mongoose from 'mongoose'

const splitSchema = new mongoose.Schema(
  {
    member: { type: String, required: true }, // email or username
    amount: { type: Number, default: 0 },
    percent: Number,
    shares: Number,
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'verified'],
      default: 'unpaid'
    },
    proofImage: String,
    notes: String
  },
  { _id: false }
)

const groupExpenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paidBy: { type: String, required: true },
    includedMembers: [String],
    splitType: {
      type: String,
      enum: ['equal', 'percent', 'shares', 'exact', 'settlement'],
      default: 'equal'
    },
    splits: [splitSchema],
    notes: String,
    proofImage: String,
    type: {
      type: String,
      enum: ['expense', 'settlement'],
      default: 'expense'
    },
    status: {
      type: String,
      enum: ['pending', 'settled', 'partial'],
      default: 'pending'
    },
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
)

export default mongoose.model('GroupExpense', groupExpenseSchema)
