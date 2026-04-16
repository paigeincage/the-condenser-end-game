import { db } from '.'

export async function seedDatabase() {
  const count = await db.lots.count()
  if (count > 0) {
    const first = await db.lots.toCollection().first()
    const recCount = await db.recordables.count()
    if (first && 'fieldContact' in first && count >= 28 && recCount > 0) return // already seeded with full data
    await Promise.all([
      db.lots.clear(),
      db.schedule.clear(),
      db.recordables.clear(),
      db.trades.clear(),
      db.emails.clear(),
    ])
  }

  const now = Date.now()

  // ═══════════════════════════════════════════════════════════
  // FULL DATA — Patterson Ranch (8531) — All CMs
  // Pulled from PCP Portal 2026-04-16
  // 28 lots: 13 Beltran + 15 Stranko
  // ═══════════════════════════════════════════════════════════

  const L = (lotBlock: string, address: string, plan: string, planFull: string, elevation: string, scarStage: string, productType: string, fieldContact: string, vfdDate: string, estFinish: string, currentTask: string, taskDays: number, updatedAt: string, buyer?: string) => ({
    lotBlock, address, plan, planFull, elevation, scarStage, productType, fieldContact, buyer, vfdDate, estFinish, currentTask, taskDays, updatedAt, createdAt: now,
  })

  await db.lots.bulkAdd([
    // ── FINAL STAGE ──────────────────────────────────────────
    L('12024', '501 Madelines Meadow Ln', 'Hewitt 80080', '80080 Hewitt : Hewitt 80080', 'Elevation 27', 'Final', '1 Story', 'Beltran, Paige', '2025-05-16', '2025-08-21', 'CM- Build Quality Celebration', -84, '2026-04-07', 'Katalina Ramirez'),
    L('13007', '120 Daniels Dusty Trl', 'Mesilla 80120', '80120 Mesilla : Mesilla (80120)', 'Elevation R', 'Final', '2 Story', 'Beltran, Paige', '2025-09-25', '2025-11-21', 'CM- Build Quality Celebration', -62, '2026-02-14'),
    L('17010', '536 Madelines Meadow Ln', 'Sandalwood 80090', '80090 Sandalwood : Sandalwood (80090)', 'Elevation Z', 'Final', '2 Story', 'Beltran, Paige', '2026-03-04', '2026-02-18', 'CM- Build Quality Pre-Closing Orientation', -1, '2026-02-25'),
    L('12014', '541 Madelines Meadow Ln', 'Enloe 82240', '82240 Enloe : Enloe (88240)', 'Elevation MD201', 'Final', '2 Story', 'Stranko, Luciano', '2026-02-27', '2026-02-23', 'CM- Build Quality Home Complete Confirmation Day 4', -7, '2026-02-26'),
    L('13010', '208 Daniels Dusty Trl', 'Mesilla 80120', '80120 Mesilla : Mesilla (80120)', 'Elevation HC203', 'Final', '2 Story', 'Stranko, Luciano', '2025-12-24', '2026-02-23', 'CM- Build Quality Pre-Closing Orientation', -42, '2026-02-24'),
    L('13012', '216 Daniels Dusty Trl', 'Enloe 82240', '82240 Enloe : Enloe (88240)', 'Elevation HC201', 'Final', '2 Story', 'Stranko, Luciano', '2025-12-29', '2026-02-23', 'CM- Build Quality Celebration', -36, '2026-03-30', 'Ronny Son'),
    L('13013', '220 Daniels Dusty Trl', 'Mesilla 80120', '80120 Mesilla : Mesilla (80120)', 'Elevation Y', 'Final', '2 Story', 'Stranko, Luciano', '2026-02-17', '2026-02-23', 'CM- Build Quality Pre-Closing Orientation', -15, '2026-02-24'),
    L('17008', '528 Madelines Meadow Ln', 'Enloe 82240', '82240 Enloe : Enloe (88240)', 'Elevation HC201', 'Final', '2 Story', 'Stranko, Luciano', '2026-03-09', '2026-02-25', 'Paint- Paint Touch Up #2', -4, '2026-04-14', 'Sunny Perez'),
    L('01004', '509 Maries Garden', 'Enloe 82240', '82240 Enloe : Enloe (88240)', 'Elevation HC201', 'Final', '2 Story', 'Stranko, Luciano', '2026-03-12', '2026-02-26', 'CM- Build Quality Home Complete Confirmation Day 1', -1, '2026-02-26', 'Arturo Lopez'),
    L('17009', '532 Madelines Meadow Ln', 'Dinero 82230', '82230 Dinero : Dinero (82230)', 'Elevation HC201', 'Final', '2 Story', 'Beltran, Paige', '2026-03-16', '2026-03-24', 'CM- Build Quality Pre-Closing Orientation', -17, '2026-03-25'),
    L('12017', '529 Madelines Meadow Ln', 'Sandalwood 80090', '80090 Sandalwood : Sandalwood (80090)', 'Elevation R', 'Final', '2 Story', 'Beltran, Paige', '2026-03-09', '2026-03-30', 'CM- Build Quality Pre-Closing Orientation', -26, '2026-03-31'),
    L('13016', '308 Daniels Dusty Trl', 'Mesilla 80120', '80120 Mesilla : Mesilla (80120)', 'Elevation R', 'Final', '2 Story', 'Stranko, Luciano', '2026-03-27', '2026-03-30', 'Paint- Paint Touch Up #1', -12, '2026-03-31'),

    // ── SECOND STAGE ─────────────────────────────────────────
    L('13015', '304 Daniels Dusty Trl', 'Enloe 82240', '82240 Enloe : Enloe (88240)', 'Elevation LS202', 'Second', '2 Story', 'Stranko, Luciano', '2026-03-31', '2026-03-20', 'SCAR Final', -4, '2026-04-08'),
    L('13014', '300 Daniels Dusty Trl', 'Sandalwood 80090', '80090 Sandalwood : Sandalwood (80090)', 'Elevation R', 'Second', '2 Story', 'Beltran, Paige', '2026-04-02', '2026-03-23', 'SCAR Final', -3, '2026-03-30'),
    L('02012', '545 Henry Milton Rd', 'Enloe 82240', '82240 Enloe : Enloe (88240)', 'Elevation MD201', 'Second', '2 Story', 'Stranko, Luciano', '2026-04-24', '2026-04-09', 'SCAR Final', 4, '2026-04-14'),
    L('02013', '549 Henry Milton Rd', 'Sandalwood 80090', '80090 Sandalwood : Sandalwood (80090)', 'Elevation R', 'Second', '2 Story', 'Beltran, Paige', '2026-05-01', '2026-04-17', 'GUTTERS- INSTALL GUTTERS COMPLETE', -1, '2026-04-15'),
    L('13017', '312 Daniels Dusty Trl', 'Sandalwood 80090', '80090 Sandalwood : Sandalwood (80090)', 'Elevation Z', 'Second', '2 Story', 'Beltran, Paige', '2026-05-14', '2026-04-29', 'Electrical- Hot Check', 0, '2026-04-15'),
    L('13018', '316 Daniels Dusty Trl', 'Enloe 82240', '82240 Enloe : Enloe (88240)', 'Elevation HC201', 'Second', '2 Story', 'Stranko, Luciano', '2026-05-18', '2026-05-01', 'FINAL ROOF PUNCH AND BLOCKING REMOVAL- Will Call-N', 0, '2026-04-15'),
    L('03002', '605 Henry Milton Rd', 'Becket 80060', '80060 Becket : Becket 80060', 'Elevation R', 'Second', '1 Story', 'Beltran, Paige', '2026-06-01', '2026-05-14', 'Flooring- Install Tile Flooring Day 1', 0, '2026-04-15'),
    L('12010', '536 Henry Milton Rd', 'Mesilla 80120', '80120 Mesilla : Mesilla (80120)', 'Elevation Y', 'Second', '2 Story', 'Stranko, Luciano', '2026-06-03', '2026-05-18', 'FOUNDATION- FLATWORK 100% COMPLETE', 0, '2026-04-15'),
    L('12011', '540 Henry Milton Rd', 'Dinero 82230', '82230 Dinero : Dinero (82230)', 'Elevation MD201', 'Second', '2 Story', 'Beltran, Paige', '2026-06-19', '2026-06-05', 'Garage Door- Garage Door Install Complete', -1, '2026-04-15'),
    L('12006', '520 Henry Milton Rd', 'Mesilla 80120', '80120 Mesilla : Mesilla (80120)', 'Elevation R', 'Second', '2 Story', 'Stranko, Luciano', '2026-06-23', '2026-06-09', 'PRE-MASONRY MOIST STOP FLASHING N', -1, '2026-04-15'),

    // ── FRAME STAGE ──────────────────────────────────────────
    L('12007', '524 Henry Milton Rd', 'Sandalwood 80090', '80090 Sandalwood : Sandalwood (80090)', 'Elevation R', 'Frame', '2 Story', 'Stranko, Luciano', '2026-06-25', '2026-06-11', 'Doors- Deliver Exterior Doors', 2, '2026-04-15'),
    L('01009', '401 Mildred Prairie', 'Sandalwood 80090', '80090 Sandalwood : Sandalwood (80090)', 'Elevation O', 'Frame', '2 Story', 'Beltran, Paige', '2026-06-25', '2026-06-12', 'LUMBER- DELIVER SIDING PACKAGE - WILL CALL BY CM', -1, '2026-04-15', 'Leighton Bayola'),
    L('02001', '501 Henry Milton Rd', 'Hewitt 80080', '80080 Hewitt : Hewitt 80080', 'Frame', '1 Story', 'Frame', 'Stranko, Luciano', '2026-07-13', '2026-06-25', 'Engineering- Cables Inspect & Stress', 0, '2026-04-15', 'Elizabeth Frazier'),
    L('01007', '409 Mildred Prairie', 'Hewitt 80080', '80080 Hewitt : Hewitt 80080', 'Elevation 27', 'Frame', '1 Story', 'Beltran, Paige', '2026-07-01', '2026-07-01', 'Exterior Clean- Deliver Trash Box', 0, '2026-04-15'),

    // ── START STAGE ──────────────────────────────────────────
    L('01001', '609 Maries Garden', 'Mesilla 80120', '80120 Mesilla : Mesilla (80120)', 'Elevation R', 'Start', '2 Story', 'Stranko, Luciano', '', '2026-07-10', 'Exterior Clean- Deliver Trash Box', 12, '2026-04-13', 'Taiwo Abegunde'),
    L('02009', '533 Henry Milton Rd', 'Hewitt 80080', '80080 Hewitt : Hewitt 80080', 'Elevation R', 'Start', '1 Story', 'Beltran, Paige', '2026-08-10', '2026-07-27', 'Foundation- Install Cables Complete', -1, '2026-04-15'),
  ])

  // Sample trade contacts (Austin area)
  await db.trades.bulkAdd([
    { name: 'Torres Framing', company: 'Torres Framing LLC', contact: 'Mike Torres', phone: '(512) 555-0142', email: 'mike@torresframing.com', specialty: 'Framing' },
    { name: 'ABC Plumbing', company: 'ABC Plumbing Co', contact: 'Ray Chen', phone: '(512) 555-0198', email: 'ray@abcplumbing.com', specialty: 'Plumbing' },
    { name: 'Sparks Electric', company: 'Sparks Electrical', contact: 'Dana Sparks', phone: '(512) 555-0234', email: 'dana@sparkselectric.com', specialty: 'Electrical' },
    { name: 'Cool Air HVAC', company: 'Cool Air Systems', contact: 'James Wright', phone: '(512) 555-0311', email: 'james@coolair.com', specialty: 'HVAC' },
    { name: 'Pro Drywall', company: 'Pro Drywall & Texture', contact: 'Carlos Mendez', phone: '(512) 555-0455', email: 'carlos@prodrywall.com', specialty: 'Drywall' },
    { name: 'Lone Star Paint', company: 'Lone Star Painting', contact: 'Sarah Kim', phone: '(512) 555-0567', email: 'sarah@lonestarpaint.com', specialty: 'Paint' },
    { name: 'Hill Country Cabinets', company: 'Hill Country Cabinetry', contact: 'Tom Hill', phone: '(512) 555-0689', email: 'tom@hccabinets.com', specialty: 'Cabinets' },
    { name: 'Texas Stone Counters', company: 'Texas Stone & Surface', contact: 'Lisa Nguyen', phone: '(512) 555-0723', email: 'lisa@texasstone.com', specialty: 'Countertops' },
  ])

  // Sample emails tied to real lots
  await db.emails.bulkAdd([
    { lotId: 17, trade: 'Electrical', subject: 'Hot check scheduled - 312 Daniels Dusty Trl', from: 'dana@sparkselectric.com', date: '2026-04-15', snippet: 'Hey Paige, hot check is on for today at 312 Daniels Dusty. Inspector confirmed for 2pm.', flagged: true },
    { lotId: 16, trade: 'Gutters', subject: 'RE: Gutters complete - 549 Henry Milton', from: 'gutters@hillcountry.com', date: '2026-04-15', snippet: 'Crew finished gutters at 549 Henry Milton. Ready for your walkthrough whenever you get a chance.', flagged: true },
    { lotId: 24, subject: 'Siding package delivery - 401 Mildred Prairie', from: 'lumber@84lumber.com', date: '2026-04-15', snippet: 'Will call order ready for pickup. Need CM authorization to schedule delivery to lot 01009.', flagged: true },
    { subject: 'Weekly Schedule Update - Patterson Ranch', from: 'scheduling@pulte.com', date: '2026-04-14', snippet: 'Attached is the updated weekly schedule for Patterson Ranch. 3 lots flagged for potential delay.', flagged: false },
    { lotId: 28, trade: 'Foundation', subject: 'Cable install update - 533 Henry Milton', from: 'foundation@txconcrete.com', date: '2026-04-14', snippet: 'Post-tension cables installed. Ready for inspection. Slight delay due to weather yesterday.', flagged: false },
  ])

  // ═══════════════════════════════════════════════════════════
  // MODULE 2 — RECORDABLES (from PCP 2026-04-16)
  // ═══════════════════════════════════════════════════════════

  await db.recordables.bulkAdd([
    {
      lotBlock: '12011', address: '540 Henry Milton Rd', community: 'Patterson Ranch (8531)',
      tradePartner: 'CASTELAN GROUP LLC', tradePartnerId: '241CAS125',
      description: 'Push drywall hang to start on 4/6',
      linkedTask: 'Drywall- Hang S/R Day 1',
      category: 'Failed Municipal Inspection', status: 'Open', priority: 'Medium',
      owner: 'Paige Beltran',
      dateCreated: '2026-04-03', dateConfirmed: '2026-04-03', dateDue: '2026-04-10',
    },
    {
      lotBlock: '12011', address: '540 Henry Milton Rd', community: 'Patterson Ranch (8531)',
      tradePartner: 'CWI HOLDINGS LLC', tradePartnerId: '241CWI100',
      description: 'Push drywall to hang day 1 to start on 4/8 and spin schedule',
      linkedTask: 'Drywall- Hang S/R Day 1',
      category: 'Failed Municipal Inspection', status: 'Open', priority: 'Medium',
      owner: 'Paige Beltran',
      dateCreated: '2026-04-06', dateConfirmed: '2026-04-07', dateDue: '2026-04-10',
    },
    {
      lotBlock: '12011', address: '540 Henry Milton Rd', community: 'Patterson Ranch (8531)',
      tradePartner: 'CASTELAN GROUP LLC', tradePartnerId: '241CAS125',
      description: 'CM needs to verify hang for PCS',
      linkedTask: 'Drywall- Hang S/R 100% Complete/Pink Dot',
      category: 'PCS Error', status: 'Open', priority: 'Medium',
      owner: 'Paige Beltran',
      dateCreated: '2026-04-13', dateConfirmed: '2026-04-13', dateDue: '2026-04-14',
    },
    {
      lotBlock: '12011', address: '540 Henry Milton Rd', community: 'Patterson Ranch (8531)',
      tradePartner: 'ECO GARAGE DOOR SERVICES LLC', tradePartnerId: '241ECO105',
      description: 'Holding task - need to clear the path for install',
      linkedTask: 'Garage Door- Garage Door Install Complete',
      category: 'Safety', status: 'Open', priority: 'Medium',
      owner: 'Paige Beltran',
      dateCreated: '2026-04-15', dateConfirmed: '2026-04-15', dateDue: '',
    },
    {
      lotBlock: '12011', address: '540 Henry Milton Rd', community: 'Patterson Ranch (8531)',
      tradePartner: 'UNITED FINISHES LLC', tradePartnerId: '241FLO107',
      description: 'Will click off when corrections are complete',
      linkedTask: 'Surround- Waterproof Shower Surround',
      category: 'PCS Error', status: 'Open', priority: 'Medium',
      owner: 'Paige Beltran',
      dateCreated: '2026-04-15', dateConfirmed: '2026-04-15', dateDue: '',
    },
  ])

  console.log('[CommandCenter] Database seeded with full Patterson Ranch data — 28 lots + 5 recordables')
}
