'use client'

import { useState } from 'react'
import type { DCFAssumptions } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface DCFAssumptionsFormProps {
  onSubmit: (
    companyName: string,
    baseRevenue: number,
    assumptions: DCFAssumptions,
    netDebt: number,
    cash: number,
    sharesOutstanding: number,
  ) => void
}

export function DCFAssumptionsForm({ onSubmit }: DCFAssumptionsFormProps) {
  // Base data
  const [companyName, setCompanyName] = useState('Spolka ABC')
  const [baseRevenue, setBaseRevenue] = useState('1000000')
  const [netDebt, setNetDebt] = useState('200000')
  const [cash, setCash] = useState('50000')
  const [sharesOutstanding, setSharesOutstanding] = useState('100000')

  // Projection assumptions
  const [projectionYears, setProjectionYears] = useState('5')
  const [revenueGrowth, setRevenueGrowth] = useState('10,10,8,8,6')
  const [ebitdaMargins, setEbitdaMargins] = useState('22,22,22,22,22')
  const [taxRate, setTaxRate] = useState('25')
  const [capexPercent, setCapexPercent] = useState('5')
  const [nwcPercent, setNwcPercent] = useState('10')
  const [terminalGrowth, setTerminalGrowth] = useState('3')

  // WACC parameters
  const [riskFreeRate, setRiskFreeRate] = useState('4')
  const [equityRiskPremium, setEquityRiskPremium] = useState('7')
  const [beta, setBeta] = useState('1.2')
  const [costOfDebt, setCostOfDebt] = useState('5')
  const [debtToEquity, setDebtToEquity] = useState('0.5')

  function parseCommaSeparated(value: string): number[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map((s) => parseFloat(s) / 100)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const years = parseInt(projectionYears, 10)
    const growthRates = parseCommaSeparated(revenueGrowth)
    const margins = parseCommaSeparated(ebitdaMargins)

    const assumptions: DCFAssumptions = {
      projection_years: years,
      revenue_growth: growthRates,
      ebitda_margin: margins,
      tax_rate: parseFloat(taxRate) / 100,
      capex_percent: parseFloat(capexPercent) / 100,
      nwc_percent: parseFloat(nwcPercent) / 100,
      risk_free_rate: parseFloat(riskFreeRate) / 100,
      equity_risk_premium: parseFloat(equityRiskPremium) / 100,
      beta: parseFloat(beta),
      cost_of_debt: parseFloat(costOfDebt) / 100,
      debt_to_equity: parseFloat(debtToEquity),
      terminal_growth_rate: parseFloat(terminalGrowth) / 100,
    }

    onSubmit(
      companyName,
      parseFloat(baseRevenue),
      assumptions,
      parseFloat(netDebt),
      parseFloat(cash),
      parseFloat(sharesOutstanding),
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Dane bazowe */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Dane bazowe</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="companyName">Nazwa spolki</Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="np. Spolka ABC"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseRevenue">Przychody bazowe ($)</Label>
            <Input
              id="baseRevenue"
              type="number"
              value={baseRevenue}
              onChange={(e) => setBaseRevenue(e.target.value)}
              placeholder="1000000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="netDebt">Dlug netto ($)</Label>
            <Input
              id="netDebt"
              type="number"
              value={netDebt}
              onChange={(e) => setNetDebt(e.target.value)}
              placeholder="200000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cash">Gotowka ($)</Label>
            <Input
              id="cash"
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="50000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sharesOutstanding">Liczba akcji</Label>
            <Input
              id="sharesOutstanding"
              type="number"
              value={sharesOutstanding}
              onChange={(e) => setSharesOutstanding(e.target.value)}
              placeholder="100000"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Zalozenia projekcji */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Zalozenia projekcji</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectionYears">Lata projekcji</Label>
            <Input
              id="projectionYears"
              type="number"
              value={projectionYears}
              onChange={(e) => setProjectionYears(e.target.value)}
              placeholder="5"
              min={1}
              max={20}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="revenueGrowth">Wzrost przychodow (%, po przecinku na rok)</Label>
            <Input
              id="revenueGrowth"
              type="text"
              value={revenueGrowth}
              onChange={(e) => setRevenueGrowth(e.target.value)}
              placeholder="10,10,8,8,6"
            />
            <p className="text-xs text-muted-foreground">
              Wprowadz wartosci procentowe oddzielone przecinkami, np. &quot;10,10,8,8,6&quot;
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ebitdaMargins">Marza EBITDA (%, po przecinku na rok)</Label>
            <Input
              id="ebitdaMargins"
              type="text"
              value={ebitdaMargins}
              onChange={(e) => setEbitdaMargins(e.target.value)}
              placeholder="22,22,22,22,22"
            />
            <p className="text-xs text-muted-foreground">
              Wprowadz wartosci procentowe oddzielone przecinkami, np. &quot;22,22,22,22,22&quot;
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Stawka podatkowa (%)</Label>
            <Input
              id="taxRate"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="25"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capexPercent">CAPEX (% przychodow)</Label>
            <Input
              id="capexPercent"
              type="number"
              value={capexPercent}
              onChange={(e) => setCapexPercent(e.target.value)}
              placeholder="5"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nwcPercent">KON (% przychodow)</Label>
            <Input
              id="nwcPercent"
              type="number"
              value={nwcPercent}
              onChange={(e) => setNwcPercent(e.target.value)}
              placeholder="10"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terminalGrowth">Wzrost terminalny (%)</Label>
            <Input
              id="terminalGrowth"
              type="number"
              value={terminalGrowth}
              onChange={(e) => setTerminalGrowth(e.target.value)}
              placeholder="3"
              step="0.1"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Parametry WACC */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Parametry WACC</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="riskFreeRate">Stopa wolna od ryzyka (%)</Label>
            <Input
              id="riskFreeRate"
              type="number"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(e.target.value)}
              placeholder="4"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equityRiskPremium">Premia za ryzyko (%)</Label>
            <Input
              id="equityRiskPremium"
              type="number"
              value={equityRiskPremium}
              onChange={(e) => setEquityRiskPremium(e.target.value)}
              placeholder="7"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beta">Beta</Label>
            <Input
              id="beta"
              type="number"
              value={beta}
              onChange={(e) => setBeta(e.target.value)}
              placeholder="1.2"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costOfDebt">Koszt dlugu (%)</Label>
            <Input
              id="costOfDebt"
              type="number"
              value={costOfDebt}
              onChange={(e) => setCostOfDebt(e.target.value)}
              placeholder="5"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debtToEquity">Dlug / Kapital (D/E)</Label>
            <Input
              id="debtToEquity"
              type="number"
              value={debtToEquity}
              onChange={(e) => setDebtToEquity(e.target.value)}
              placeholder="0.5"
              step="0.01"
            />
          </div>
        </div>
      </section>

      <Button type="submit" className="w-full sm:w-auto" size="lg">
        Oblicz wycene
      </Button>
    </form>
  )
}
