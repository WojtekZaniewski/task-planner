'use client'

import { useState } from 'react'
import type { FinancialStatements, IndustryType } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RatioInputFormProps {
  onSubmit: (data: FinancialStatements, industry: IndustryType) => void
}

const defaultData: FinancialStatements = {
  income_statement: {
    revenue: 1000000,
    cost_of_goods_sold: 600000,
    operating_income: 200000,
    ebit: 180000,
    ebitda: 250000,
    interest_expense: 20000,
    net_income: 120000,
  },
  balance_sheet: {
    total_assets: 2000000,
    current_assets: 800000,
    cash_and_equivalents: 200000,
    accounts_receivable: 150000,
    inventory: 250000,
    current_liabilities: 400000,
    total_debt: 500000,
    current_portion_long_term_debt: 50000,
    shareholders_equity: 1000000,
  },
  cash_flow: {
    operating_cash_flow: 180000,
    investing_cash_flow: -100000,
    financing_cash_flow: -50000,
  },
  market_data: {
    share_price: 50,
    shares_outstanding: 100000,
    earnings_growth_rate: 0.12,
  },
}

const industryOptions: { value: IndustryType; label: string }[] = [
  { value: 'technology', label: 'Technologia' },
  { value: 'retail', label: 'Handel detaliczny' },
  { value: 'financial', label: 'Finanse' },
  { value: 'manufacturing', label: 'Produkcja' },
  { value: 'healthcare', label: 'Ochrona zdrowia' },
]

