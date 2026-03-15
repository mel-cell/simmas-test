import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { approvalGuruService } from '@/services/approval.guruService'

export async function GET() {
  try {
    const profileData = await authService.getProfile()
    const role = profileData?.profile?.role || profileData?.user?.user_metadata?.role

    if (!profileData?.user || role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const journals = await approvalGuruService.getJournalsForApproval(profileData.user.id)
    const internships = await approvalGuruService.getPendingInternships(profileData.user.id)
    
    return NextResponse.json({ 
      journals,
      internships
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data jurnal'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
