'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Download, FileText, Calendar, Filter, AlertCircle, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'

interface TaxReportData {
  year: number
  totalIncome: number
  totalExpenses: number
  taxableIncome: number
  estimatedTax: number
  quarterlyPayments: Array<{
    quarter: string
    dueDate: string
    amount: number
    paid: boolean
  }>
  incomeByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  expensesByCategory: Array<{
    category: string
    amount: number
    percentage: number
    deductible: boolean
  }>
  monthlyBreakdown: Array<{
    month: string
    income: number
    expenses: number
    netIncome: number
  }>
}

export default function ReportPage() {
  const [reportData, setReportData] = useState<TaxReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [reportType, setReportType] = useState('annual')

  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - i
  )

  useEffect(() => {
    fetchReportData()
  }, [selectedYear])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use our backend API to get annual report
      const response = await api.generateAnnualReport(selectedYear)
      
      if (response.success && response.data) {
        const reportData = response.data
        
        const report: TaxReportData = {
          year: reportData.year,
          totalIncome: reportData.summary.totalIncome,
          totalExpenses: reportData.summary.totalExpenses,
          taxableIncome: reportData.summary.taxableIncome,
          estimatedTax: reportData.summary.estimatedTax,
          quarterlyPayments: reportData.tax.quarterlyPayments,
          incomeByCategory: reportData.breakdown.incomeByCategory,
          expensesByCategory: reportData.breakdown.expensesByCategory,
          monthlyBreakdown: reportData.breakdown.monthlyBreakdown
        }
        
        setReportData(report)
             } else {
         throw new Error('Failed to generate report')
       }
    } catch (error: any) {
      console.error('Error fetching report data:', error)
      setError(error.message || 'Failed to generate tax report')
    } finally {
      setLoading(false)
    }
  }

  const generatePDFReport = async () => {
    if (!reportData) return

    setGenerating(true)
    try {
      // In a real implementation, you would use a PDF generation library
      // For now, we'll create a simple text-based report
      const reportContent = `
TAX REPORT ${reportData.year}
=======================

SUMMARY
-------
Total Income: ${formatCurrency(reportData.totalIncome)}
Total Expenses: ${formatCurrency(reportData.totalExpenses)}
Taxable Income: ${formatCurrency(reportData.taxableIncome)}
Estimated Tax: ${formatCurrency(reportData.estimatedTax)}

INCOME BY CATEGORY
------------------
${reportData.incomeByCategory.map(item => 
  `${item.category.toUpperCase().replace('-', ' ')}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`
).join('\n')}

EXPENSES BY CATEGORY
--------------------
${reportData.expensesByCategory.map(item => 
  `${item.category.toUpperCase().replace('-', ' ')}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%) ${item.deductible ? '✓ Deductible' : ''}`
).join('\n')}

QUARTERLY PAYMENTS
------------------
${reportData.quarterlyPayments.map(payment => 
  `${payment.quarter} (Due: ${payment.dueDate}): ${formatCurrency(payment.amount)}`
).join('\n')}

MONTHLY BREAKDOWN
-----------------
${reportData.monthlyBreakdown.map(month => 
  `${month.month}: Income ${formatCurrency(month.income)}, Expenses ${formatCurrency(month.expenses)}, Net ${formatCurrency(month.netIncome)}`
).join('\n')}
      `

      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tax-report-${reportData.year}.txt`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      setError('Failed to generate PDF report')
    } finally {
      setGenerating(false)
    }
  }

  const emailReport = async () => {
    setError('Email functionality will be available soon')
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your tax report...</p>
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
          <Button onClick={fetchReportData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600 mb-4">Add income and expense entries to generate reports</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Tax Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Generate comprehensive tax reports and summaries for your records.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Button 
              variant="outline" 
              onClick={emailReport}
              disabled={generating}
            >
              Email Report
            </Button>
            <Button 
              onClick={generatePDFReport}
              disabled={generating}
            >
              {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(reportData.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(reportData.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxable Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(reportData.taxableIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimated Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(reportData.estimatedTax)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income and Expense Breakdown */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.incomeByCategory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No income data available</p>
            ) : (
              <div className="space-y-4">
                {reportData.incomeByCategory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {item.category.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.expensesByCategory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No expense data available</p>
            ) : (
              <div className="space-y-4">
                {reportData.expensesByCategory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 flex items-center">
                          {item.category.replace('-', ' ').toUpperCase()}
                          {item.deductible && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Deductible
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.deductible ? 'bg-green-600' : 'bg-red-600'}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Payments */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Tax Payments</CardTitle>
            <CardDescription>
              Estimated quarterly tax payments for {reportData.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportData.quarterlyPayments.map((payment, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900">{payment.quarter} {reportData.year}</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Due: {formatDate(new Date(payment.dueDate))}
                    </p>
                    <div className="mt-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.paid 
                          ? 'bg-green-100 text-green-800' 
                          : new Date(payment.dueDate) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.paid ? 'Paid' : new Date(payment.dueDate) < new Date() ? 'Overdue' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>
              Income and expenses by month for {reportData.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expenses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Income
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.monthlyBreakdown.map((month, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {formatCurrency(month.income)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(month.expenses)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        month.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(month.netIncome)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 