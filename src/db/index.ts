import Dexie, { type EntityTable } from 'dexie'

export interface Lot {
  id?: number
  lotBlock: string        // e.g. "12024"
  address: string         // e.g. "501 Madelines Meadow Ln"
  plan: string            // e.g. "Hewitt 80080"
  planFull: string        // e.g. "80080 Hewitt : Hewitt 80080"
  elevation: string       // e.g. "Elevation 27"
  scarStage: string       // Start, Frame, Second, Final
  productType: string     // "1 Story" or "2 Story"
  fieldContact: string    // CM assigned — "Beltran, Paige" or "Stranko, Luciano"
  buyer?: string          // e.g. "Katalina Ramirez"
  vfdDate: string         // Verified Finish Date
  estFinish: string       // Estimated finish
  currentTask: string     // Current active task from PCP
  taskDays: number        // Days ahead/behind on current task
  updatedAt: string       // Last PCP update
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
  dailyNotes: EntityTable<DailyNote, 'id'>
}

db.version(3).stores({
  lots: '++id, lotBlock, address, scarStage, vfdDate, fieldContact',
  schedule: '++id, lotId, scheduledDate, status',
  trades: '++id, name, specialty',
  emails: '++id, lotId, trade, date, flagged',
  dailyNotes: '++id, date',
})

export { db }