export function RatioInputForm({ onSubmit }: RatioInputFormProps) {
  const [data, setData] = useState<FinancialStatements>(defaultData)
  const [industry, setIndustry] = useState<IndustryType>('technology')

  function updateField(
    section: keyof FinancialStatements,
    field: string,
    value: string,
  ) {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: parseFloat(value) || 0,
      },
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(data, industry)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="glow-card rounded-2xl border border-border/50 p-5 bg-card dark:glass-card">
        <Tabs defaultValue="income">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="income" className="text-xs">
              Rachunek zyskow
            </TabsTrigger>
            <TabsTrigger value="balance" className="text-xs">
              Bilans
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="text-xs">
              Przeplywy
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs">
              Dane rynkowe
            </TabsTrigger>
          </TabsList>

          {/* Rachunek zyskow i strat */}
          <TabsContent value="income" className="space-y-3 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="revenue">Przychody</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={data.income_statement.revenue}
                  onChange={(e) =>
                    updateField('income_statement', 'revenue', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cogs">Koszt sprzedanych towarow</Label>
                <Input
                  id="cogs"
                  type="number"
                  value={data.income_statement.cost_of_goods_sold}
                  onChange={(e) =>
                    updateField(
                      'income_statement',
                      'cost_of_goods_sold',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="operating_income">Zysk operacyjny</Label>
                <Input
                  id="operating_income"
                  type="number"
                  value={data.income_statement.operating_income}
                  onChange={(e) =>
                    updateField(
                      'income_statement',
                      'operating_income',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ebit">EBIT</Label>
                <Input
                  id="ebit"
                  type="number"
                  value={data.income_statement.ebit}
                  onChange={(e) =>
                    updateField('income_statement', 'ebit', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ebitda">EBITDA</Label>
                <Input
                  id="ebitda"
                  type="number"
                  value={data.income_statement.ebitda}
                  onChange={(e) =>
                    updateField('income_statement', 'ebitda', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="interest_expense">Koszty odsetkowe</Label>
                <Input
                  id="interest_expense"
                  type="number"
                  value={data.income_statement.interest_expense}
                  onChange={(e) =>
                    updateField(
                      'income_statement',
                      'interest_expense',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="net_income">Zysk netto</Label>
                <Input
                  id="net_income"
                  type="number"
                  value={data.income_statement.net_income}
                  onChange={(e) =>
                    updateField(
                      'income_statement',
                      'net_income',
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Bilans */}
          <TabsContent value="balance" className="space-y-3 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="total_assets">Aktywa ogolem</Label>
                <Input
                  id="total_assets"
                  type="number"
                  value={data.balance_sheet.total_assets}
                  onChange={(e) =>
                    updateField(
                      'balance_sheet',
                      'total_assets',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="current_assets">Aktywa obrotowe</Label>
                <Input
                  id="current_assets"
                  type="number"
                  value={data.balance_sheet.current_assets}
                  onChange={(e) =>
                    updateField(
                      'balance_sheet',
                      'current_assets',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cash">Srodki pieniezne</Label>
                <Input
                  id="cash"
                  type="number"
                  value={data.balance_sheet.cash_and_equivalents}
                  onChange={(e) =>
                    updateField(
                      'balance_sheet',
                      'cash_and_equivalents',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="receivables">Naleznosci</Label>
                <Input
                  id="receivables"
                  type="number"
                  value={data.balance_sheet.accounts_receivable}
                  onChange={(e) =>
                    updateField(
                      'balance_sheet',
                      'accounts_receivable',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inventory">Zapasy</Label>
                <Input
                  id="inventory"
                  type="number"
                  value={data.balance_sheet.inventory}
                  onChange={(e) =>
                    updateField('balance_sheet', 'inventory', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="current_liabilities">
                  Zobowiazania krotkoterminowe
                </Label>
                <Input
                  id="current_liabilities"
                  type="number"
                  value={data.balance_sheet.current_liabilities}
                  onChange={(e) =>
                    updateField(
                      'balance_sheet',
                      'current_liabilities',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="total_debt">Zadluzenie ogolem</Label>
                <Input
                  id="total_debt"
                  type="number"
                  value={data.balance_sheet.total_debt}
                  onChange={(e) =>
                    updateField('balance_sheet', 'total_debt', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="current_ltd">
                  Biez. czesc dlugu dlugoterm.
                </Label>
                <Input
                  id="current_ltd"
                  type="number"
                  value={data.balance_sheet.current_portion_long_term_debt}
                  onChange={(e) =>
                    updateField(
                      'balance_sheet',
                      'current_portion_long_term_debt',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="equity">Kapital wlasny</Label>
                <Input
                  id="equity"
                  type="number"
                  value={data.balance_sheet.shareholders_equity}
                  onChange={(e) =>
                    updateField(
                      'balance_sheet',
                      'shareholders_equity',
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Przeplywy pieniezne */}
          <TabsContent value="cashflow" className="space-y-3 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ocf">Przeplywy operacyjne</Label>
                <Input
                  id="ocf"
                  type="number"
                  value={data.cash_flow.operating_cash_flow}
                  onChange={(e) =>
                    updateField(
                      'cash_flow',
                      'operating_cash_flow',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="icf">Przeplywy inwestycyjne</Label>
                <Input
                  id="icf"
                  type="number"
                  value={data.cash_flow.investing_cash_flow}
                  onChange={(e) =>
                    updateField(
                      'cash_flow',
                      'investing_cash_flow',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fcf">Przeplywy finansowe</Label>
                <Input
                  id="fcf"
                  type="number"
                  value={data.cash_flow.financing_cash_flow}
                  onChange={(e) =>
                    updateField(
                      'cash_flow',
                      'financing_cash_flow',
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Dane rynkowe */}
          <TabsContent value="market" className="space-y-3 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="share_price">Cena akcji</Label>
                <Input
                  id="share_price"
                  type="number"
                  step="0.01"
                  value={data.market_data.share_price}
                  onChange={(e) =>
                    updateField('market_data', 'share_price', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shares_outstanding">Liczba akcji</Label>
                <Input
                  id="shares_outstanding"
                  type="number"
                  value={data.market_data.shares_outstanding}
                  onChange={(e) =>
                    updateField(
                      'market_data',
                      'shares_outstanding',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="earnings_growth_rate">
                  Tempo wzrostu zyskow
                </Label>
                <Input
                  id="earnings_growth_rate"
                  type="number"
                  step="0.01"
                  value={data.market_data.earnings_growth_rate}
                  onChange={(e) =>
                    updateField(
                      'market_data',
                      'earnings_growth_rate',
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Industry selector and submit */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="industry">Branza</Label>
          <Select
            value={industry}
            onValueChange={(v) => setIndustry(v as IndustryType)}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Wybierz branze" />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full sm:w-auto">
            Oblicz wskazniki
          </Button>
        </div>
      </div>
    </form>
  )
}
