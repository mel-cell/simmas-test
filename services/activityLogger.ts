import { supabase } from '@/lib/supabase'

export const logActivity = async <T>(
  action: string, 
  entityType: string, 
  entityId?: string | null, 
  details?: T,
  passedUserId?: string | null
) => {
  try {
    let userId = passedUserId
    
    if (!userId) {
       const { data: { user } } = await supabase.auth.getUser()
       userId = user?.id || null
    }

    // Ensure entityId is a valid UUID, otherwise pass null since DB expects UUID
    const isValidUUID = entityId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(entityId);

    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      action: action,
      entity_type: entityType,
      entity_id: isValidUUID ? entityId : null,
      details: details || {}
    })

    if (error) {
      console.error('ActLogErr:', error.message)
    }
  } catch (error) {
    console.error('Exception logging activity:', error)
  }
}
