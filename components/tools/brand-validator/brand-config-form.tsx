'use client'

import { useState } from 'react'
import type { BrandGuidelines } from '@/lib/types'
import { getDefaultGuidelines } from '@/lib/brand/validate-brand'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface BrandConfigFormProps {
  onSubmit: (content: string, guidelines: BrandGuidelines) => void
}

function splitCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function BrandConfigForm({ onSubmit }: BrandConfigFormProps) {
  const defaults = getDefaultGuidelines()

  const [brandName, setBrandName] = useState(defaults.brand_name)
  const [primaryColors, setPrimaryColors] = useState(defaults.primary_colors.join(', '))
  const [secondaryColors, setSecondaryColors] = useState(defaults.secondary_colors.join(', '))
  const [fonts, setFonts] = useState(defaults.fonts.join(', '))
  const [toneKeywords, setToneKeywords] = useState(defaults.tone_keywords.join(', '))
  const [prohibitedWords, setProhibitedWords] = useState(defaults.prohibited_words.join(', '))
  const [content, setContent] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const guidelines: BrandGuidelines = {
      brand_name: brandName,
      primary_colors: splitCommaSeparated(primaryColors),
      secondary_colors: splitCommaSeparated(secondaryColors),
      fonts: splitCommaSeparated(fonts),
      tone_keywords: splitCommaSeparated(toneKeywords),
      prohibited_words: splitCommaSeparated(prohibitedWords),
    }

    onSubmit(content, guidelines)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glow-card glow-purple rounded-2xl border border-border/50 p-5 bg-card dark:glass-card space-y-4">
        <h2 className="text-lg font-semibold">Wytyczne marki</h2>

        <div className="space-y-2">
          <Label htmlFor="brand_name">Nazwa marki</Label>
          <Input
            id="brand_name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Nazwa marki"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_colors">Kolory glowne (hex, oddzielone przecinkami)</Label>
          <Input
            id="primary_colors"
            value={primaryColors}
            onChange={(e) => setPrimaryColors(e.target.value)}
            placeholder="#0066CC, #003366, #FFFFFF"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary_colors">Kolory dodatkowe (hex, oddzielone przecinkami)</Label>
          <Input
            id="secondary_colors"
            value={secondaryColors}
            onChange={(e) => setSecondaryColors(e.target.value)}
            placeholder="#28A745, #FFC107, #DC3545"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fonts">Czcionki (oddzielone przecinkami)</Label>
          <Input
            id="fonts"
            value={fonts}
            onChange={(e) => setFonts(e.target.value)}
            placeholder="Segoe UI, system-ui, sans-serif"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone_keywords">Slowa kluczowe tonu (oddzielone przecinkami)</Label>
          <Input
            id="tone_keywords"
            value={toneKeywords}
            onChange={(e) => setToneKeywords(e.target.value)}
            placeholder="innowacja, profesjonalizm, zaufanie"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prohibited_words">Slowa zabronione (oddzielone przecinkami)</Label>
          <Input
            id="prohibited_words"
            value={prohibitedWords}
            onChange={(e) => setProhibitedWords(e.target.value)}
            placeholder="tani, przestarzaly, nieprofesjonalny"
          />
        </div>
      </div>

      <div className="glow-card glow-purple rounded-2xl border border-border/50 p-5 bg-card dark:glass-card space-y-4">
        <h2 className="text-lg font-semibold">Tresc do walidacji</h2>

        <div className="space-y-2">
          <Label htmlFor="content">Wklej tresc do sprawdzenia</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Wklej tutaj tresc do walidacji pod katem zgodnosci z wytycznymi marki..."
            className="min-h-[200px]"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!content.trim()}>
        Waliduj
      </Button>
    </form>
  )
}
