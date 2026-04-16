import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { config } from '../config/builder'
import { Link } from 'react-router-dom'
import { MapPin, AlertTriangle, CheckCircle, Clock, Mail, ArrowRight, Hammer, Users } from 'lucide-react'
import { useState } from 'react'

export function Dashboard() {
  const allLots = useLiveQuery(() => db.lots.toArray()) ?? []
  const emails = useLiveQuery(() => db.emails.where('flagged').equals(1).toArray()) ?? []
  const [showAll, setShowAll] = useState(false)

  const lots = showAll ? allLots : allLots.filter(l => l.fieldContact === 'Beltran, Paige')

  // Group by SCAR stage
  const byStage: Record<string, number> = {}
  config.scarStages.forEach(s => { byStage[s] = 0 })
  lots.forEach(l => { byStage[l.scarStage] = (byStage[l.scarStage] ?? 0) + 1 })

  // Lots with negative task days (behind schedule)
  const behind = lots.filter(l => l.taskDays < 0)
  const onTrack = lots.filter(l => l.taskDays >= 0)

  // Active lots = not in "celebration" tasks (those are basically done)
  const activeLots = lots.filter(l => !l.currentTask.toLowerCase().includes('celebration'))
  const closedOut = lots.filter(l => l.currentTask.toLowerCase().includes('celebration'))

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-g700">
          {greeting()}, {config.user.name.split(' ')[0]}
        </h1>
        <p className="text-g400 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {' '}&middot; {config.user.community} ({config.user.communityId}) &middot; {config.user.market}
        </p>
      </div>

      {/* CM Filter */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setShowAll(false)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!showAll ? 'bg-copper text-white' : 'bg-surface text-g500 hover:text-g700'}`}
        >
          My Lots ({allLots.filter(l => l.fieldContact === 'Beltran, Paige').length})
        </button>
        <button
          onClick={() => setShowAll(true)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${showAll ? 'bg-copper text-white' : 'bg-surface text-g500 hover:text-g700'}`}
        >
          <Users size={14} /> All Patterson Ranch ({allLots.length})
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard icon={MapPin} label="Total Lots" value={lots.length} color="copper" />
        <StatCard icon={Hammer} label="Active" value={activeLots.length} color="info" />
        <StatCard icon={CheckCircle} label="Closed Out" value={closedOut.length} color="done" />
        <StatCard icon={Clock} label="On Track" value={onTrack.length} color="wip" />
        <StatCard icon={AlertTriangle} label="Behind" value={behind.length} color="danger" />
      </div>

      {/* SCAR Stage Pipeline */}
      <div className="bg-g900 rounded-xl border border-g100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-g700 mb-3">SCAR Pipeline</h2>
        <div className="flex gap-3">
          {config.scarStages.map(stage => {
            const count = byStage[stage]
            const pct = lots.length > 0 ? (count / lots.length) * 100 : 0
            return (
              <div key={stage} className="flex-1 bg-surface rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-g700">{count}</div>
                <div className="text-xs text-g400 mt-0.5">{stage}</div>
                <div className="mt-2 h-1.5 bg-g100 rounded-full overflow-hidden">
                  <div className="h-full bg-copper rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column — Active Lots by urgency */}
        <div className="col-span-2 space-y-6">
          {/* Current Tasks — what needs attention today */}
          <section className="bg-g900 rounded-xl border border-g100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-g700">Active Lots — Current Tasks</h2>
              <Link to="/lots" className="text-xs text-copper hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {activeLots
                .sort((a, b) => a.taskDays - b.taskDays)
                .map(lot => (
                <Link
                  key={lot.id}
                  to={`/lots/${lot.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-2 transition-colors"
                >
                  <DaysBadge days={lot.taskDays} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-g700 truncate">
                      {lot.currentTask}
                    </div>
                    <div className="text-xs text-g400 truncate">
                      {lot.address} &middot; Lot {lot.lotBlock} &middot; {lot.fieldContact.split(', ')[1]}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <StageBadge stage={lot.scarStage} />
                    <div className="text-xs text-g400 mt-1">VFD {lot.vfdDate}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Closed Out */}
          {closedOut.length > 0 && (
            <section className="bg-g900 rounded-xl border border-g100 p-5">
              <h2 className="text-base font-semibold text-g700 mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-done" />
                Closed Out — Build Quality Celebration
              </h2>
              <div className="space-y-2">
                {closedOut.map(lot => (
                  <Link
                    key={lot.id}
                    to={`/lots/${lot.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-done-bg hover:bg-surface-2 transition-colors"
                  >
                    <CheckCircle size={16} className="text-done shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-g700 truncate">{lot.address}</div>
                      <div className="text-xs text-g400">Lot {lot.lotBlock} &middot; {lot.plan} &middot; {lot.buyer ?? 'Spec'}</div>
                    </div>
                    <div className="text-xs text-g400">{lot.productType}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Flagged Emails */}
          <section className="bg-g900 rounded-xl border border-g100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-g700 flex items-center gap-2">
                <Mail size={16} className="text-copper" />
                Flagged Emails
              </h2>
              <Link to="/emails" className="text-xs text-copper hover:underline">View all</Link>
            </div>
            {emails.length === 0 ? (
              <p className="text-sm text-g400 py-4">No flagged emails.</p>
            ) : (
              <div className="space-y-2">
                {emails.map(email => (
                  <div key={email.id} className="p-3 rounded-lg bg-surface hover:bg-surface-2 transition-colors cursor-pointer">
                    <div className="text-xs text-copper font-medium">{email.from}</div>
                    <div className="text-sm font-medium text-g700 mt-0.5 truncate">{email.subject}</div>
                    <div className="text-xs text-g400 mt-1 line-clamp-2">{email.snippet}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="bg-g900 rounded-xl border border-g100 p-5">
            <h2 className="text-base font-semibold text-g700 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/lots" className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-g600 bg-surface hover:bg-copper-bg hover:text-copper transition-colors">
                + Add New Lot
              </Link>
              <Link to="/trades" className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-g600 bg-surface hover:bg-copper-bg hover:text-copper transition-colors">
                + Add Trade Contact
              </Link>
              <a
                href={config.builder.portalUrl}
                target="_blank"
                rel="noopener"
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-g600 bg-surface hover:bg-copper-bg hover:text-copper transition-colors"
              >
                Open {config.builder.portalName}
              </a>
              <a
                href="https://outlook.cloud.microsoft/mail/"
                target="_blank"
                rel="noopener"
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-g600 bg-surface hover:bg-copper-bg hover:text-copper transition-colors"
              >
                Open Outlook
              </a>
            </div>
          </section>

          {/* Plan Mix */}
          <section className="bg-g900 rounded-xl border border-g100 p-5">
            <h2 className="text-base font-semibold text-g700 mb-4">Plan Mix</h2>
            <div className="space-y-2">
              {config.plans.map(plan => {
                const count = lots.filter(l => l.plan === plan).length
                if (count === 0) return null
                return (
                  <div key={plan} className="flex items-center justify-between text-sm">
                    <span className="text-g500">{plan}</span>
                    <span className="text-g700 font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  const colorMap: Record<string, string> = {
    copper: 'text-copper bg-copper-bg',
    info: 'text-info bg-info-bg',
    wip: 'text-wip bg-wip-bg',
    danger: 'text-danger bg-danger-bg',
    done: 'text-done bg-done-bg',
  }
  const cls = colorMap[color] ?? colorMap.copper
  return (
    <div className="bg-g900 rounded-xl border border-g100 p-4">
      <div className={`inline-flex p-2 rounded-lg ${cls} mb-3`}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-bold text-g700">{value}</div>
      <div className="text-xs text-g400 mt-0.5">{label}</div>
    </div>
  )
}

function DaysBadge({ days }: { days: number }) {
  if (days < 0) {
    return <div className="text-xs font-bold px-2 py-1 rounded bg-danger-bg text-danger shrink-0">{days}d</div>
  }
  if (days === 0) {
    return <div className="text-xs font-bold px-2 py-1 rounded bg-wip-bg text-wip shrink-0">Today</div>
  }
  return <div className="text-xs font-bold px-2 py-1 rounded bg-done-bg text-done shrink-0">+{days}d</div>
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
