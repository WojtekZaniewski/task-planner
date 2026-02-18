'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import type { Task, TaskPriority, TaskStatus, Profile } from '@/lib/types'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TaskFormData) => Promise<void>
  initialData?: Task | null
  members?: Profile[]
  showAssignee?: boolean
}

export interface TaskFormData {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string
  due_time: string
  assigned_to: string | null
}

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  members,
  showAssignee = false,
}: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(initialData?.status ?? 'todo')
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(initialData?.due_date ?? '')
  const [dueTime, setDueTime] = useState(initialData?.due_time?.slice(0, 5) ?? '')
  const [assignedTo, setAssignedTo] = useState(initialData?.assigned_to ?? '')

  // Reset form when initialData changes
  const isEditing = !!initialData

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate || '',
        due_time: dueTime || '',
        assigned_to: assignedTo || null,
      })
      // Reset form
      if (!isEditing) {
        setTitle('')
        setDescription('')
        setStatus('todo')
        setPriority('medium')
        setDueDate('')
        setDueTime('')
        setAssignedTo('')
      }
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edytuj zadanie' : 'Nowe zadanie'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Co trzeba zrobić?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis (opcjonalny)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodatkowe szczegóły..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Do zrobienia</SelectItem>
                  <SelectItem value="in_progress">W trakcie</SelectItem>
                  <SelectItem value="done">Zrobione</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorytet</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niski</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="high">Wysoki</SelectItem>
                  <SelectItem value="urgent">Pilny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">Godzina</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {showAssignee && members && members.length > 0 && (
            <div className="space-y-2">
              <Label>Przypisz do</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Nieprzypisane" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nieprzypisane</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading && <Loader2 className="animate-spin" />}
              {isEditing ? 'Zapisz' : 'Utwórz'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
