'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { BrandGuidelines, BrandValidationResult } from '@/lib/types'
import { validateBrand } from '@/lib/brand/validate-brand'
import { BrandConfigForm } from '@/components/tools/brand-validator/brand-config-form'
import { ValidationResults } from '@/components/tools/brand-validator/validation-results'

export default function BrandValidatorPage() {
  const [result, setResult] = useState<BrandValidationResult | null>(null)

  function handleSubmit(content: string, guidelines: BrandGuidelines) {
    const validationResult = validateBrand(content, guidelines)
    setResult(validationResult)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/private/tools"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Narzedzia
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Walidator marki</h1>
        <p className="text-sm font-light text-muted-foreground mt-1">
          Sprawdz zgodnosc tresci z wytycznymi marki
        </p>
      </div>

      <BrandConfigForm onSubmit={handleSubmit} />

      {result && <ValidationResults result={result} />}
    </div>
  )
}
