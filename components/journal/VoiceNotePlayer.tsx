'use client'

import { useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { VoiceNote } from '@/lib/types'

interface VoiceNotePlayerProps {
  note: VoiceNote
  onDelete?: () => void
  onSignedUrlExpired?: () => Promise<string>
}

function formatDuration(seconds: number | null): string | null {
  if (seconds === null) return null
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function VoiceNotePlayer({ note, onDelete, onSignedUrlExpired }: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  async function handleAudioError() {
    if (!onSignedUrlExpired || !audioRef.current) return
    const newUrl = await onSignedUrlExpired()
    if (newUrl) audioRef.current.src = newUrl
  }

  const duration = formatDuration(note.durationSeconds)

  return (
    <div className="glass rounded-2xl px-4 py-3 flex flex-col gap-2">
      <audio
        ref={audioRef}
        controls
        src={note.signedUrl}
        preload="metadata"
        onError={handleAudioError}
        className="w-full h-8"
        style={{ colorScheme: 'light dark' }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {format(parseISO(note.createdAt), 'd MMM yyyy, HH:mm', { locale: pl })}
          {duration && <span className="ml-2 opacity-60">{duration}</span>}
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg"
            aria-label="Usuń notatkę głosową"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
