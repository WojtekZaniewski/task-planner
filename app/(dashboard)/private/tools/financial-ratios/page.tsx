'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { FinancialStatements, IndustryType, RatioCategory } from '@/lib/types'
import { calculateRatios, generateSummary } from '@/lib/financial/calculate-ratios'
import { RatioInputForm } from '@/components/tools/financial-ratios/ratio-input-form'
import { RatioResults } from '@/components/tools/financial-ratios/ratio-results'

export default function FinancialRatiosPage() {
  const [results, setResults] = useState<{
    categories: RatioCategory[]
    summary: string
  } | null>(null)

  function handleSubmit(data: FinancialStatements, industry: IndustryType) {
    const categories = calculateRatios(data, industry)
    const summary = generateSummary(categories)
    setResults({ categories, summary })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/private/tools"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Narzedzia
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Kalkulator wskaznikow finansowych
        </h1>
        <p className="text-sm font-light text-muted-foreground mt-1">
          Wprowadz dane finansowe i oblicz kluczowe wskazniki
        </p>
      </div>

      {/* Form */}
      <RatioInputForm onSubmit={handleSubmit} />

      {/* Results */}
      {results && (
        <RatioResults
          categories={results.categories}
          summary={results.summary}
        />
      )}
    </div>
  )
}
