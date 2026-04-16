import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { plansRouter } from './routes/plans.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT || '3000')

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/plans', plansRouter)

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Serve frontend (production)
app.use(express.static(path.join(__dirname, '../dist')))
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`[CommandCenter] Server running on port ${PORT}`)
})
