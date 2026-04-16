import { useState, useEffect } from 'react'
import { FileUp, Loader, Eye, Brain, Trash2, ChevronLeft, ChevronRight, Home } from 'lucide-react'
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
    await fetchPlans()
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-g700 flex items-center gap-2">
            <Home size={24} className="text-copper" /> Plan Library
          </h1>
          <p className="text-g400 text-sm mt-0.5">{plans.length} plans uploaded</p>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-g900 rounded-xl border border-g100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-g700 mb-3">Upload Construction Plans</h2>
        <div className="flex items-end gap-3">
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
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${uploading ? 'bg-g200 text-g400' : 'bg-copper text-white hover:bg-copper-light'}`}>
            {uploading ? <Loader size={16} className="animate-spin" /> : <FileUp size={16} />}
            {uploading ? 'Uploading...' : 'Select PDF'}
            <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      {/* Plan viewer */}
      {selectedPlan && (
        <div className="bg-g900 rounded-xl border border-g100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-g700">{selectedPlan.name} — Page {currentPage + 1} of {selectedPlan.pageCount}</h2>
            <button onClick={() => setSelectedPlan(null)} className="text-xs text-g400 hover:text-copper">Close viewer</button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg border border-g100 hover:bg-surface disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 bg-surface rounded-lg overflow-hidden flex items-center justify-center min-h-96">
              <img
                src={`${API_BASE}${selectedPlan.pages[currentPage]}`}
                alt={`${selectedPlan.name} page ${currentPage + 1}`}
                className="max-w-full max-h-[600px] object-contain"
              />
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(selectedPlan.pageCount - 1, p + 1))}
              disabled={currentPage >= selectedPlan.pageCount - 1}
              className="p-2 rounded-lg border border-g100 hover:bg-surface disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          {/* Page thumbnails */}
          <div className="flex gap-2 mt-3 overflow-x-auto py-1">
            {selectedPlan.pages.map((page, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${i === currentPage ? 'border-copper' : 'border-g100'}`}
              >
                <img src={`${API_BASE}${page}`} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-2 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className="bg-g900 rounded-xl border border-g100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-g700">{plan.name}</h3>
                <p className="text-xs text-g400 mt-0.5">{plan.pageCount} pages &middot; Uploaded {new Date(plan.uploadedAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(plan)} className="text-g300 hover:text-danger transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setSelectedPlan(plan); setCurrentPage(0) }}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface text-g600 text-xs font-medium rounded-lg hover:bg-copper-bg hover:text-copper transition-colors"
              >
                <Eye size={14} /> View Pages
              </button>
              <button
                onClick={() => handleAnalyze(plan)}
                disabled={analyzing === plan.id}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  analyzing === plan.id
                    ? 'bg-g200 text-g400'
                    : plan.specs
                    ? 'bg-done-bg text-done hover:bg-done-bg'
                    : 'bg-copper text-white hover:bg-copper-light'
                }`}
              >
                {analyzing === plan.id ? <Loader size={14} className="animate-spin" /> : <Brain size={14} />}
                {analyzing === plan.id ? 'Analyzing...' : plan.specs ? 'Re-Analyze' : 'Analyze with AI'}
              </button>
            </div>

            {/* Specs */}
            {plan.specs && !('parseError' in plan.specs) && (
              <div className="bg-surface rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {plan.specs.stories && <Spec label="Stories" value={plan.specs.stories} />}
                  {plan.specs.totalSqFt && <Spec label="Sq Ft" value={plan.specs.totalSqFt.toLocaleString()} />}
                  {plan.specs.bedrooms && <Spec label="Beds" value={plan.specs.bedrooms} />}
                  {plan.specs.bathrooms && <Spec label="Baths" value={plan.specs.bathrooms} />}
                  {plan.specs.garage && <Spec label="Garage" value={plan.specs.garage} />}
                  {plan.specs.windows && <Spec label="Windows" value={plan.specs.windows} />}
                  {plan.specs.exteriorDoors && <Spec label="Ext Doors" value={plan.specs.exteriorDoors} />}
                  {plan.specs.hvacUnits && <Spec label="HVAC" value={plan.specs.hvacUnits} />}
                  {plan.specs.foundationType && <Spec label="Foundation" value={plan.specs.foundationType} />}
                </div>
                {plan.specs.rooms && plan.specs.rooms.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-g100">
                    <div className="text-xs font-medium text-g500 mb-1">Rooms ({plan.specs.rooms.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {plan.specs.rooms.map((room, i) => (
                        <span key={i} className="text-xs bg-g900 border border-g100 px-2 py-0.5 rounded text-g600">
                          {room.name} {room.dimensions ? `(${room.dimensions})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 text-g400 text-sm">
          No plans uploaded yet. Select a plan name and upload a PDF to get started.
        </div>
      )}
    </div>
  )
}

function Spec({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-g400">{label}</div>
      <div className="text-g700 font-medium">{value}</div>
    </div>
  )
}
