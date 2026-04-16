import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { config } from '../config/builder'
import { ArrowLeft, Calendar, Mail, User, Home, Clock } from 'lucide-react'

export function LotDetail() {
  const { id } = useParams()
  const lotId = Number(id)
  const lot = useLiveQuery(() => db.lots.get(lotId), [lotId])
  const scheduleItems = useLiveQuery(() => db.schedule.where('lotId').equals(lotId).toArray(), [lotId]) ?? []
  const emails = useLiveQuery(() => db.emails.where('lotId').equals(lotId).toArray(), [lotId]) ?? []

  if (!lot) {
    return <div className="text-g400 text-sm py-12">Lot not found.</div>
  }

  const stageIdx = config.scarStages.indexOf(lot.scarStage)

  return (
    <div className="max-w-4xl">
      <Link to="/lots" className="inline-flex items-center gap-1 text-sm text-g400 hover:text-copper mb-4">
        <ArrowLeft size={14} /> Back to Lots
      </Link>

      {/* Header */}
      <div className="bg-g900 rounded-xl border border-g100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-g700">{lot.address}</h1>
            <p className="text-sm text-g400 mt-1">Lot {lot.lotBlock} &middot; {config.user.community}</p>
          </div>
          <div className="text-right">
            <StageBadge stage={lot.scarStage} />
            <div className="text-xs text-g400 mt-2">VFD: {lot.vfdDate}</div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <InfoCard icon={Home} label="Plan" value={lot.plan} sub={lot.elevation} />
          <InfoCard icon={User} label="Buyer" value={lot.buyer ?? 'No buyer'} sub={lot.productType} />
          <InfoCard icon={Calendar} label="Est. Finish" value={lot.estFinish} sub={`VFD: ${lot.vfdDate}`} />
          <InfoCard icon={Clock} label="Task Days" value={lot.taskDays <= 0 ? `${lot.taskDays}` : `+${lot.taskDays}`} sub={lot.taskDays < 0 ? 'Behind' : lot.taskDays === 0 ? 'On track' : 'Ahead'} />
        </div>

        {/* Current Task */}
        <div className={`mt-4 p-4 rounded-lg ${lot.taskDays < 0 ? 'bg-danger-bg' : lot.taskDays === 0 ? 'bg-wip-bg' : 'bg-done-bg'}`}>
          <div className="text-xs text-g400 mb-1">Current Task</div>
          <div className={`text-sm font-semibold ${lot.taskDays < 0 ? 'text-danger' : lot.taskDays === 0 ? 'text-wip' : 'text-done'}`}>
            {lot.currentTask}
          </div>
        </div>

        {lot.notes && (
          <div className="mt-3 p-3 bg-wip-bg rounded-lg text-sm text-wip">{lot.notes}</div>
        )}
      </div>

      {/* SCAR Progress Bar */}
      <div className="bg-g900 rounded-xl border border-g100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-g700 mb-3">SCAR Progress</h2>
        <div className="flex gap-2">
          {config.scarStages.map((stage, i) => (
            <div key={stage} className="flex-1">
              <div
                className={`h-3 rounded-full ${
                  i < stageIdx ? 'bg-done' : i === stageIdx ? 'bg-copper' : 'bg-g100'
                }`}
              />
              <div className={`text-xs mt-1.5 text-center ${i === stageIdx ? 'text-copper font-semibold' : 'text-g400'}`}>
                {stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Details Table */}
      <div className="bg-g900 rounded-xl border border-g100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-g700 mb-3">Lot Details</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <Detail label="Lot/Block" value={lot.lotBlock} />
          <Detail label="Address" value={lot.address} />
          <Detail label="Plan / Template" value={lot.planFull} />
          <Detail label="Elevation" value={lot.elevation} />
          <Detail label="Product Type" value={lot.productType} />
          <Detail label="SCAR Stage" value={lot.scarStage} />
          <Detail label="VFD Date" value={lot.vfdDate} />
          <Detail label="Est. Finish" value={lot.estFinish} />
          <Detail label="Current Task" value={lot.currentTask} />
          <Detail label="Task Days" value={`${lot.taskDays}`} />
          <Detail label="Buyer" value={lot.buyer ?? '—'} />
          <Detail label="Last Updated" value={lot.updatedAt} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Schedule */}
        <section className="bg-g900 rounded-xl border border-g100 p-5">
          <h2 className="text-sm font-semibold text-g700 mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-copper" /> Schedule Items
          </h2>
          {scheduleItems.length === 0 ? (
            <p className="text-sm text-g400 py-4">No schedule items linked yet. Use the bookmarklet to pull detailed schedule data.</p>
          ) : (
            <div className="space-y-2">
              {scheduleItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-g700">{item.trade}</div>
                    <div className="text-xs text-g400">{item.scheduledDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Emails */}
        <section className="bg-g900 rounded-xl border border-g100 p-5">
          <h2 className="text-sm font-semibold text-g700 mb-3 flex items-center gap-2">
            <Mail size={14} className="text-copper" /> Related Emails
          </h2>
          {emails.length === 0 ? (
            <p className="text-sm text-g400 py-4">No linked emails yet.</p>
          ) : (
            <div className="space-y-2">
              {emails.map(email => (
                <div key={email.id} className="p-2 rounded-lg bg-surface">
                  <div className="text-xs text-copper">{email.from}</div>
                  <div className="text-sm font-medium text-g700 truncate">{email.subject}</div>
                  <div className="text-xs text-g400 mt-0.5 line-clamp-2">{email.snippet}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <div className="bg-surface rounded-lg p-3">
      <div className="text-xs text-g400 flex items-center gap-1"><Icon size={12} /> {label}</div>
      <div className="text-sm font-medium text-g700 mt-1">{value}</div>
      <div className="text-xs text-g400 mt-0.5">{sub}</div>
    </div>
  )
}

function Detail({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-g100">
      <span className="text-g400">{label}</span>
      <span className="text-g700 font-medium text-right">{value}</span>
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
