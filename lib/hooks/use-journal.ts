'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry, JournalEntryType } from '@/lib/types'
import { toast } from 'sonner'

interface UseJournalOptions {
  workspaceId?: string | null
  isPrivate?: boolean
}

export function useJournal({ workspaceId, isPrivate }: UseJournalOptions) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchEntries = useCallback(async () => {
    let query = supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (isPrivate) {
      query = query.is('workspace_id', null)
    } else if (workspaceId) {
      query = query.eq('workspace_id', workspaceId)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Nie udało się pobrać dziennika')
      console.error(error)
    } else {
      setEntries(data ?? [])
    }
    setLoading(false)
  }, [workspaceId, isPrivate, supabase])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Real-time subscription for workspace entries
  useEffect(() => {
    if (!workspaceId) return

    const channel = supabase
      .channel(`journal:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          fetchEntries()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId, supabase, fetchEntries])

  const createEntry = useCallback(
    async (content: string, type: JournalEntryType) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('journal_entries').insert({
        content,
        type,
        workspace_id: isPrivate ? null : workspaceId,
        created_by: user.id,
      })

      if (error) {
        toast.error('Nie udało się dodać wpisu')
        console.error(error)
        throw error
      }

      toast.success('Wpis dodany')
      fetchEntries()
    },
    [supabase, workspaceId, isPrivate, fetchEntries]
  )

  const deleteEntry = useCallback(
    async (entryId: string) => {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

      if (error) {
        toast.error('Nie udało się usunąć wpisu')
        console.error(error)
        throw error
      }

      toast.success('Wpis usunięty')
      fetchEntries()
    },
    [supabase, fetchEntries]
  )

  const updateEntry = useCallback(
    async (entryId: string, content: string) => {
      const { error } = await supabase
        .from('journal_entries')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', entryId)

      if (error) {
        toast.error('Nie udało się zaktualizować wpisu')
        console.error(error)
        throw error
      }

      fetchEntries()
    },
    [supabase, fetchEntries]
  )

  return {
    entries,
    loading,
    createEntry,
    deleteEntry,
    updateEntry,
    refresh: fetchEntries,
  }
}
