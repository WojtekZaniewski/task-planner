'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Workspace } from '@/lib/types'

export default function CoworkingPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  async function fetchWorkspaces() {
    const { data: memberships } = await supabase
      .from('workspace_members')
      .select('workspace_id, workspaces(id, name, description, owner_id, created_at)')
      .order('joined_at', { ascending: false })

    const ws = (memberships ?? [])
      .map((m: any) => m.workspaces)
      .filter(Boolean)

    setWorkspaces(ws)
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setCreating(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Musisz być zalogowany')
      setCreating(false)
      return
    }

    // Create workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      toast.error('Nie udało się utworzyć workspace')
      console.error(error)
      setCreating(false)
      return
    }

    // Add creator as owner member
    await supabase.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner',
    })

    toast.success('Workspace utworzony!')
    setName('')
    setDescription('')
    setCreateOpen(false)
    setCreating(false)
    router.push(`/coworking/${workspace.id}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Coworking</h1>
          <p className="text-sm text-muted-foreground">
            Wspólne przestrzenie robocze
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nowy workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Brak workspace&apos;ów</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Utwórz pierwszy workspace, aby zacząć współpracować
            </p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Utwórz workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/coworking/${ws.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{ws.name}</CardTitle>
                {ws.description && (
                  <CardDescription>{ws.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create workspace dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nowy workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wsName">Nazwa</Label>
              <Input
                id="wsName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Zespół marketingu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wsDesc">Opis (opcjonalny)</Label>
              <Textarea
                id="wsDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Czym zajmuje się ten workspace?"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" disabled={creating || !name.trim()}>
                {creating && <Loader2 className="animate-spin" />}
                Utwórz
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
