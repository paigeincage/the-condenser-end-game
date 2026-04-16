import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { DollarSign, Search, TrendingUp, TrendingDown, FileText } from 'lucide-react'
import { useState } from 'react'

export function PurchaseOrders() {
  const pos = useLiveQuery(() => db.purchaseOrders.toArray()) ?? []
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCM, setFilterCM] = useState('')

  const filtered = pos.filter(po => {
    const matchSearch = !search ||
      po.poNumber.includes(search) ||
      po.lotInfo.toLowerCase().includes(search.toLowerCase()) ||
      po.accountCategory.toLowerCase().includes(search.toLowerCase()) ||
      (po.backchargedTrade ?? '').toLowerCase().includes(search.toLowerCase()) ||
      po.createdBy.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || po.type === filterType
    const matchCM = !filterCM || po.createdBy === filterCM
    return matchSearch && matchType && matchCM
  })

  const types = [...new Set(pos.map(p => p.type))].sort()
  const cms = [...new Set(pos.map(p => p.createdBy))].sort()

  // Stats
  const totalSpend = pos.filter(p => p.amount > 0).reduce((sum, p) => sum + p.amount, 0)
  const totalBackcharges = pos.filter(p => p.amount < 0).reduce((sum, p) => sum + Math.abs(p.amount), 0)
  const myPOs = pos.filter(p => p.createdBy === 'Beltran, Paige')
  const mySpend = myPOs.filter(p => p.amount > 0).reduce((sum, p) => sum + p.amount, 0)

  // Top backcharged trades
  const tradeSpend: Record<string, number> = {}
  pos.forEach(po => {
    if (po.backchargedTrade) {
      const trades = po.backchargedTrade.split(' / ')
      trades.forEach(t => { tradeSpend[t] = (tradeSpend[t] ?? 0) + Math.abs(po.amount) })
    }
  })
  const topTrades = Object.entries(tradeSpend).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-g700 flex items-center gap-2">
            <DollarSign size={24} className="text-copper" /> Field Purchase Orders
          </h1>
          <p className="text-g400 text-sm mt-0.5">{pos.length} POs &middot; Patterson Ranch</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-g900 rounded-xl border border-g100 p-4">
          <div className="inline-flex p-2 rounded-lg bg-copper-bg text-copper mb-2"><FileText size={18} /></div>
          <div className="text-2xl font-bold text-g700">{pos.length}</div>
          <div className="text-xs text-g400">Total POs</div>
        </div>
        <div className="bg-g900 rounded-xl border border-g100 p-4">
          <div className="inline-flex p-2 rounded-lg bg-danger-bg text-danger mb-2"><TrendingUp size={18} /></div>
          <div className="text-2xl font-bold text-g700">{fmt(totalSpend)}</div>
          <div className="text-xs text-g400">Total Spend</div>
        </div>
        <div className="bg-g900 rounded-xl border border-g100 p-4">
          <div className="inline-flex p-2 rounded-lg bg-done-bg text-done mb-2"><TrendingDown size={18} /></div>
          <div className="text-2xl font-bold text-g700">{fmt(totalBackcharges)}</div>
          <div className="text-xs text-g400">Backcharges Recovered</div>
        </div>
        <div className="bg-g900 rounded-xl border border-g100 p-4">
          <div className="inline-flex p-2 rounded-lg bg-info-bg text-info mb-2"><DollarSign size={18} /></div>
          <div className="text-2xl font-bold text-g700">{fmt(mySpend)}</div>
          <div className="text-xs text-g400">My POs ({myPOs.length})</div>
        </div>
      </div>

      {/* Top Backcharged Trades */}
      {topTrades.length > 0 && (
        <div className="bg-g900 rounded-xl border border-g100 p-5 mb-6">
          <h2 className="text-sm font-semibold text-g700 mb-3">Top Backcharged Trades</h2>
          <div className="grid grid-cols-5 gap-3">
            {topTrades.map(([trade, amount]) => (
              <div key={trade} className="bg-surface rounded-lg p-3">
                <div className="text-xs text-g400 truncate">{trade}</div>
                <div className="text-sm font-bold text-danger mt-1">{fmt(amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-g300" />
          <input
            type="text"
            placeholder="Search PO#, lot, category, trade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g700 placeholder:text-g300 focus:outline-none focus:border-copper"
          />
        </div>
        <select value={filterCM} onChange={e => setFilterCM(e.target.value)} className="px-3 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g600 focus:outline-none focus:border-copper">
          <option value="">All Issuers</option>
          {cms.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-g900 border border-g100 rounded-lg text-sm text-g600 focus:outline-none focus:border-copper">
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* PO Table */}
      <div className="bg-g900 rounded-xl border border-g100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g100 bg-surface">
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">PO#</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Issuer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Lot</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Backcharged</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-g400 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(po => (
              <tr key={po.id} className="border-b border-g100 hover:bg-surface transition-colors">
                <td className="px-4 py-3 text-g500 whitespace-nowrap">{po.date}</td>
                <td className="px-4 py-3 font-mono text-copper">{po.poNumber}</td>
                <td className="px-4 py-3"><TypeBadge type={po.type} /></td>
                <td className="px-4 py-3 text-g600">{po.createdBy.split(', ')[1]}</td>
                <td className="px-4 py-3 text-g600 max-w-40 truncate">{po.lotInfo}</td>
                <td className="px-4 py-3 text-g500 max-w-48 truncate">{po.accountCategory}</td>
                <td className="px-4 py-3 text-g500 max-w-36 truncate">{po.backchargedTrade ?? '—'}</td>
                <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${po.amount < 0 ? 'text-done' : 'text-g700'}`}>
                  {po.amount < 0 ? `(${fmt(Math.abs(po.amount))})` : fmt(po.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-g400 text-right">
        Showing {filtered.length} of {pos.length} POs &middot; Total: {fmt(filtered.reduce((s, p) => s + p.amount, 0))}
      </div>
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    Overhead: 'bg-copper-bg text-copper',
    Backcharge: 'bg-done-bg text-done',
    'House WIP': 'bg-info-bg text-info',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[type] ?? 'bg-surface text-g400'}`}>{type}</span>
}
