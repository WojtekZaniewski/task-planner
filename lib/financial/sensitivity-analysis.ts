export interface SensitivityResult {
  rowLabel: string
  colLabel: string
  rowValues: number[]
  colValues: number[]
  values: number[][]
  baseValue: number
}

export function twoWaySensitivity(
  rowLabel: string,
  rowValues: number[],
  colLabel: string,
  colValues: number[],
  calcFn: (rowVal: number, colVal: number) => number,
  baseRowVal: number,
  baseColVal: number,
): SensitivityResult {
  const values = rowValues.map((rv) =>
    colValues.map((cv) => calcFn(rv, cv)),
  )

  return {
    rowLabel,
    colLabel,
    rowValues,
    colValues,
    values,
    baseValue: calcFn(baseRowVal, baseColVal),
  }
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}
