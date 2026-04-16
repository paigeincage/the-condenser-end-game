import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Link } from 'react-router-dom'
import { MapPin, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { config } from '../config/builder'
import { AddLotModal } from '../components/AddLotModal'

export function Lots() {
  const allLots = useLiveQuery(() => db.lots.toArray()) ?? []
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterCM, setFilterCM] = useState('Beltran, Paige')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = allLots.filter(l => {
    const matchSearch = !search ||
      l.address.toLowerCase().includes(search.toLowerCase()) ||
      l.plan.toLowerCase().includes(search.toLowerCase()) ||
      l.lotBlock.includes(search) ||
      (l.buyer ?? '').toLowerCase().includes(search.toLowerCase()) ||
      l.currentTask.toLowerCase().includes(search.toLowerCase())
    const matchStage = !filterStage || l.scarStage === filterStage
    const matchCM = !filterCM || l.fieldContact === filterCM
    return matchSearch && matchStage && matchCM
  })

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-g700">Lots</h1>
          <p className="text-g400 text-sm mt-0.5">{filtered.length} lots in {config.user.community}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-copper text-white text-sm font-medium rounded-lg hover:bg-copper-light transition-colors"
        >
          <Plus size={16} /> Add Lot
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-g300" />
          <input
            type="text"
            placeholder="Search address, lot #, plan, buyer, task..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g700 placeholder:text-g300 focus:outline-none focus:border-copper"
          />
        </div>
        <select
          value={filterCM}
          onChange={e => setFilterCM(e.target.value)}
          className="px-3 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g600 focus:outline-none focus:border-copper"
        >
          <option value="">All CMs</option>
          {config.fieldContacts.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          className="px-3 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g600 focus:outline-none focus:border-copper"
        >
          <option value="">All Stages</option>
          {config.scarStages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Lots grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered
          .sort((a, b) => a.vfdDate.localeCompare(b.vfdDate))
          .map(lot => (
          <Link
            key={lot.id}
            to={`/lots/${lot.id}`}
            className="bg-g900 rounded-xl border border-g100 p-4 hover:border-copper transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-copper" />
                <span className="text-sm font-semibold text-g700 group-hover:text-copper transition-colors">{lot.address}</span>
              </div>
              <StageBadge stage={lot.scarStage} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-g400">
              <span className="font-mono">Lot {lot.lotBlock}</span>
              <span>&middot;</span>
              <span>{lot.plan}</span>
              <span>&middot;</span>
              <span>{lot.elevation}</span>
              <span>&middot;</span>
              <span>{lot.productType}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <DaysBadge days={lot.taskDays} />
              <span className="text-xs text-g600 truncate">{lot.currentTask}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-g400">
              <span>{lot.fieldContact.split(', ')[1]} &middot; VFD: {lot.vfdDate}</span>
              {lot.buyer && <span className="text-g500">{lot.buyer}</span>}
              {!lot.buyer && <span className="italic text-g300">No buyer</span>}
            </div>
          </Link>
        ))}
      </div>

      {showAdd && <AddLotModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    Start: 'bg-info-bg text-info',
    Frame: 'bg-wip-bg text-wip',
    Second: 'bg-copper-bg text-copper',
    Final: 'bg-done-bg text-done',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors[stage] ?? 'bg-surface text-g400'}`}>{stage}</span>
}

function DaysBadge({ days }: { days: number }) {
  if (days < 0) return <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-danger-bg text-danger">{days}d</span>
  if (days === 0) return <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-wip-bg text-wip">Today</span>
  return <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-done-bg text-done">+{days}d</span>
}
