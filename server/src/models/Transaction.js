import mongoose from 'mongoose'


const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, default: 'General' },
    date: { type: Date, default: Date.now },
    notes: String,
    paymentMethod: { type: String, default: 'Card' },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'partial'],
      default: 'paid'
    },
    dueDate: { type: Date },
    groupName: String,
    paidBy: String,
    splits: [
      {
        member: String,
        amount: Number
      }
    ],
    receiptImage: String,
    vendor: String,
    tax: Number,
    items: [
      {
        name: String,
        price: Number,
        quantity: Number
      }
    ],
    paymentHistory: [
      {
        status: {
          type: String,
          enum: ['paid', 'pending', 'partial'],
          required: true
        },
        note: String,
        proofImage: String,
        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        recordedAt: { type: Date, default: Date.now }
      }
    ],
    reminders: {
      enabled: { type: Boolean, default: false },
      remindAt: Date,
      message: String
    }
  },
  { timestamps: true }
)


export default mongoose.model('Transaction', transactionSchema)
