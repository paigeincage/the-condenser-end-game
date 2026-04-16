import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Link } from 'react-router-dom'
import {
  FileUp, Loader, Eye, Brain, Trash2, ChevronLeft, ChevronRight, ChevronDown,
  Home, Bed, Bath, Ruler, Car, Layers, Wind, Droplets, Zap,
  DoorOpen, Grid3X3, MapPin, ArrowRight, X, Flame,
  ShowerHead, CircleDot, Square, TreeDeciduous
} from 'lucide-react'
import { config } from '../config/builder'

interface PlanSpecs {
  planName?: string
  stories?: number
  totalSqFt?: number
  bedrooms?: number
  bathrooms?: number
  halfBaths?: number
  garage?: string
  rooms?: { name: string; floor: number; dimensions: string | null }[]
  windows?: number
  exteriorDoors?: number
  interiorDoors?: number
  fixtures?: { sinks: number; toilets: number; tubs: number; showers: number }
  hvacUnits?: number
  waterHeaters?: number
  foundationType?: string
  roofType?: string
  exteriorMaterials?: string[]
  notes?: string[]
}

interface PlanRecord {
  id: string
  name: string
  pdfFilename: string
  pages: string[]
  pageCount: number
  uploadedAt: string
  specs: PlanSpecs | null
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : ''

export function Plans() {
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [planName, setPlanName] = useState(config.plans[0])
  const [expandedSpecs, setExpandedSpecs] = useState<string | null>(null)

  // Get lots from Dexie to link plans
  const allLots = useLiveQuery(() => db.lots.toArray()) ?? []

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/plans`)
      if (res.ok) setPlans(await res.json())
    } catch (err) {
      console.error('Failed to fetch plans:', err)
    }
  }

  useEffect(() => { fetchPlans() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('pdf', file)
    formData.append('planName', planName)

    try {
      const res = await fetch(`${API_BASE}/api/plans/upload`, { method: 'POST', body: formData })
      if (res.ok) {
        await fetchPlans()
      } else {
        const err = await res.json()
        alert(`Upload failed: ${err.error}`)
      }
    } catch (err) {
      alert('Upload failed — is the server running?')
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleAnalyze = async (plan: PlanRecord) => {
    setAnalyzing(plan.id)
    try {
      const res = await fetch(`${API_BASE}/api/plans/${plan.id}/analyze`, { method: 'POST' })
      if (res.ok) {
        await fetchPlans()
        setExpandedSpecs(plan.id)
      } else {
        const err = await res.json()
        alert(`Analysis failed: ${err.error}`)
      }
    } catch (err) {
      alert('Analysis failed — check server logs')
    }
    setAnalyzing(null)
  }

  const handleDelete = async (plan: PlanRecord) => {
    if (!confirm(`Delete ${plan.name}?`)) return
    await fetch(`${API_BASE}/api/plans/${plan.id}`, { method: 'DELETE' })
    if (selectedPlan?.id === plan.id) setSelectedPlan(null)
    if (expandedSpecs === plan.id) setExpandedSpecs(null)
    await fetchPlans()
  }

  // Get lots that match a plan name
  const getLotsForPlan = (planName: string) => {
    return allLots.filter(lot => lot.plan === planName)
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-g700 flex items-center gap-2">
            <Home size={24} className="text-copper" /> Plan Library
          </h1>
          <p className="text-g400 text-sm mt-0.5">
            {plans.length} plan{plans.length !== 1 ? 's' : ''} uploaded
            {plans.filter(p => p.specs).length > 0 && (
              <span> &middot; {plans.filter(p => p.specs && !('parseError' in p.specs)).length} analyzed</span>
            )}
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-g900 rounded-xl border-2 border-dashed border-g200 p-6 mb-6 hover:border-copper transition-colors">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-copper-bg flex items-center justify-center shrink-0">
            <FileUp size={28} className="text-copper" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-g700 mb-1">Upload Construction Plans</h2>
            <p className="text-xs text-g400">PDF files up to 50MB. Pages are converted to images for viewing and AI analysis.</p>
          </div>
          <div className="flex items-end gap-3 shrink-0">
            <div>
              <label className="block text-xs font-medium text-g500 mb-1">Plan Name</label>
              <select
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                className="px-3 py-2 bg-surface border border-g100 rounded-lg text-sm text-g700 focus:outline-none focus:border-copper"
              >
                {config.plans.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <label className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${uploading ? 'bg-g200 text-g400' : 'bg-copper text-white hover:bg-copper-light hover:shadow-lg hover:shadow-copper/20'}`}>
              {uploading ? <Loader size={16} className="animate-spin" /> : <FileUp size={16} />}
              {uploading ? 'Uploading...' : 'Select PDF'}
              <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Page Viewer Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setSelectedPlan(null)}>
          <div className="bg-g900 rounded-2xl border border-g100 w-full max-w-5xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-g100">
              <h2 className="text-base font-semibold text-g700">
                {selectedPlan.name} — Page {currentPage + 1} of {selectedPlan.pageCount}
              </h2>
              <button onClick={() => setSelectedPlan(null)} className="p-1.5 rounded-lg hover:bg-surface text-g400 hover:text-g700 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg border border-g100 hover:bg-surface disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1 bg-surface rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '500px' }}>
                <img
                  src={`${API_BASE}${selectedPlan.pages[currentPage]}`}
                  alt={`${selectedPlan.name} page ${currentPage + 1}`}
                  className="max-w-full max-h-[65vh] object-contain"
                />
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(selectedPlan.pageCount - 1, p + 1))}
                disabled={currentPage >= selectedPlan.pageCount - 1}
                className="p-2 rounded-lg border border-g100 hover:bg-surface disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
              {selectedPlan.pages.map((page, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${i === currentPage ? 'border-copper shadow-md shadow-copper/20' : 'border-g100 hover:border-g300'}`}
                >
                  <img src={`${API_BASE}${page}`} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map(plan => {
          const lotsUsingPlan = getLotsForPlan(plan.name)
          const isExpanded = expandedSpecs === plan.id
          const hasSpecs = plan.specs && !('parseError' in plan.specs)

          return (
            <div key={plan.id} className="bg-g900 rounded-xl border border-g100 overflow-hidden">
              {/* Plan Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-copper-bg flex items-center justify-center">
                      <Home size={20} className="text-copper" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-g700">{plan.name}</h3>
                      <p className="text-xs text-g400 mt-0.5">
                        {plan.pageCount} pages &middot; Uploaded {new Date(plan.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(plan)} className="text-g300 hover:text-danger transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setSelectedPlan(plan); setCurrentPage(0) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-g600 text-xs font-medium rounded-lg hover:bg-copper-bg hover:text-copper transition-colors"
                  >
                    <Eye size={14} /> View Pages
                  </button>
                  <button
                    onClick={() => handleAnalyze(plan)}
                    disabled={analyzing === plan.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      analyzing === plan.id
                        ? 'bg-g200 text-g400'
                        : hasSpecs
                        ? 'bg-done-bg text-done hover:bg-done-bg/80'
                        : 'bg-copper text-white hover:bg-copper-light hover:shadow-md hover:shadow-copper/20'
                    }`}
                  >
                    {analyzing === plan.id ? <Loader size={14} className="animate-spin" /> : <Brain size={14} />}
                    {analyzing === plan.id ? 'Analyzing...' : hasSpecs ? 'Re-Analyze' : 'Analyze with AI'}
                  </button>
                  {hasSpecs && (
                    <button
                      onClick={() => setExpandedSpecs(isExpanded ? null : plan.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-info-bg text-info text-xs font-medium rounded-lg hover:bg-info-bg/80 transition-colors"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                  )}

                  {/* Lots using this plan */}
                  {lotsUsingPlan.length > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      <MapPin size={12} className="text-g400" />
                      <span className="text-xs text-g400">{lotsUsingPlan.length} lot{lotsUsingPlan.length !== 1 ? 's' : ''}</span>
                      <div className="flex gap-1 ml-1">
                        {lotsUsingPlan.slice(0, 4).map(lot => (
                          <Link
                            key={lot.id}
                            to={`/lots/${lot.id}`}
                            className="text-xs px-2 py-0.5 rounded bg-surface text-g600 hover:bg-copper-bg hover:text-copper transition-colors font-mono"
                            title={lot.address}
                          >
                            {lot.lotBlock}
                          </Link>
                        ))}
                        {lotsUsingPlan.length > 4 && (
                          <span className="text-xs text-g400 px-1">+{lotsUsingPlan.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Stats Bar (always visible when specs exist) */}
                {hasSpecs && !isExpanded && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-g100">
                    {plan.specs!.bedrooms && <QuickStat icon={Bed} value={plan.specs!.bedrooms} label="Bed" color="text-info" />}
                    {plan.specs!.bathrooms && <QuickStat icon={Bath} value={`${plan.specs!.bathrooms}${plan.specs!.halfBaths ? `.${plan.specs!.halfBaths}` : ''}`} label="Bath" color="text-copper" />}
                    {plan.specs!.totalSqFt && <QuickStat icon={Ruler} value={plan.specs!.totalSqFt.toLocaleString()} label="Sq Ft" color="text-done" />}
                    {plan.specs!.stories && <QuickStat icon={Layers} value={plan.specs!.stories} label="Story" color="text-wip" />}
                    {plan.specs!.garage && <QuickStat icon={Car} value={plan.specs!.garage} label="Garage" color="text-g600" />}
                  </div>
                )}
              </div>

              {/* Expanded Specs Panel */}
              {hasSpecs && isExpanded && (
                <SpecsPanel specs={plan.specs!} lots={lotsUsingPlan} />
              )}
            </div>
          )
        })}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-copper-bg flex items-center justify-center mx-auto mb-4">
            <Home size={32} className="text-copper" />
          </div>
          <p className="text-g500 text-sm font-medium">No plans uploaded yet</p>
          <p className="text-g400 text-xs mt-1">Select a plan name above and upload a PDF to get started.</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   QUICK STAT — compact inline stat
   ═══════════════════════════════════════════════ */
function QuickStat({ icon: Icon, value, label, color }: { icon: any; value: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={14} className={color} />
      <span className="text-sm font-semibold text-g700">{value}</span>
      <span className="text-xs text-g400">{label}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SPECS PANEL — the fun, visual analysis display
   ═══════════════════════════════════════════════ */
function SpecsPanel({ specs, lots }: { specs: PlanSpecs; lots: any[] }) {
  return (
    <div className="border-t border-g100 bg-g800">
      {/* Hero Stats */}
      <div className="grid grid-cols-5 divide-x divide-g100">
        <HeroStat icon={Bed} value={specs.bedrooms ?? '—'} label="Bedrooms" bg="bg-info-bg" iconColor="text-info" />
        <HeroStat icon={Bath} value={specs.bathrooms ? `${specs.bathrooms}${specs.halfBaths ? ` + ${specs.halfBaths} half` : ''}` : '—'} label="Bathrooms" bg="bg-copper-bg" iconColor="text-copper" />
        <HeroStat icon={Ruler} value={specs.totalSqFt ? specs.totalSqFt.toLocaleString() : '—'} label="Square Feet" bg="bg-done-bg" iconColor="text-done" />
        <HeroStat icon={Layers} value={specs.stories ?? '—'} label={specs.stories === 1 ? 'Story' : 'Stories'} bg="bg-wip-bg" iconColor="text-wip" />
        <HeroStat icon={Car} value={specs.garage ?? '—'} label="Garage" bg="bg-surface" iconColor="text-g600" />
      </div>

      <div className="p-5 space-y-5">
        {/* Rooms */}
        {specs.rooms && specs.rooms.length > 0 && (
          <SpecSection title="Room Breakdown" subtitle={`${specs.rooms.length} rooms total`} icon={DoorOpen} iconColor="text-info">
            <div className="grid grid-cols-3 gap-2">
              {specs.rooms.map((room, i) => (
                <div key={i} className="bg-g900 rounded-lg p-3 border border-g100 hover:border-info/30 transition-colors group">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-g700 group-hover:text-info transition-colors">{room.name}</span>
                    {room.floor && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface text-g400">F{room.floor}</span>
                    )}
                  </div>
                  {room.dimensions && (
                    <span className="text-xs text-g400 mt-1 block font-mono">{room.dimensions}</span>
                  )}
                </div>
              ))}
            </div>
          </SpecSection>
        )}

        {/* Doors & Windows */}
        {(specs.windows || specs.exteriorDoors || specs.interiorDoors) && (
          <SpecSection title="Doors & Windows" icon={Grid3X3} iconColor="text-wip">
            <div className="grid grid-cols-3 gap-3">
              {specs.windows != null && (
                <CountCard icon={Grid3X3} value={specs.windows} label="Windows" color="wip" />
              )}
              {specs.exteriorDoors != null && (
                <CountCard icon={DoorOpen} value={specs.exteriorDoors} label="Exterior Doors" color="copper" />
              )}
              {specs.interiorDoors != null && (
                <CountCard icon={DoorOpen} value={specs.interiorDoors} label="Interior Doors" color="info" />
              )}
            </div>
          </SpecSection>
        )}

        {/* Plumbing Fixtures */}
        {specs.fixtures && (
          <SpecSection title="Plumbing Fixtures" icon={Droplets} iconColor="text-info">
            <div className="grid grid-cols-4 gap-3">
              <CountCard icon={CircleDot} value={specs.fixtures.sinks} label="Sinks" color="info" />
              <CountCard icon={Square} value={specs.fixtures.toilets} label="Toilets" color="copper" />
              <CountCard icon={Bath} value={specs.fixtures.tubs} label="Tubs" color="wip" />
              <CountCard icon={ShowerHead} value={specs.fixtures.showers} label="Showers" color="done" />
            </div>
          </SpecSection>
        )}

        {/* Systems & Structure */}
        {(specs.hvacUnits || specs.waterHeaters || specs.foundationType || specs.roofType) && (
          <SpecSection title="Systems & Structure" icon={Zap} iconColor="text-wip">
            <div className="grid grid-cols-2 gap-3">
              {specs.hvacUnits != null && (
                <SystemCard icon={Wind} label="HVAC Units" value={String(specs.hvacUnits)} accent="wip" />
              )}
              {specs.waterHeaters != null && (
                <SystemCard icon={Flame} label="Water Heaters" value={String(specs.waterHeaters)} accent="danger" />
              )}
              {specs.foundationType && (
                <SystemCard icon={Layers} label="Foundation" value={specs.foundationType} accent="done" />
              )}
              {specs.roofType && (
                <SystemCard icon={Home} label="Roof" value={specs.roofType} accent="copper" />
              )}
            </div>
          </SpecSection>
        )}

        {/* Exterior */}
        {specs.exteriorMaterials && specs.exteriorMaterials.length > 0 && (
          <SpecSection title="Exterior Materials" icon={TreeDeciduous} iconColor="text-done">
            <div className="flex flex-wrap gap-2">
              {specs.exteriorMaterials.map((mat, i) => (
                <span key={i} className="px-3 py-1.5 bg-g900 border border-g100 rounded-lg text-sm text-g600 font-medium hover:border-done/30 hover:text-done transition-colors">
                  {mat}
                </span>
              ))}
            </div>
          </SpecSection>
        )}

        {/* Notes — collapsible */}
        {specs.notes && specs.notes.length > 0 && (
          <CollapsibleSection title="AI Notes" count={specs.notes.length} icon={Brain} iconColor="text-copper">
            <div className="space-y-2">
              {specs.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2 bg-g900 rounded-lg p-3 border border-g100">
                  <span className="w-5 h-5 rounded-full bg-copper-bg text-copper text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-g600 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Linked Lots */}
        {lots.length > 0 && (
          <SpecSection title="Lots Using This Plan" subtitle={`${lots.length} active lot${lots.length !== 1 ? 's' : ''}`} icon={MapPin} iconColor="text-copper">
            <div className="grid grid-cols-2 gap-2">
              {lots.map(lot => (
                <Link
                  key={lot.id}
                  to={`/lots/${lot.id}`}
                  className="flex items-center justify-between bg-g900 rounded-lg p-3 border border-g100 hover:border-copper/30 group transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-g400">Lot {lot.lotBlock}</span>
                      <StagePill stage={lot.scarStage} />
                    </div>
                    <p className="text-sm font-medium text-g700 mt-0.5 group-hover:text-copper transition-colors">{lot.address}</p>
                  </div>
                  <ArrowRight size={14} className="text-g300 group-hover:text-copper transition-colors" />
                </Link>
              ))}
            </div>
          </SpecSection>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENT BUILDING BLOCKS
   ═══════════════════════════════════════════════ */

function HeroStat({ icon: Icon, value, label, bg, iconColor }: {
  icon: any; value: any; label: string; bg: string; iconColor: string
}) {
  return (
    <div className={`${bg} p-4 flex flex-col items-center text-center`}>
      <Icon size={22} className={`${iconColor} mb-2`} />
      <span className="text-xl font-bold text-g700 leading-none">{value}</span>
      <span className="text-[11px] text-g400 mt-1 font-medium uppercase tracking-wider">{label}</span>
    </div>
  )
}

function SpecSection({ title, subtitle, icon: Icon, iconColor, children }: {
  title: string; subtitle?: string; icon: any; iconColor: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-g900 flex items-center justify-center">
          <Icon size={14} className={iconColor} />
        </div>
        <h3 className="text-sm font-semibold text-g700">{title}</h3>
        {subtitle && <span className="text-xs text-g400">{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

function CountCard({ icon: Icon, value, label, color }: {
  icon: any; value: number; label: string; color: string
}) {
  const bgMap: Record<string, string> = {
    info: 'bg-info-bg', copper: 'bg-copper-bg', wip: 'bg-wip-bg', done: 'bg-done-bg', danger: 'bg-danger-bg',
  }
  const textMap: Record<string, string> = {
    info: 'text-info', copper: 'text-copper', wip: 'text-wip', done: 'text-done', danger: 'text-danger',
  }
  return (
    <div className="bg-g900 rounded-xl border border-g100 p-4 text-center hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${bgMap[color]} flex items-center justify-center mx-auto mb-2`}>
        <Icon size={20} className={textMap[color]} />
      </div>
      <div className="text-2xl font-bold text-g700">{value}</div>
      <div className="text-[11px] text-g400 font-medium uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  )
}

function SystemCard({ icon: Icon, label, value, accent }: {
  icon: any; label: string; value: string; accent: string
}) {
  const textMap: Record<string, string> = {
    info: 'text-info', copper: 'text-copper', wip: 'text-wip', done: 'text-done', danger: 'text-danger',
  }
  const bgMap: Record<string, string> = {
    info: 'bg-info-bg', copper: 'bg-copper-bg', wip: 'bg-wip-bg', done: 'bg-done-bg', danger: 'bg-danger-bg',
  }
  return (
    <div className="bg-g900 rounded-xl border border-g100 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${bgMap[accent]} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={textMap[accent]} />
      </div>
      <div>
        <div className="text-xs text-g400 font-medium">{label}</div>
        <div className="text-sm font-semibold text-g700 mt-0.5">{value}</div>
      </div>
    </div>
  )
}

function CollapsibleSection({ title, count, icon: Icon, iconColor, children }: {
  title: string; count: number; icon: any; iconColor: string; children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <div className="w-6 h-6 rounded-md bg-g900 flex items-center justify-center">
          <Icon size={14} className={iconColor} />
        </div>
        <h3 className="text-sm font-semibold text-g700">{title}</h3>
        <span className="text-xs text-g400">{count} note{count !== 1 ? 's' : ''}</span>
        <ChevronDown size={14} className={`text-g400 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

function StagePill({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    Start: 'bg-info-bg text-info',
    Frame: 'bg-wip-bg text-wip',
    Second: 'bg-copper-bg text-copper',
    Final: 'bg-done-bg text-done',
  }
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[stage] ?? 'bg-surface text-g400'}`}>{stage}</span>
}
