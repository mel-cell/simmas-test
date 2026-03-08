import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables (from .env.local)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
// NOTE: For seeding auth users, you MUST have the SUPABASE_SERVICE_ROLE_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' 

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedTable(tableName: string, dataFile: string) {
  console.log(`📡 Seeding ${tableName}...`)
  const dataPath = path.resolve(process.cwd(), 'seed/data', dataFile)
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ File not found: ${dataPath}`)
    return
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  const { error } = await supabase
    .from(tableName)
    .upsert(data)

  if (error) console.error(`❌ Error seeding ${tableName}:`, error.message)
  else console.log(`✅ ${tableName} seeded successfully!`)
}

async function main() {
  console.log('🏁 Starting Seeding...')
  
  // 1. Seed Public Tables
  await seedTable('sekolah_settings', 'sekolah_settings.json')
  await seedTable('dudi', 'dudi.json')
  // Users seeding usually requires service_role key to manage auth.users
  // If you only want to seed public profiles, you can add it here.

  console.log('🚀 Seeding process completed!')
}

main().catch(err => {
  console.error('💥 Fatal Error:', err)
  process.exit(1)
})
