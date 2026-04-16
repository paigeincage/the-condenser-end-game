import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { config } from '../config/builder'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'

export function Schedule() {
  const lots = useLiveQuery(() => db.lots.toArray()) ?? []

  // Group by SCAR stage, sorted by VFD within each
  const grouped = config.scarStages.map(stage => ({
    stage,
    lots: lots.filter(l => l.scarStage === stage).sort((a, b) => a.vfdDate.localeCompare(b.vfdDate)),
  })).filter(g => g.lots.length > 0)

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-g700 flex items-center gap-2">
          <Calendar size={24} className="text-copper" /> Schedule Overview
        </h1>
        <p className="text-g400 text-sm mt-0.5">{lots.length} lots across {grouped.length} SCAR stages</p>
      </div>

      {/* Full schedule table */}
      <div className="bg-g900 rounded-xl border border-g100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g100 bg-surface">
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Lot</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Address</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Current Task</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Days</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">VFD</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-g400 uppercase">Est. Finish</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(group => (
              <>
                <tr key={group.stage}>
                  <td colSpan={8} className="px-4 py-2 bg-surface-2">
                    <span className="text-xs font-bold text-g600 uppercase tracking-wide">{group.stage}</span>
                    <span className="text-xs text-g400 ml-2">({group.lots.length} lots)</span>
                  </td>
                </tr>
                {group.lots.map(lot => (
                  <tr key={lot.id} className="border-b border-g100 hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/lots/${lot.id}`} className="font-mono text-copper hover:underline">{lot.lotBlock}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/lots/${lot.id}`} className="font-medium text-g700 hover:text-copper">{lot.address}</Link>
                    </td>
                    <td className="px-4 py-3 text-g500">{lot.plan}</td>
                    <td className="px-4 py-3"><StageBadge stage={lot.scarStage} /></td>
                    <td className="px-4 py-3 text-g600 max-w-64 truncate">{lot.currentTask}</td>
                    <td className="px-4 py-3"><DaysBadge days={lot.taskDays} /></td>
                    <td className="px-4 py-3 text-g500">{lot.vfdDate}</td>
                    <td className="px-4 py-3 text-g500">{lot.estFinish}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
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
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors[stage] ?? ''}`}>{stage}</span>
}

function DaysBadge({ days }: { days: number }) {
  if (days < 0) return <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-danger-bg text-danger">{days}</span>
  if (days === 0) return <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-wip-bg text-wip">0</span>
  return <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-done-bg text-done">+{days}</span>
}
