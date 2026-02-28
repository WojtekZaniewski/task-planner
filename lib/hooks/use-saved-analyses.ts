'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SavedAnalysis, AnalysisType } from '@/lib/types'
import { toast } from 'sonner'

export function useSavedAnalyses(type?: AnalysisType) {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAnalyses = useCallback(async () => {
    let query = supabase
      .from('saved_analyses')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Nie udalo sie pobrac analiz')
      console.error(error)
    } else {
      setAnalyses(data ?? [])
    }
    setLoading(false)
  }, [supabase, type])

  useEffect(() => {
    fetchAnalyses()
  }, [fetchAnalyses])

  const saveAnalysis = useCallback(
    async (name: string, analysisType: AnalysisType, data: Record<string, unknown>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('saved_analyses').insert({
        type: analysisType,
        name,
        data,
        created_by: user.id,
      })

      if (error) {
        toast.error('Nie udalo sie zapisac analizy')
        console.error(error)
        throw error
      }

      toast.success('Analiza zapisana')
      fetchAnalyses()
    },
    [supabase, fetchAnalyses],
  )

  const deleteAnalysis = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('saved_analyses').delete().eq('id', id)

      if (error) {
        toast.error('Nie udalo sie usunac analizy')
        console.error(error)
        throw error
      }

      toast.success('Analiza usunieta')
      fetchAnalyses()
    },
    [supabase, fetchAnalyses],
  )

  return {
    analyses,
    loading,
    saveAnalysis,
    deleteAnalysis,
    refresh: fetchAnalyses,
  }
}
