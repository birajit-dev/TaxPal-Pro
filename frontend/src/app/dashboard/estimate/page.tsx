'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calculator, TrendingUp, Calendar, DollarSign, AlertCircle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { api, TaxEstimate } from '@/lib/api'

export default function EstimatePage() {
  const [estimate, setEstimate] = useState<TaxEstimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // What-if scenario state
  const [scenario, setScenario] = useState({
    additionalIncome: '',
    additionalExpenses: '',
    filingStatus: 'single',
    dependents: 0
  })
  const [scenarioResult, setScenarioResult] = useState<TaxEstimate | null>(null)

  const availableYears = Array.from(
    { length: 3 }, 
    (_, i) => new Date().getFullYear() - i
  )

  useEffect(() => {
    fetchTaxEstimate()
  }, [selectedYear])

  const fetchTaxEstimate = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use our backend API to get tax estimate
      const response = await api.getTaxEstimate()
      
      if (response.success && response.data) {
        const estimateData: TaxEstimate = {
          currentYear: response.data.currentYear,
          totalIncome: response.data.totalIncome,
          totalExpenses: response.data.totalExpenses,
          deductibleExpenses: response.data.deductibleExpenses,
          taxableIncome: response.data.taxableIncome,
          federalTax: response.data.federalTax,
          selfEmploymentTax: response.data.selfEmploymentTax,
          totalTax: response.data.totalTax,
          quarterlyPayment: response.data.quarterlyPayment,
          effectiveRate: response.data.effectiveRate,
          marginalRate: response.data.marginalRate,
          recommendations: response.data.recommendations
        }
        setEstimate(estimateData)
      } else {
        throw new Error('Failed to get tax estimate')
      }
    } catch (error: any) {
      console.error('Error fetching tax estimate:', error)
      setError(error.message || 'Failed to calculate tax estimate')
    } finally {
      setLoading(false)
    }
  }

  const getMarginalRate = (taxableIncome: number): number => {
    if (taxableIncome <= 11000) return 10
    if (taxableIncome <= 44725) return 12
    if (taxableIncome <= 95375) return 22
    return 24
  }

  const generateRecommendations = (income: number, deductible: number, total: number, effectiveRate: number): string[] => {
    const recommendations = []

    if (deductible < income * 0.15) {
      recommendations.push("Consider tracking more business expenses - you may be missing deductions")
    }

    if (effectiveRate > 25) {
      recommendations.push("Your tax rate is high - consider maximizing retirement contributions")
    }

    if (total - deductible > income * 0.10) {
      recommendations.push("You have significant non-deductible expenses - review your business spending")
    }

    if (income > 50000 && deductible < 5000) {
      recommendations.push("With your income level, you should have more business deductions")
    }

    if (recommendations.length === 0) {
      recommendations.push("Your tax situation looks good! Keep tracking expenses consistently.")
    }

    return recommendations
  }

  const calculateScenario = async () => {
    if (!estimate) return

    setCalculating(true)
    try {
      const additionalIncome = parseFloat(scenario.additionalIncome) || 0
      const additionalExpenses = parseFloat(scenario.additionalExpenses) || 0

      // Use our backend API for scenario calculation
      const response = await api.calculateTaxScenario({
        additionalIncome,
        additionalExpenses,
        retirementContribution: 0
      })

             if (response.success && response.data) {
         // Convert the scenario data to match our TaxEstimate interface
         const scenarioData = response.data.scenario
         const scenarioEstimate: TaxEstimate = {
           currentYear: selectedYear,
           totalIncome: scenarioData.totalIncome,
           totalExpenses: estimate.totalExpenses,
           deductibleExpenses: scenarioData.deductibleExpenses,
           taxableIncome: scenarioData.taxableIncome,
           federalTax: 0, // Will be calculated in backend
           selfEmploymentTax: 0, // Will be calculated in backend
           totalTax: scenarioData.totalTax,
           quarterlyPayment: scenarioData.totalTax / 4,
           effectiveRate: scenarioData.effectiveRate,
           marginalRate: 0, // Will be calculated in backend
           recommendations: []
         }
         setScenarioResult(scenarioEstimate)
       } else {
         throw new Error('Failed to calculate scenario')
       }
    } catch (error: any) {
      console.error('Error calculating scenario:', error)
      setError(error.message || 'Failed to calculate scenario')
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculating your tax estimate...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTaxEstimate}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600 mb-4">Add income and expense entries to see tax estimates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Tax Estimation</h1>
          <p className="mt-2 text-sm text-gray-700">
            Real-time tax calculations and quarterly payment estimates.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estimate.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-blue-600" />
              Taxable Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(estimate.taxableIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              Total Tax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(estimate.totalTax)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estimate.effectiveRate.toFixed(1)}% effective rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-600" />
              Quarterly Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(estimate.quarterlyPayment)}
            </div>
            <p className="text-xs text-muted-foreground">
              Due every quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tax Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of your {estimate.currentYear} tax liability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Federal Income Tax</span>
              <span className="text-sm font-semibold">{formatCurrency(estimate.federalTax)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Self-Employment Tax</span>
              <span className="text-sm font-semibold">{formatCurrency(estimate.selfEmploymentTax)}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Tax Liability</span>
              <span className="font-bold text-lg">{formatCurrency(estimate.totalTax)}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Effective Tax Rate</span>
                <span className="font-semibold">{estimate.effectiveRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Marginal Tax Rate</span>
                <span className="font-semibold">{estimate.marginalRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deduction Summary</CardTitle>
            <CardDescription>
              Your deductible business expenses for {estimate.currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Expenses</span>
              <span className="text-sm font-semibold">{formatCurrency(estimate.totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tax Deductible</span>
              <span className="text-sm font-semibold text-green-600">{formatCurrency(estimate.deductibleExpenses)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tax Savings</span>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(estimate.deductibleExpenses * (estimate.marginalRate / 100))}
              </span>
            </div>
            <hr />
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                Your deductions are saving you approximately{' '}
                <strong>{formatCurrency(estimate.deductibleExpenses * (estimate.marginalRate / 100))}</strong>{' '}
                in taxes this year.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What-if Scenario */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>"What If" Tax Scenario</CardTitle>
            <CardDescription>
              See how additional income or expenses would affect your taxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Income
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={scenario.additionalIncome}
                  onChange={(e) => setScenario({ ...scenario, additionalIncome: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Deductible Expenses
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={scenario.additionalExpenses}
                  onChange={(e) => setScenario({ ...scenario, additionalExpenses: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={calculateScenario}
                  disabled={calculating}
                  className="w-full"
                >
                  {calculating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Calculate
                </Button>
              </div>
            </div>

            {scenarioResult && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Scenario Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">New Total Tax</div>
                    <div className="text-xl font-bold text-blue-900">
                      {formatCurrency(scenarioResult.totalTax)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {scenarioResult.totalTax > estimate.totalTax ? '+' : ''}
                      {formatCurrency(scenarioResult.totalTax - estimate.totalTax)} change
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">New Quarterly Payment</div>
                    <div className="text-xl font-bold text-orange-900">
                      {formatCurrency(scenarioResult.quarterlyPayment)}
                    </div>
                    <div className="text-sm text-orange-600">
                      {scenarioResult.quarterlyPayment > estimate.quarterlyPayment ? '+' : ''}
                      {formatCurrency(scenarioResult.quarterlyPayment - estimate.quarterlyPayment)} change
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">New Effective Rate</div>
                    <div className="text-xl font-bold text-purple-900">
                      {scenarioResult.effectiveRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-600">
                      {scenarioResult.effectiveRate > estimate.effectiveRate ? '+' : ''}
                      {(scenarioResult.effectiveRate - estimate.effectiveRate).toFixed(1)}% change
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tax Recommendations */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Tax Optimization Recommendations</CardTitle>
            <CardDescription>
              Personalized suggestions to minimize your tax liability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estimate.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 