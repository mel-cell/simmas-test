import { supabase } from '@/lib/supabase'

export const uploadService = {
  uploadFile: async (file: File, bucket: string): Promise<string | null> => {
    try {
      // Validasi ukuran (Max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File terlalu besar (Max 5MB)')
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
      const filePath = `${fileName}` // Langsung di root bucket agar simpel

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error detail saat upload ke Supabase:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (err) {
      console.error('Unexpected error during upload:', err)
      return null
    }
  }
}
