import mongoose from 'mongoose'


const transactionSchema = new mongoose.Schema(
{
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
title: { type: String, required: true },
amount: { type: Number, required: true },
type: { type: String, enum: ['income', 'expense'], required: true },
category: { type: String, default: 'General' },
date: { type: Date, default: Date.now },
notes: String
},
{ timestamps: true }
)


export default mongoose.model('Transaction', transactionSchema)