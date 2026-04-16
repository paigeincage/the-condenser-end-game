import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Users, Phone, Mail, Search } from 'lucide-react'
import { useState } from 'react'

export function Trades() {
  const trades = useLiveQuery(() => db.trades.toArray()) ?? []
  const [search, setSearch] = useState('')

  const filtered = trades.filter(t =>
    !search ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.company.toLowerCase().includes(search.toLowerCase()) ||
    t.specialty.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-g700 flex items-center gap-2">
            <Users size={24} className="text-copper" /> Trade Partners
          </h1>
          <p className="text-g400 text-sm mt-0.5">{trades.length} contacts</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-g300" />
        <input
          type="text"
          placeholder="Search trades..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g700 placeholder:text-g300 focus:outline-none focus:border-copper"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map(trade => (
          <div key={trade.id} className="bg-g900 rounded-xl border border-g100 p-4 hover:border-copper transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-g700">{trade.company}</div>
                <div className="text-xs text-g400 mt-0.5">{trade.contact}</div>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 bg-copper-bg text-copper rounded">{trade.specialty}</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-g500">
              <a href={`tel:${trade.phone}`} className="flex items-center gap-1 hover:text-copper transition-colors">
                <Phone size={12} /> {trade.phone}
              </a>
              <a href={`mailto:${trade.email}`} className="flex items-center gap-1 hover:text-copper transition-colors">
                <Mail size={12} /> {trade.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
