'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function JoinWorkspacePage() {
  const params = useParams()
  const code = params.code as string
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_member'>('loading')
  const [workspaceName, setWorkspaceName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    joinWorkspace()
  }, [code])

  async function joinWorkspace() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login and come back
      router.push(`/login?next=/coworking/join/${code}`)
      return
    }

    // Find invite
    const { data: invite, error: inviteError } = await supabase
      .from('workspace_invites')
      .select('*, workspaces(name)')
      .eq('code', code)
      .single()

    if (inviteError || !invite) {
      setStatus('error')
      setErrorMessage('Zaproszenie nie istnieje lub wygasło')
      return
    }

    setWorkspaceName((invite as any).workspaces?.name || 'Workspace')

    // Check if already a member
    const { data: existing } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', invite.workspace_id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      setStatus('already_member')
      setTimeout(() => router.push(`/coworking/${invite.workspace_id}`), 2000)
      return
    }

    // Check expiry
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      setStatus('error')
      setErrorMessage('Zaproszenie wygasło')
      return
    }

    // Check max uses
    if (invite.max_uses && invite.use_count >= invite.max_uses) {
      setStatus('error')
      setErrorMessage('Zaproszenie osiągnęło limit użyć')
      return
    }

    // Join workspace
    const { error: joinError } = await supabase.from('workspace_members').insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: 'member',
    })

    if (joinError) {
      setStatus('error')
      setErrorMessage('Nie udało się dołączyć')
      console.error(joinError)
      return
    }

    // Increment use count
    await supabase
      .from('workspace_invites')
      .update({ use_count: invite.use_count + 1 })
      .eq('id', invite.id)

    setStatus('success')
    toast.success('Dołączono do workspace!')
    setTimeout(() => {
      router.push(`/coworking/${invite.workspace_id}`)
      router.refresh()
    }, 1500)
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>
            {status === 'loading' && 'Dołączanie...'}
            {status === 'success' && 'Dołączono!'}
            {status === 'already_member' && 'Już jesteś członkiem'}
            {status === 'error' && 'Błąd'}
          </CardTitle>
          {workspaceName && (
            <CardDescription>{workspaceName}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-8 w-8 text-green-500" />
          )}
          {status === 'already_member' && (
            <>
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <p className="text-sm text-muted-foreground">Przekierowuję...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button variant="outline" onClick={() => router.push('/coworking')}>
                Wróć do coworkingu
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
