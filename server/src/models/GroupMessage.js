import mongoose from 'mongoose'

const groupMessageSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    sender: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      email: String
    },
    message: { type: String, required: true },
    attachments: [String]
  },
  { timestamps: true }
)

export default mongoose.model('GroupMessage', groupMessageSchema)
