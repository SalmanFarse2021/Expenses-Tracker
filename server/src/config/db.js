import mongoose from 'mongoose'

let memoryServer

const startMemoryServer = async () => {
  if (memoryServer) {
    return
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server')
  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: process.env.MONGO_IN_MEMORY_DB || 'expense-tracker'
    }
  })

  const uri = memoryServer.getUri()
  await mongoose.connect(uri)
  console.log('✅ MongoDB (in-memory) connected')
}

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI
  const useMemoryOnly = process.env.USE_IN_MEMORY_DB === 'true'

  if (!useMemoryOnly && mongoUri) {
    try {
      await mongoose.connect(mongoUri)
      console.log('✅ MongoDB connected')
      return
    } catch (err) {
      console.error('MongoDB connection error:', err.message)

      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }

      console.warn('Falling back to in-memory MongoDB for local development.')
    }
  } else if (!mongoUri) {
    console.warn('MONGO_URI not set. Using in-memory MongoDB instance.')
  }

  await startMemoryServer()
}

export const disconnectDB = async () => {
  await mongoose.connection.close()

  if (memoryServer) {
    await memoryServer.stop()
  }
}
