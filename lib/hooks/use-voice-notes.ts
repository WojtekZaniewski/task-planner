'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getT } from '@/lib/i18n'
import type { VoiceNote, VoiceNoteRow } from '@/lib/types'

function rowToVoiceNote(row: VoiceNoteRow, signedUrl?: string): VoiceNote {
  return {
    id: row.id,
    missionId: row.mission_id,
    storagePath: row.storage_path,
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
    signedUrl,
  }
}

function getMimeType(): string {
  if (typeof window === 'undefined') return 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
  return ''
}

function getExtension(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'm4a'
  return 'webm'
}

export function useVoiceNotes(missionId: string | null) {
  const [notes, setNotes] = useState<VoiceNote[]>([])
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)

  const fetchNotes = useCallback(async () => {
    if (!missionId) { setNotes([]); return }
    let cancelled = false
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('voice_notes')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: true })

    if (cancelled) return
    if (error) { toast.error(getT().errors.loadVoiceNotes); setLoading(false); return }

    const rows = (data ?? []) as VoiceNoteRow[]
    const notesWithUrls = await Promise.all(
      rows.map(async (row) => {
        const { data: urlData } = await supabase.storage
          .from('voice-notes')
          .createSignedUrl(row.storage_path, 3600)
        return rowToVoiceNote(row, urlData?.signedUrl)
      })
    )

    if (!cancelled) {
      setNotes(notesWithUrls)
      setLoading(false)
    }

    return () => { cancelled = true }
  }, [missionId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const startRecording = useCallback(async () => {
    const mimeType = getMimeType()
    if (!mimeType) {
      toast.error(getT().errors.browserNoAudio)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      startTimeRef.current = Date.now()

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start(1000)
      setRecording(true)
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        toast.error(getT().errors.micAccess)
      } else {
        toast.error(getT().errors.startRecording)
      }
    }
  }, [])

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || !missionId) return

    setRecording(false)
    setUploading(true)

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)

    await new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const ext = getExtension(mimeType)
        const noteId = crypto.randomUUID()

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setUploading(false); resolve(); return }

        const storagePath = `${user.id}/${missionId}/${noteId}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('voice-notes')
          .upload(storagePath, blob, { contentType: mimeType })

        if (uploadError) {
          toast.error(getT().errors.uploadRecording)
          setUploading(false)
          resolve()
          return
        }

        const { data: inserted, error: dbError } = await supabase
          .from('voice_notes')
          .insert({ user_id: user.id, mission_id: missionId, storage_path: storagePath, duration_seconds: durationSeconds })
          .select()
          .single()

        if (dbError) {
          toast.error(getT().errors.saveVoiceNote)
          setUploading(false)
          resolve()
          return
        }

        const { data: urlData } = await supabase.storage
          .from('voice-notes')
          .createSignedUrl(storagePath, 3600)

        const newNote = rowToVoiceNote(inserted as VoiceNoteRow, urlData?.signedUrl)
        setNotes(prev => [...prev, newNote])
        setUploading(false)
        resolve()
      }

      recorder.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
    })
  }, [missionId])

  const deleteNote = useCallback(async (noteId: string, storagePath: string) => {
    const supabase = createClient()
    await supabase.storage.from('voice-notes').remove([storagePath])
    await supabase.from('voice_notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }, [])

  const refreshSignedUrl = useCallback(async (storagePath: string): Promise<string> => {
    const supabase = createClient()
    const { data } = await supabase.storage.from('voice-notes').createSignedUrl(storagePath, 3600)
    return data?.signedUrl ?? ''
  }, [])

  return { notes, loading, recording, uploading, startRecording, stopRecording, deleteNote, refreshSignedUrl }
}
