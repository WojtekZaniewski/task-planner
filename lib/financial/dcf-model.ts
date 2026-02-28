import type { DCFAssumptions, DCFProjection, DCFResult } from '@/lib/types'

export function calculateWACC(
  riskFreeRate: number,
  beta: number,
  equityRiskPremium: number,
  costOfDebt: number,
  debtToEquity: number,
  taxRate: number,
): number {
  const costOfEquity = riskFreeRate + beta * equityRiskPremium
  const equityWeight = 1 / (1 + debtToEquity)
  const debtWeight = debtToEquity / (1 + debtToEquity)
  return equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - taxRate)
}

export function projectCashFlows(
  baseRevenue: number,
  assumptions: DCFAssumptions,
  wacc: number,
): DCFProjection[] {
  const projections: DCFProjection[] = []
  let prevRevenue = baseRevenue
  let prevNWC = baseRevenue * assumptions.nwc_percent

  for (let i = 0; i < assumptions.projection_years; i++) {
    const revenue = prevRevenue * (1 + assumptions.revenue_growth[i])
    const ebitda = revenue * assumptions.ebitda_margin[i]
    const depreciation = revenue * assumptions.capex_percent
    const ebit = ebitda - depreciation
    const tax = ebit * assumptions.tax_rate
    const nopat = ebit - tax
    const capex = revenue * assumptions.capex_percent
    const nwc = revenue * assumptions.nwc_percent
    const nwcChange = nwc - prevNWC
    const fcf = nopat + depreciation - capex - nwcChange
    const discountFactor = Math.pow(1 + wacc, i + 1)
    const pv = fcf / discountFactor

    projections.push({
      year: i + 1,
      revenue,
      ebitda,
      ebit,
      nopat,
      capex,
      nwc_change: nwcChange,
      free_cash_flow: fcf,
      discount_factor: discountFactor,
      present_value: pv,
    })

    prevRevenue = revenue
    prevNWC = nwc
  }

  return projections
}

export function calculateTerminalValue(
  finalFCF: number,
  terminalGrowth: number,
  wacc: number,
): number {
  const terminalFCF = finalFCF * (1 + terminalGrowth)
  return terminalFCF / (wacc - terminalGrowth)
}

export function runDCF(
  companyName: string,
  baseRevenue: number,
  assumptions: DCFAssumptions,
  netDebt: number,
  cash: number,
  sharesOutstanding: number,
): DCFResult {
  const wacc = calculateWACC(
    assumptions.risk_free_rate,
    assumptions.beta,
    assumptions.equity_risk_premium,
    assumptions.cost_of_debt,
    assumptions.debt_to_equity,
    assumptions.tax_rate,
  )

  const projections = projectCashFlows(baseRevenue, assumptions, wacc)

  const pvFCF = projections.reduce((sum, p) => sum + p.present_value, 0)

  const finalFCF = projections[projections.length - 1].free_cash_flow
  const terminalValue = calculateTerminalValue(finalFCF, assumptions.terminal_growth_rate, wacc)
  const pvTerminal = terminalValue / Math.pow(1 + wacc, assumptions.projection_years)

  const enterpriseValue = pvFCF + pvTerminal
  const equityValue = enterpriseValue - netDebt + cash
  const perShareValue = sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0

  // Sensitivity table: WACC vs Terminal Growth
  const waccRange = [wacc - 0.02, wacc - 0.01, wacc, wacc + 0.01, wacc + 0.02]
  const growthRange = [
    assumptions.terminal_growth_rate - 0.01,
    assumptions.terminal_growth_rate - 0.005,
    assumptions.terminal_growth_rate,
    assumptions.terminal_growth_rate + 0.005,
    assumptions.terminal_growth_rate + 0.01,
  ]

  const sensitivityValues: number[][] = waccRange.map((w) =>
    growthRange.map((g) => {
      const projs = projectCashFlows(baseRevenue, assumptions, w)
      const pvF = projs.reduce((s, p) => s + (p.free_cash_flow / Math.pow(1 + w, p.year)), 0)
      const tv = calculateTerminalValue(projs[projs.length - 1].free_cash_flow, g, w)
      const pvT = tv / Math.pow(1 + w, assumptions.projection_years)
      return pvF + pvT
    }),
  )

  return {
    company_name: companyName,
    assumptions,
    wacc,
    projections,
    terminal_value: terminalValue,
    pv_terminal: pvTerminal,
    pv_fcf: pvFCF,
    enterprise_value: enterpriseValue,
    net_debt: netDebt,
    cash,
    equity_value: equityValue,
    shares_outstanding: sharesOutstanding,
    per_share_value: perShareValue,
    sensitivity_table: {
      row_label: 'WACC',
      col_label: 'Wzrost terminalny',
      row_values: waccRange,
      col_values: growthRange,
      values: sensitivityValues,
    },
  }
}
