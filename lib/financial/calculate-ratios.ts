import type { FinancialStatements, RatioCategory, RatioResult, RatioRating, IndustryType } from '@/lib/types'

function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  return denominator === 0 ? fallback : numerator / denominator
}

function formatRatio(value: number, type: 'percentage' | 'times' | 'days' | 'currency' | 'ratio' = 'ratio'): string {
  switch (type) {
    case 'percentage': return `${(value * 100).toFixed(2)}%`
    case 'times': return `${value.toFixed(2)}x`
    case 'days': return `${value.toFixed(1)} dni`
    case 'currency': return `$${value.toFixed(2)}`
    default: return value.toFixed(2)
  }
}

function interpretRatio(name: string, value: number): { text: string; rating: RatioRating } {
  const rules: Record<string, (v: number) => { text: string; rating: RatioRating }> = {
    roe: (v) =>
      v > 0.20 ? { text: 'Doskonale zwroty', rating: 'excellent' }
      : v > 0.15 ? { text: 'Dobre zwroty', rating: 'good' }
      : v > 0.10 ? { text: 'Przecietne zwroty', rating: 'acceptable' }
      : { text: 'Slabe zwroty', rating: 'poor' },
    roa: (v) =>
      v > 0.10 ? { text: 'Wysoka efektywnosc aktywow', rating: 'excellent' }
      : v > 0.05 ? { text: 'Dobra efektywnosc aktywow', rating: 'good' }
      : v > 0.02 ? { text: 'Przecietna efektywnosc', rating: 'acceptable' }
      : { text: 'Niska efektywnosc aktywow', rating: 'poor' },
    gross_margin: (v) =>
      v > 0.50 ? { text: 'Wysoka marza brutto', rating: 'excellent' }
      : v > 0.30 ? { text: 'Dobra marza brutto', rating: 'good' }
      : v > 0.15 ? { text: 'Przecietna marza brutto', rating: 'acceptable' }
      : { text: 'Niska marza brutto', rating: 'poor' },
    operating_margin: (v) =>
      v > 0.20 ? { text: 'Wysoka marza operacyjna', rating: 'excellent' }
      : v > 0.10 ? { text: 'Dobra marza operacyjna', rating: 'good' }
      : v > 0.05 ? { text: 'Przecietna marza operacyjna', rating: 'acceptable' }
      : { text: 'Niska marza operacyjna', rating: 'poor' },
    net_margin: (v) =>
      v > 0.15 ? { text: 'Wysoka marza netto', rating: 'excellent' }
      : v > 0.08 ? { text: 'Dobra marza netto', rating: 'good' }
      : v > 0.03 ? { text: 'Przecietna marza netto', rating: 'acceptable' }
      : { text: 'Niska marza netto', rating: 'poor' },
    current_ratio: (v) =>
      v > 2.0 ? { text: 'Silna plynnosc', rating: 'excellent' }
      : v > 1.5 ? { text: 'Dobra plynnosc', rating: 'good' }
      : v > 1.0 ? { text: 'Potencjalne problemy z plynnoscia', rating: 'acceptable' }
      : { text: 'Problemy z plynnoscia', rating: 'poor' },
    quick_ratio: (v) =>
      v > 1.5 ? { text: 'Silna plynnosc szybka', rating: 'excellent' }
      : v > 1.0 ? { text: 'Dobra plynnosc szybka', rating: 'good' }
      : v > 0.7 ? { text: 'Przecietna plynnosc', rating: 'acceptable' }
      : { text: 'Niska plynnosc szybka', rating: 'poor' },
    cash_ratio: (v) =>
      v > 0.5 ? { text: 'Silna pozycja gotowkowa', rating: 'excellent' }
      : v > 0.3 ? { text: 'Dobra pozycja gotowkowa', rating: 'good' }
      : v > 0.1 ? { text: 'Przecietna pozycja gotowkowa', rating: 'acceptable' }
      : { text: 'Niska pozycja gotowkowa', rating: 'poor' },
    debt_to_equity: (v) =>
      v < 0.5 ? { text: 'Niskie zadluzenie', rating: 'excellent' }
      : v < 1.0 ? { text: 'Umiarkowane zadluzenie', rating: 'good' }
      : v < 2.0 ? { text: 'Wysokie zadluzenie', rating: 'acceptable' }
      : { text: 'Bardzo wysokie zadluzenie', rating: 'poor' },
    interest_coverage: (v) =>
      v > 5 ? { text: 'Bardzo dobre pokrycie odsetek', rating: 'excellent' }
      : v > 3 ? { text: 'Dobre pokrycie odsetek', rating: 'good' }
      : v > 1.5 ? { text: 'Przecietne pokrycie', rating: 'acceptable' }
      : { text: 'Slabe pokrycie odsetek', rating: 'poor' },
    pe_ratio: (v) =>
      v <= 0 ? { text: 'N/D (ujemne zyski)', rating: 'poor' }
      : v < 15 ? { text: 'Potencjalnie niedowartosciowana', rating: 'excellent' }
      : v < 25 ? { text: 'Godziwa wartosc', rating: 'good' }
      : v < 40 ? { text: 'Premia za wzrost', rating: 'acceptable' }
      : { text: 'Wysoka wycena', rating: 'poor' },
  }

  const rule = rules[name]
  if (rule) return rule(value)
  return { text: 'Brak interpretacji', rating: 'acceptable' }
}

