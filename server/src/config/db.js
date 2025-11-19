import mongoose from 'mongoose'

let memoryServer

const DEFAULT_TIMEOUT_MS = 5000

const buildConnectionOptions = () => {
  const timeoutFromEnv = Number.parseInt(
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    10
  )

  return {
    serverSelectionTimeoutMS:
      Number.isFinite(timeoutFromEnv) && timeoutFromEnv > 0
        ? timeoutFromEnv
        : DEFAULT_TIMEOUT_MS
  }
}

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
  await mongoose.connect(uri, buildConnectionOptions())
  console.log('✅ MongoDB (in-memory) connected')
}

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI
  const useMemoryOnly = process.env.USE_IN_MEMORY_DB === 'true'

  if (!useMemoryOnly && mongoUri) {
    try {
      await mongoose.connect(mongoUri, buildConnectionOptions())
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
