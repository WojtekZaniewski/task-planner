'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority } from '@/lib/types'
import type { TaskFormData } from '@/lib/hooks/use-tasks'
import { useTranslations } from '@/lib/i18n'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TaskFormData) => Promise<void>
  editTask?: Task | null
}

export function TaskForm({ open, onOpenChange, onSubmit, editTask }: TaskFormProps) {
  const t = useTranslations()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title)
      setDescription(editTask.description ?? '')
      setStatus(editTask.status)
      setPriority(editTask.priority)
      setDueDate(editTask.due_date ?? '')
      setDueTime(editTask.due_time ?? '')
    } else {
      setTitle('')
      setDescription('')
      setStatus('todo')
      setPriority('medium')
      setDueDate('')
      setDueTime('')
    }
  }, [editTask, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-white/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editTask ? t.tasks.editTask : t.tasks.newTask}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.tasks.titleLabel}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.tasks.titlePlaceholder}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t.tasks.descriptionLabel}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.tasks.descriptionPlaceholder}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t.tasks.statusLabel}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{t.tasks.statusTodo}</SelectItem>
                  <SelectItem value="in_progress">{t.tasks.statusInProgress}</SelectItem>
                  <SelectItem value="done">{t.tasks.statusDone}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.tasks.priorityLabel}</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t.tasks.priorityLow}</SelectItem>
                  <SelectItem value="medium">{t.tasks.priorityMedium}</SelectItem>
                  <SelectItem value="high">{t.tasks.priorityHigh}</SelectItem>
                  <SelectItem value="urgent">{t.tasks.priorityUrgent}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dueDate">{t.tasks.dateLabel}</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime">{t.tasks.timeLabel}</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {editTask ? t.tasks.saveChanges : t.tasks.createTask}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
