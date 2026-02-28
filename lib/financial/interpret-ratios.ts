import type { IndustryType } from '@/lib/types'

interface Benchmarks {
  current_ratio: { excellent: number; good: number; acceptable: number; poor: number }
  debt_to_equity: { excellent: number; good: number; acceptable: number; poor: number }
  roe: { excellent: number; good: number; acceptable: number; poor: number }
  gross_margin: { excellent: number; good: number; acceptable: number; poor: number }
  pe_ratio: { undervalued: number; fair: number; growth: number; expensive: number }
}

const INDUSTRY_BENCHMARKS: Record<IndustryType, Benchmarks> = {
  technology: {
    current_ratio: { excellent: 2.5, good: 1.8, acceptable: 1.2, poor: 1.0 },
    debt_to_equity: { excellent: 0.3, good: 0.5, acceptable: 1.0, poor: 2.0 },
    roe: { excellent: 0.25, good: 0.18, acceptable: 0.12, poor: 0.08 },
    gross_margin: { excellent: 0.70, good: 0.50, acceptable: 0.35, poor: 0.20 },
    pe_ratio: { undervalued: 15, fair: 25, growth: 35, expensive: 50 },
  },
  retail: {
    current_ratio: { excellent: 2.0, good: 1.5, acceptable: 1.0, poor: 0.8 },
    debt_to_equity: { excellent: 0.5, good: 0.8, acceptable: 1.5, poor: 2.5 },
    roe: { excellent: 0.20, good: 0.15, acceptable: 0.10, poor: 0.05 },
    gross_margin: { excellent: 0.40, good: 0.30, acceptable: 0.20, poor: 0.10 },
    pe_ratio: { undervalued: 12, fair: 18, growth: 25, expensive: 35 },
  },
  financial: {
    current_ratio: { excellent: 1.5, good: 1.2, acceptable: 1.0, poor: 0.8 },
    debt_to_equity: { excellent: 1.0, good: 2.0, acceptable: 4.0, poor: 6.0 },
    roe: { excellent: 0.15, good: 0.12, acceptable: 0.08, poor: 0.05 },
    gross_margin: { excellent: 0.40, good: 0.30, acceptable: 0.20, poor: 0.10 },
    pe_ratio: { undervalued: 10, fair: 15, growth: 20, expensive: 30 },
  },
  manufacturing: {
    current_ratio: { excellent: 2.2, good: 1.7, acceptable: 1.3, poor: 1.0 },
    debt_to_equity: { excellent: 0.4, good: 0.7, acceptable: 1.2, poor: 2.0 },
    roe: { excellent: 0.18, good: 0.14, acceptable: 0.10, poor: 0.06 },
    gross_margin: { excellent: 0.35, good: 0.25, acceptable: 0.18, poor: 0.12 },
    pe_ratio: { undervalued: 14, fair: 20, growth: 28, expensive: 40 },
  },
  healthcare: {
    current_ratio: { excellent: 2.3, good: 1.8, acceptable: 1.4, poor: 1.0 },
    debt_to_equity: { excellent: 0.3, good: 0.6, acceptable: 1.0, poor: 1.8 },
    roe: { excellent: 0.22, good: 0.16, acceptable: 0.11, poor: 0.07 },
    gross_margin: { excellent: 0.65, good: 0.45, acceptable: 0.30, poor: 0.20 },
    pe_ratio: { undervalued: 18, fair: 28, growth: 40, expensive: 55 },
  },
}

export function getBenchmarks(industry: IndustryType): Benchmarks {
  return INDUSTRY_BENCHMARKS[industry]
}

export function assessOverallHealth(ratings: string[]): { status: string; message: string; score: string } {
  const scoreMap: Record<string, number> = {
    excellent: 4,
    good: 3,
    acceptable: 2,
    poor: 1,
  }

  const scores = ratings.map((r) => scoreMap[r] ?? 2)
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  if (avg >= 3.5) return { status: 'Doskonaly', message: 'Firma wykazuje silna kondycje finansowa', score: `${avg.toFixed(1)}/4.0` }
  if (avg >= 2.5) return { status: 'Dobry', message: 'Ogolnie zdrowa pozycja finansowa', score: `${avg.toFixed(1)}/4.0` }
  if (avg >= 1.5) return { status: 'Przecietny', message: 'Mieszane wskazniki finansowe', score: `${avg.toFixed(1)}/4.0` }
  return { status: 'Slaby', message: 'Znaczne wyzwania finansowe', score: `${avg.toFixed(1)}/4.0` }
}
