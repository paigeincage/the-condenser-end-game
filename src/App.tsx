import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { seedDatabase } from './db/seed'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Lots } from './pages/Lots'
import { Schedule } from './pages/Schedule'
import { Trades } from './pages/Trades'
import { Emails } from './pages/Emails'
import { LotDetail } from './pages/LotDetail'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedDatabase().then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-g400 text-sm">Loading Command Center...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lots" element={<Lots />} />
            <Route path="/lots/:id" element={<LotDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
