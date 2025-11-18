import mongoose from 'mongoose'


const userSchema = new mongoose.Schema(
{
googleId: { type: String, required: true, unique: true },
name: String,
email: { type: String, lowercase: true, index: true },
avatar: String
},
{ timestamps: true }
)


export default mongoose.model('User', userSchema)