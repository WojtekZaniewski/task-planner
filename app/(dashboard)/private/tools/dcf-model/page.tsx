'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { DCFAssumptions, DCFResult } from '@/lib/types'
import { runDCF } from '@/lib/financial/dcf-model'
import { DCFAssumptionsForm } from '@/components/tools/dcf-model/dcf-assumptions-form'
import { DCFResultsDashboard } from '@/components/tools/dcf-model/dcf-results-dashboard'
import { SensitivityTable } from '@/components/tools/dcf-model/sensitivity-table'

export default function DCFModelPage() {
  const [result, setResult] = useState<DCFResult | null>(null)

  function handleSubmit(
    companyName: string,
    baseRevenue: number,
    assumptions: DCFAssumptions,
    netDebt: number,
    cash: number,
    sharesOutstanding: number,
  ) {
    const dcfResult = runDCF(companyName, baseRevenue, assumptions, netDebt, cash, sharesOutstanding)
    setResult(dcfResult)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-8">
      <div className="space-y-1">
        <Link
          href="/private/tools"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Narzedzia
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Model wyceny DCF</h1>
        <p className="text-sm font-light text-muted-foreground">
          Wycena przedsiebiorstw metoda zdyskontowanych przeplywow pienieznych
        </p>
      </div>

      <div className="glow-card glow-teal rounded-2xl border border-border/50 p-5 sm:p-6 bg-card dark:glass-card">
        <DCFAssumptionsForm onSubmit={handleSubmit} />
      </div>

      {result && (
        <>
          <DCFResultsDashboard result={result} />
          <SensitivityTable
            table={result.sensitivity_table}
            baseEV={result.enterprise_value}
          />
        </>
      )}
    </div>
  )
}
