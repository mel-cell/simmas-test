const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('magang')
    .select(`
      id,
      siswa_id,
      tgl_mulai,
      tgl_selesai,
      status,
      nilai_akhir,
      catatan,
      siswa:siswa_id (full_name, nomor_induk, kelas, jurusan),
      dudi:dudi_id (id, nama_perusahaan, alamat)
    `)
    .limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
