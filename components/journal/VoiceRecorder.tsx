'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n'

interface VoiceRecorderProps {
  recording: boolean
  uploading: boolean
  onStart: () => void
  onStop: () => void
}

export function VoiceRecorder({ recording, uploading, onStart, onStop }: VoiceRecorderProps) {
  const t = useTranslations()
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (recording) {
      setElapsed(0)
      intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setElapsed(0)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [recording])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (uploading) {
    return (
      <button disabled className="glass-button flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs text-muted-foreground opacity-60">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {t.voice.uploading}
      </button>
    )
  }

  if (recording) {
    return (
      <button
        type="button"
        onClick={onStop}
        className={cn(
          'flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-medium',
          'bg-destructive/15 border border-destructive/30 text-destructive',
          'animate-pulse transition-all'
        )}
      >
        <Square className="h-3.5 w-3.5 fill-current" />
        {formatTime(elapsed)}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onStart}
      className="glass-button flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <Mic className="h-3.5 w-3.5" />
      {t.voice.record}
    </button>
  )
}
