import { useState } from 'react'
import { db } from '../db'
import { config } from '../config/builder'
import { X } from 'lucide-react'

export function AddLotModal({ onClose }: { onClose: () => void }) {
  const [lotBlock, setLotBlock] = useState('')
  const [address, setAddress] = useState('')
  const [plan, setPlan] = useState(config.plans[0])
  const [elevation, setElevation] = useState('')
  const [scarStage, setScarStage] = useState(config.scarStages[0])
  const [productType, setProductType] = useState('1 Story')
  const [buyer, setBuyer] = useState('')
  const [vfdDate, setVfdDate] = useState('')
  const [currentTask, setCurrentTask] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim() || !lotBlock.trim()) return

    await db.lots.add({
      lotBlock: lotBlock.trim(),
      address: address.trim(),
      plan,
      planFull: plan,
      elevation: elevation.trim() || 'TBD',
      scarStage,
      productType,
      fieldContact: 'Beltran, Paige',
      buyer: buyer.trim() || undefined,
      vfdDate: vfdDate || 'TBD',
      estFinish: vfdDate || 'TBD',
      currentTask: currentTask.trim() || 'Pending',
      taskDays: 0,
      updatedAt: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-g900 rounded-2xl border border-g100 w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-g700">Add New Lot</h2>
          <button onClick={onClose} className="text-g300 hover:text-g600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lot/Block" value={lotBlock} onChange={setLotBlock} placeholder="01010" required />
            <Field label="Address" value={address} onChange={setAddress} placeholder="500 Madelines Meadow Ln" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-g500 mb-1">Plan</label>
              <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3 py-2 bg-surface border border-g100 rounded-lg text-sm text-g700 focus:outline-none focus:border-copper">
                {config.plans.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Field label="Elevation" value={elevation} onChange={setElevation} placeholder="Elevation R" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-g500 mb-1">SCAR Stage</label>
              <select value={scarStage} onChange={e => setScarStage(e.target.value)} className="w-full px-3 py-2 bg-surface border border-g100 rounded-lg text-sm text-g700 focus:outline-none focus:border-copper">
                {config.scarStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-g500 mb-1">Product Type</label>
              <select value={productType} onChange={e => setProductType(e.target.value)} className="w-full px-3 py-2 bg-surface border border-g100 rounded-lg text-sm text-g700 focus:outline-none focus:border-copper">
                <option value="1 Story">1 Story</option>
                <option value="2 Story">2 Story</option>
              </select>
            </div>
          </div>
          <Field label="Buyer" value={buyer} onChange={setBuyer} placeholder="Smith Family (optional)" />
          <div>
            <label className="block text-xs font-medium text-g500 mb-1">VFD Date</label>
            <input type="date" value={vfdDate} onChange={e => setVfdDate(e.target.value)} className="w-full px-3 py-2 bg-surface border border-g100 rounded-lg text-sm text-g700 focus:outline-none focus:border-copper" />
          </div>
          <Field label="Current Task" value={currentTask} onChange={setCurrentTask} placeholder="Foundation- Install Cables Complete" />
          <Field label="Notes" value={notes} onChange={setNotes} placeholder="Any notes..." />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-surface text-g600 text-sm font-medium rounded-lg hover:bg-surface-2 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-copper text-white text-sm font-medium rounded-lg hover:bg-copper-light transition-colors">Add Lot</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-g500 mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full px-3 py-2 bg-surface border border-g100 rounded-lg text-sm text-g700 placeholder:text-g300 focus:outline-none focus:border-copper" />
    </div>
  )
}
