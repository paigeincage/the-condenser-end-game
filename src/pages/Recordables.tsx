import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Link } from 'react-router-dom'
import { ClipboardCheck, AlertTriangle, Shield, XCircle, Search } from 'lucide-react'
import { useState } from 'react'

export function Recordables() {
  const recordables = useLiveQuery(() => db.recordables.toArray()) ?? []
  const lots = useLiveQuery(() => db.lots.toArray()) ?? []
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const categories = [...new Set(recordables.map(r => r.category))].sort()

  const filtered = recordables.filter(r => {
    const matchSearch = !search ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.tradePartner.toLowerCase().includes(search.toLowerCase()) ||
      r.lotBlock.includes(search) ||
      r.address.toLowerCase().includes(search.toLowerCase()) ||
      r.linkedTask.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !filterCategory || r.category === filterCategory
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchCategory && matchStatus
  })

  const openCount = recordables.filter(r => r.status === 'Open').length
  const closedCount = recordables.filter(r => r.status === 'Closed').length

  // Count by category
  const byCat: Record<string, number> = {}
  recordables.forEach(r => { byCat[r.category] = (byCat[r.category] ?? 0) + 1 })

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-g700 flex items-center gap-2">
            <ClipboardCheck size={24} className="text-copper" /> Recordables
          </h1>
          <p className="text-g400 text-sm mt-0.5">{recordables.length} total &middot; {openCount} open &middot; {closedCount} closed</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-g900 rounded-xl border border-g100 p-4">
          <div className="inline-flex p-2 rounded-lg bg-danger-bg text-danger mb-2"><AlertTriangle size={18} /></div>
          <div className="text-2xl font-bold text-g700">{openCount}</div>
          <div className="text-xs text-g400">Open</div>
        </div>
        {Object.entries(byCat).map(([cat, count]) => (
          <div key={cat} className="bg-g900 rounded-xl border border-g100 p-4">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${
              cat === 'Safety' ? 'bg-danger-bg text-danger' :
              cat === 'Failed Municipal Inspection' ? 'bg-wip-bg text-wip' :
              'bg-copper-bg text-copper'
            }`}>
              {cat === 'Safety' ? <Shield size={18} /> : cat === 'Failed Municipal Inspection' ? <XCircle size={18} /> : <ClipboardCheck size={18} />}
            </div>
            <div className="text-2xl font-bold text-g700">{count}</div>
            <div className="text-xs text-g400">{cat}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-g300" />
          <input
            type="text"
            placeholder="Search recordables..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g700 placeholder:text-g300 focus:outline-none focus:border-copper"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g600 focus:outline-none focus:border-copper"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g600 focus:outline-none focus:border-copper"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Recordables list */}
      <div className="space-y-3">
        {filtered
          .sort((a, b) => b.dateCreated.localeCompare(a.dateCreated))
          .map(rec => {
            const lot = lots.find(l => l.lotBlock === rec.lotBlock)
            const isOverdue = rec.dateDue && rec.dateDue < new Date().toISOString().split('T')[0] && rec.status === 'Open'

            return (
              <div key={rec.id} className={`bg-g900 rounded-xl border p-4 ${isOverdue ? 'border-danger' : 'border-g100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge category={rec.category} />
                      <StatusBadge status={rec.status} priority={rec.priority} />
                      {isOverdue && <span className="text-xs font-bold text-danger">OVERDUE</span>}
                    </div>
                    <div className="text-sm font-medium text-g700 mt-1">{rec.description}</div>
                    <div className="text-xs text-g400 mt-1">
                      <span className="text-copper font-medium">{rec.tradePartner}</span>
                      <span className="mx-1">&middot;</span>
                      {rec.tradePartnerId}
                    </div>
                    <div className="text-xs text-g400 mt-1">
                      Task: <span className="text-g600">{rec.linkedTask}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {lot ? (
                      <Link to={`/lots/${lot.id}`} className="text-sm font-medium text-copper hover:underline">
                        Lot {rec.lotBlock}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-g500">Lot {rec.lotBlock}</span>
                    )}
                    <div className="text-xs text-g400">{rec.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-g100 text-xs text-g400">
                  <span>Created: {rec.dateCreated}</span>
                  <span>Confirmed: {rec.dateConfirmed}</span>
                  {rec.dateDue && <span className={isOverdue ? 'text-danger font-bold' : ''}>Due: {rec.dateDue}</span>}
                  <span>Owner: {rec.owner}</span>
                </div>
              </div>
            )
          })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-g400 text-sm">No recordables match your filters.</div>
      )}
    </div>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, { bg: string, text: string, short: string }> = {
    'Failed Municipal Inspection': { bg: 'bg-wip-bg', text: 'text-wip', short: 'Failed Inspection' },
    'PCS Error': { bg: 'bg-copper-bg', text: 'text-copper', short: 'PCS Error' },
    'Safety': { bg: 'bg-danger-bg', text: 'text-danger', short: 'Safety' },
  }
  const m = map[category] ?? { bg: 'bg-surface', text: 'text-g500', short: category }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${m.bg} ${m.text}`}>{m.short}</span>
}

function StatusBadge({ status, priority }: { status: string, priority: string }) {
  const isOpen = status === 'Open'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${isOpen ? 'bg-danger-bg text-danger' : 'bg-done-bg text-done'}`}>
      {status} / {priority}
    </span>
  )
}
