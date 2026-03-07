import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables (from .env.local)
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
// NOTE: For seeding auth users, you MUST have the SUPABASE_SERVICE_ROLE_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '' 

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedTable(tableName: string, dataFile: string) {
  console.log(`📡 Seeding ${tableName}...`)
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', dataFile), 'utf8'))

  const { error } = await supabase
    .from(tableName)
    .upsert(data, { onConflict: 'id' })

  if (error) console.error(`Error seeding ${tableName}:`, error)
  else console.log(`${tableName} seeded successfully!`)
}

async function main() {
  if (!supabaseKey) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is missing. Auth users seeding might fail.')
  }

  // 1. Seed Public Tables
  await seedTable('sekolah_settings', 'sekolah_settings.json')
  await seedTable('dudi', 'dudi.json')
  // Add other tables here...

  console.log('🚀 Seeding process completed!')
}

main()
