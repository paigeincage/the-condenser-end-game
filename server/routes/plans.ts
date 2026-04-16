import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '../../uploads/plans')

// Ensure uploads directory exists
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const name = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${Date.now()}-${name}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})

export const plansRouter = Router()

// GET /api/plans — list all uploaded plans
plansRouter.get('/', (_req, res) => {
  const plansFile = path.join(uploadsDir, 'plans.json')
  if (!fs.existsSync(plansFile)) {
    res.json([])
    return
  }
  const plans = JSON.parse(fs.readFileSync(plansFile, 'utf-8'))
  res.json(plans)
})

// POST /api/plans/upload — upload a PDF and convert to images
plansRouter.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const planName = (req.body.planName || 'Unknown Plan').trim()
    const pdfPath = req.file.path
    const pdfBasename = path.basename(pdfPath, '.pdf')
    const pagesDir = path.join(uploadsDir, pdfBasename)

    fs.mkdirSync(pagesDir, { recursive: true })

    // Convert PDF pages to PNG using pdftoppm
    console.log(`[Plans] Converting PDF: ${pdfPath}`)
    try {
      execSync(
        `pdftoppm -png -r 200 "${pdfPath}" "${path.join(pagesDir, 'page')}"`,
        { timeout: 120000 }
      )
    } catch (err: any) {
      console.error('[Plans] pdftoppm failed:', err.message)
      res.status(500).json({ error: 'PDF conversion failed. pdftoppm may not be installed.' })
      return
    }

    // Collect generated page images
    const pageFiles = fs.readdirSync(pagesDir)
      .filter(f => f.endsWith('.png'))
      .sort()

    const pages = pageFiles.map(f => `/uploads/plans/${pdfBasename}/${f}`)

    // Save plan record
    const plansFile = path.join(uploadsDir, 'plans.json')
    const plans = fs.existsSync(plansFile)
      ? JSON.parse(fs.readFileSync(plansFile, 'utf-8'))
      : []

    const planRecord = {
      id: Date.now().toString(),
      name: planName,
      pdfFilename: req.file.filename,
      pages,
      pageCount: pages.length,
      uploadedAt: new Date().toISOString(),
      specs: null, // populated by Claude API later
    }

    plans.push(planRecord)
    fs.writeFileSync(plansFile, JSON.stringify(plans, null, 2))

    console.log(`[Plans] ${planName}: ${pages.length} pages converted`)
    res.json(planRecord)
  } catch (err: any) {
    console.error('[Plans] Upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/plans/:id/analyze — send pages to Claude for spec extraction
plansRouter.post('/:id/analyze', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })
      return
    }

    const plansFile = path.join(uploadsDir, 'plans.json')
    if (!fs.existsSync(plansFile)) {
      res.status(404).json({ error: 'No plans found' })
      return
    }

    const plans = JSON.parse(fs.readFileSync(plansFile, 'utf-8'))
    const plan = plans.find((p: any) => p.id === req.params.id)
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' })
      return
    }

    const client = new Anthropic({ apiKey })

    // Read page images and send to Claude
    const imageContents: any[] = []
    for (const pagePath of plan.pages.slice(0, 10)) { // max 10 pages
      const fullPath = path.join(__dirname, '../..', pagePath)
      if (fs.existsSync(fullPath)) {
        const imageData = fs.readFileSync(fullPath).toString('base64')
        imageContents.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: imageData },
        })
      }
    }

    if (imageContents.length === 0) {
      res.status(400).json({ error: 'No page images found' })
      return
    }

    console.log(`[Plans] Analyzing ${imageContents.length} pages with Claude...`)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: `These are construction plan drawings for a residential home plan called "${plan.name}".

Analyze all pages and extract the following information. Be thorough and consistent — every field must be populated for every plan. If you cannot determine a value from the drawings, use null (not 0, not an empty string).

IMPORTANT RULES:
- "roofMaterial" = the material covering the roof (e.g. "Composite Shingles", "Metal", "Tile"). Do NOT include the roof shape/style here.
- "roofStyle" = the structural shape (e.g. "Gable", "Hip", "Combination Hip & Gable"). Separate field from material.
- "totalSqFt" = total heated/conditioned living area only. Do NOT include garage, porches, or patios.
- Count carefully: count every window, door, sink, toilet, tub, and shower individually from the floor plans.
- "rooms" = list ALL rooms shown on floor plans including closets, pantries, utility rooms, hallways. Include dimensions if shown.
- "exteriorMaterials" = only list cladding/siding materials (e.g. "Brick", "Stone", "Hardie Board", "Stucco"). Do NOT include roofing here.

Return a JSON object with this exact structure:

{
  "planName": "string",
  "stories": number,
  "totalSqFt": number or null,
  "bedrooms": number,
  "bathrooms": number,
  "halfBaths": number,
  "garage": "string (e.g. '2 Car', '3 Car')",
  "rooms": [{ "name": "string", "floor": number, "dimensions": "string or null" }],
  "windows": number or null,
  "exteriorDoors": number or null,
  "interiorDoors": number or null,
  "fixtures": { "sinks": number, "toilets": number, "tubs": number, "showers": number },
  "hvacUnits": number or null,
  "waterHeaters": number or null,
  "foundationType": "string or null",
  "roofStyle": "string or null",
  "roofMaterial": "string or null",
  "exteriorMaterials": ["string"],
  "notes": ["string — any other notable construction details"]
}

Return ONLY the JSON object, no other text.`
          }
        ],
      }],
    })

    let responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code fences if Claude wrapped the JSON
    responseText = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()

    let specs: any
    try {
      specs = JSON.parse(responseText)
    } catch {
      // Try to extract JSON from the response if there's surrounding text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          specs = JSON.parse(jsonMatch[0])
        } catch {
          specs = { raw: responseText, parseError: true }
        }
      } else {
        specs = { raw: responseText, parseError: true }
      }
    }

    // Save specs back to plan record
    plan.specs = specs
    fs.writeFileSync(plansFile, JSON.stringify(plans, null, 2))

    console.log(`[Plans] Analysis complete for ${plan.name}`)
    res.json({ specs })
  } catch (err: any) {
    console.error('[Plans] Analysis error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/plans/restore — restore plans from browser local save (specs + metadata only, no images)
plansRouter.post('/restore', (req, res) => {
  try {
    const plansData = req.body
    if (!Array.isArray(plansData)) {
      res.status(400).json({ error: 'Expected an array of plan records' })
      return
    }

    const plansFile = path.join(uploadsDir, 'plans.json')
    const existing = fs.existsSync(plansFile)
      ? JSON.parse(fs.readFileSync(plansFile, 'utf-8'))
      : []

    // Merge: add restored plans that don't already exist on the server
    const existingIds = new Set(existing.map((p: any) => p.id))
    for (const plan of plansData) {
      if (!existingIds.has(plan.id)) {
        existing.push(plan)
      }
    }

    fs.writeFileSync(plansFile, JSON.stringify(existing, null, 2))
    console.log(`[Plans] Restored ${plansData.length} plans from browser`)
    res.json({ success: true, count: existing.length })
  } catch (err: any) {
    console.error('[Plans] Restore error:', err)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/plans/:id
plansRouter.delete('/:id', (req, res) => {
  const plansFile = path.join(uploadsDir, 'plans.json')
  if (!fs.existsSync(plansFile)) {
    res.status(404).json({ error: 'No plans found' })
    return
  }

  let plans = JSON.parse(fs.readFileSync(plansFile, 'utf-8'))
  plans = plans.filter((p: any) => p.id !== req.params.id)
  fs.writeFileSync(plansFile, JSON.stringify(plans, null, 2))

  res.json({ success: true })
})