export function calculateRatios(data: FinancialStatements, _industry: IndustryType = 'technology'): RatioCategory[] {
  const { income_statement: is, balance_sheet: bs, market_data: md } = data

  const revenue = is.revenue
  const grossProfit = revenue - is.cost_of_goods_sold
  const shares = md.shares_outstanding
  const marketCap = md.share_price * shares
  const ev = marketCap + bs.total_debt - bs.cash_and_equivalents

  function makeRatio(name: string, label: string, value: number, format: 'percentage' | 'times' | 'days' | 'currency' | 'ratio'): RatioResult {
    const interp = interpretRatio(name, value)
    return {
      name: label,
      value,
      formatted: formatRatio(value, format),
      interpretation: interp.text,
      rating: interp.rating,
      recommendation: '',
    }
  }

  const profitability: RatioCategory = {
    name: 'Rentownosc',
    ratios: [
      makeRatio('roe', 'ROE', safeDivide(is.net_income, bs.shareholders_equity), 'percentage'),
      makeRatio('roa', 'ROA', safeDivide(is.net_income, bs.total_assets), 'percentage'),
      makeRatio('gross_margin', 'Marza brutto', safeDivide(grossProfit, revenue), 'percentage'),
      makeRatio('operating_margin', 'Marza operacyjna', safeDivide(is.operating_income, revenue), 'percentage'),
      makeRatio('net_margin', 'Marza netto', safeDivide(is.net_income, revenue), 'percentage'),
    ],
  }

  const liquidity: RatioCategory = {
    name: 'Plynnosc',
    ratios: [
      makeRatio('current_ratio', 'Wskaznik biezacy', safeDivide(bs.current_assets, bs.current_liabilities), 'times'),
      makeRatio('quick_ratio', 'Wskaznik szybki', safeDivide(bs.current_assets - bs.inventory, bs.current_liabilities), 'times'),
      makeRatio('cash_ratio', 'Wskaznik gotowkowy', safeDivide(bs.cash_and_equivalents, bs.current_liabilities), 'times'),
    ],
  }

  const leverage: RatioCategory = {
    name: 'Zadluzenie',
    ratios: [
      makeRatio('debt_to_equity', 'Dlug / Kapital', safeDivide(bs.total_debt, bs.shareholders_equity), 'times'),
      makeRatio('interest_coverage', 'Pokrycie odsetek', safeDivide(is.ebit, is.interest_expense), 'times'),
      makeRatio('debt_service_coverage', 'Pokrycie obslugi dlugu', safeDivide(is.operating_income, is.interest_expense + bs.current_portion_long_term_debt), 'times'),
    ],
  }

  const efficiency: RatioCategory = {
    name: 'Efektywnosc',
    ratios: [
      makeRatio('asset_turnover', 'Obrot aktywow', safeDivide(revenue, bs.total_assets), 'times'),
      makeRatio('inventory_turnover', 'Obrot zapasow', safeDivide(is.cost_of_goods_sold, bs.inventory), 'times'),
      makeRatio('receivables_turnover', 'Obrot naleznosci', safeDivide(revenue, bs.accounts_receivable), 'times'),
      makeRatio('days_sales_outstanding', 'DSO', safeDivide(365, safeDivide(revenue, bs.accounts_receivable)), 'days'),
    ],
  }

  const eps = safeDivide(is.net_income, shares)
  const bvps = safeDivide(bs.shareholders_equity, shares)

  const valuation: RatioCategory = {
    name: 'Wycena',
    ratios: [
      makeRatio('pe_ratio', 'P/E', safeDivide(md.share_price, eps), 'times'),
      { name: 'EPS', value: eps, formatted: formatRatio(eps, 'currency'), interpretation: '', rating: 'acceptable', recommendation: '' },
      makeRatio('pb_ratio', 'P/B', safeDivide(md.share_price, bvps), 'times'),
      makeRatio('ps_ratio', 'P/S', safeDivide(marketCap, revenue), 'times'),
      makeRatio('ev_to_ebitda', 'EV/EBITDA', safeDivide(ev, is.ebitda), 'times'),
      ...(md.earnings_growth_rate > 0
        ? [makeRatio('peg_ratio', 'PEG', safeDivide(safeDivide(md.share_price, eps), md.earnings_growth_rate * 100), 'times')]
        : []),
    ],
  }

  return [profitability, liquidity, leverage, efficiency, valuation]
}

export function generateSummary(categories: RatioCategory[]): string {
  const parts: string[] = []

  for (const cat of categories) {
    for (const r of cat.ratios) {
      if (r.rating === 'poor') {
        parts.push(`${r.name}: ${r.formatted} - ${r.interpretation}`)
      }
    }
  }

  if (parts.length === 0) return 'Ogolnie dobra kondycja finansowa we wszystkich kategoriach.'
  return `Obszary wymagajace uwagi: ${parts.join('; ')}`
}
