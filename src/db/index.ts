import Dexie, { type EntityTable } from 'dexie'

export interface Lot {
  id?: number
  lotBlock: string
  address: string
  plan: string
  planFull: string
  elevation: string
  scarStage: string
  productType: string
  fieldContact: string
  buyer?: string
  vfdDate: string
  estFinish: string
  currentTask: string
  taskDays: number
  updatedAt: string
  notes?: string
  createdAt: number
}

export interface ScheduleItem {
  id?: number
  lotId: number
  trade: string
  task: string
  scheduledDate: string
  status: 'scheduled' | 'in_progress' | 'complete' | 'delayed'
  notes?: string
  createdAt: number
}

export interface Trade {
  id?: number
  name: string
  company: string
  contact: string
  phone: string
  email: string
  specialty: string
}

export interface EmailRef {
  id?: number
  lotId?: number
  trade?: string
  subject: string
  from: string
  date: string
  snippet: string
  outlookId?: string
  flagged: boolean
}

export interface Recordable {
  id?: number
  lotBlock: string
  address: string
  community: string
  tradePartner: string       // e.g. "CASTELAN GROUP LLC"
  tradePartnerId: string     // e.g. "241CAS125"
  description: string        // CM notes
  linkedTask: string         // PCP task it's tied to
  category: string           // "Failed Municipal Inspection", "PCS Error", "Safety"
  status: string             // "Open", "Closed"
  priority: string           // "Medium", "High", "Low"
  owner: string              // CM name
  dateCreated: string
  dateConfirmed: string
  dateDue: string
}

export interface DailyNote {
  id?: number
  date: string
  content: string
  createdAt: number
}

const db = new Dexie('CommandCenter') as Dexie & {
  lots: EntityTable<Lot, 'id'>
  schedule: EntityTable<ScheduleItem, 'id'>
  trades: EntityTable<Trade, 'id'>
  emails: EntityTable<EmailRef, 'id'>
  recordables: EntityTable<Recordable, 'id'>
  dailyNotes: EntityTable<DailyNote, 'id'>
}

db.version(4).stores({
  lots: '++id, lotBlock, address, scarStage, vfdDate, fieldContact',
  schedule: '++id, lotId, scheduledDate, status',
  trades: '++id, name, specialty',
  emails: '++id, lotId, trade, date, flagged',
  recordables: '++id, lotBlock, tradePartner, category, status, owner',
  dailyNotes: '++id, date',
})

export { db }
