import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { configurePassport } from './config/passport.js'
import authRoutes from './routes/auth.routes.js'
import txRoutes from './routes/transactions.routes.js'
import summaryRoutes from './routes/summary.routes.js'
import groupRoutes from './routes/groups.routes.js'


dotenv.config()
await connectDB()
configurePassport()


const app = express()
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173'


app.use(morgan('dev'))
app.use(express.json())
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
)


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient()
    })
  })
)


app.use(passport.initialize())
app.use(passport.session())


app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/transactions', txRoutes)
app.use('/api/summary', summaryRoutes)
app.use('/api/groups', groupRoutes)


const port = process.env.PORT || 5000
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`))
