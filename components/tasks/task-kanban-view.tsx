'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TaskStatus } from '@/lib/types'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'Do zrobienia', color: 'border-t-blue-500' },
  { id: 'in_progress', title: 'W trakcie', color: 'border-t-yellow-500' },
  { id: 'done', title: 'Zrobione', color: 'border-t-green-500' },
]

interface KanbanViewProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
  showAssignee?: boolean
}

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  showAssignee,
}: {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
  showAssignee?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        showAssignee={showAssignee}
        compact
      />
    </div>
  )
}

export function TaskKanbanView({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  showAssignee = false,
}: KanbanViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if dropped on a column
    const targetColumn = columns.find((c) => c.id === overId)
    if (targetColumn) {
      onStatusChange(activeId, targetColumn.id)
      return
    }

    // Check if dropped on a task in a different column
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask) {
      const activeTaskData = tasks.find((t) => t.id === activeId)
      if (activeTaskData && activeTaskData.status !== overTask.status) {
        onStatusChange(activeId, overTask.status)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id)

          return (
            <div
              key={column.id}
              className={cn(
                'rounded-lg border border-t-4 bg-muted/30 p-3',
                column.color
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium">{column.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>

              <SortableContext
                id={column.id}
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 min-h-[100px]" id={column.id}>
                  {columnTasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      showAssignee={showAssignee}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-80">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
              compact
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
