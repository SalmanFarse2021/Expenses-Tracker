import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, lowercase: true },
    name: String,
    role: { type: String, enum: ['owner', 'member'], default: 'member' }
  },
  { _id: false }
)

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Trip', 'Shopping', 'Friends', 'Roommates', 'Other'],
      default: 'Other'
    },
    photo: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    invitedEmails: [String],
    settings: {
      currency: { type: String, default: 'USD' }
    }
  },
  { timestamps: true }
)

export default mongoose.model('Group', groupSchema)
