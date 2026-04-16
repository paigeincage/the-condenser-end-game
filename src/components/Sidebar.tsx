import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, Calendar, Users, Mail, ClipboardCheck, DollarSign, Home, ExternalLink } from 'lucide-react'
import { config } from '../config/builder'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/lots', icon: MapPin, label: 'Lots' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/trades', icon: Users, label: 'Trades' },
  { to: '/emails', icon: Mail, label: 'Emails' },
  { to: '/recordables', icon: ClipboardCheck, label: 'Recordables' },
  { to: '/purchase-orders', icon: DollarSign, label: 'Purchase Orders' },
  { to: '/plans', icon: Home, label: 'Plans' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-g900 border-r border-g100 flex flex-col z-10">
      {/* Brand */}
      <div className="p-5 border-b border-g100">
        <h1 className="text-lg font-bold text-g700 tracking-tight">
          Command <span className="text-copper">Center</span>
        </h1>
        <p className="text-xs text-g400 mt-0.5">{config.user.community} — {config.builder.name}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-copper-bg text-copper'
                  : 'text-g500 hover:text-g700 hover:bg-surface'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Quick links */}
      <div className="p-3 border-t border-g100 space-y-1">
        <a
          href={config.builder.portalUrl}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-g400 hover:text-copper hover:bg-copper-bg transition-colors"
        >
          <ExternalLink size={14} />
          Open {config.builder.portalName}
        </a>
        <a
          href="https://outlook.cloud.microsoft/mail/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-g400 hover:text-copper hover:bg-copper-bg transition-colors"
        >
          <ExternalLink size={14} />
          Open Outlook
        </a>
      </div>

      {/* User */}
      <div className="p-4 border-t border-g100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-copper text-white flex items-center justify-center text-xs font-bold">
            {config.user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-sm font-medium text-g700">{config.user.name}</div>
            <div className="text-xs text-g400">{config.user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
