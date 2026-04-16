import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Mail, Flag, ExternalLink, Lock } from 'lucide-react'

export function Emails() {
  const emails = useLiveQuery(() => db.emails.toArray()) ?? []
  const lots = useLiveQuery(() => db.lots.toArray()) ?? []

  const flagged = emails.filter(e => e.flagged)
  const rest = emails.filter(e => !e.flagged)

  const toggleFlag = async (id: number, current: boolean) => {
    await db.emails.update(id, { flagged: current ? 0 as any : 1 as any })
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-g700 flex items-center gap-2">
            <Mail size={24} className="text-copper" /> Emails
          </h1>
          <p className="text-g400 text-sm mt-0.5">{emails.length} emails linked</p>
        </div>
        <a
          href="https://outlook.cloud.microsoft/mail/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 px-4 py-2 bg-surface text-g600 text-sm font-medium rounded-lg hover:bg-copper-bg hover:text-copper transition-colors"
        >
          <ExternalLink size={14} /> Open Outlook
        </a>
      </div>

      {/* Outlook Connect Banner */}
      <div className="bg-info-bg border border-blue-200 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Lock size={20} className="text-info mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-info">Outlook Integration — Coming Soon</h3>
            <p className="text-xs text-g500 mt-1">
              We'll connect to your <strong>pbeltran@pulte.com</strong> inbox via Microsoft Graph API.
              Emails will auto-link to lots and trades. For now, emails shown here are manually linked.
            </p>
            <button className="mt-3 px-3 py-1.5 bg-info text-white text-xs font-medium rounded-lg opacity-50 cursor-not-allowed">
              Connect Outlook (Soon)
            </button>
          </div>
        </div>
      </div>

      {/* Flagged */}
      {flagged.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-g700 mb-3 flex items-center gap-2">
            <Flag size={14} className="text-danger" /> Flagged ({flagged.length})
          </h2>
          <div className="space-y-2">
            {flagged.map(email => {
              const lot = email.lotId ? lots.find(l => l.id === email.lotId) : null
              return (
                <EmailCard key={email.id} email={email} lot={lot} onToggleFlag={toggleFlag} />
              )
            })}
          </div>
        </section>
      )}

      {/* All */}
      <section>
        <h2 className="text-sm font-semibold text-g700 mb-3">All Emails</h2>
        <div className="space-y-2">
          {rest.map(email => {
            const lot = email.lotId ? lots.find(l => l.id === email.lotId) : null
            return (
              <EmailCard key={email.id} email={email} lot={lot} onToggleFlag={toggleFlag} />
            )
          })}
        </div>
      </section>
    </div>
  )
}

function EmailCard({ email, lot, onToggleFlag }: { email: any, lot: any, onToggleFlag: (id: number, current: boolean) => void }) {
  return (
    <div className="bg-g900 rounded-xl border border-g100 p-4 hover:border-copper transition-colors">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleFlag(email.id, email.flagged)}
          className={`mt-0.5 ${email.flagged ? 'text-danger' : 'text-g200 hover:text-danger'} transition-colors`}
        >
          <Flag size={14} fill={email.flagged ? 'currentColor' : 'none'} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-copper font-medium">{email.from}</span>
            <span className="text-xs text-g300">{email.date}</span>
          </div>
          <div className="text-sm font-medium text-g700 mt-0.5">{email.subject}</div>
          <div className="text-xs text-g400 mt-1 line-clamp-2">{email.snippet}</div>
          {(lot || email.trade) && (
            <div className="flex items-center gap-2 mt-2">
              {lot && <span className="text-xs bg-surface text-g500 px-2 py-0.5 rounded">{lot.address}</span>}
              {email.trade && <span className="text-xs bg-copper-bg text-copper px-2 py-0.5 rounded">{email.trade}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
