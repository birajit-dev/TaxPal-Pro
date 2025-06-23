'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api, DashboardOverview } from '@/lib/api'
import { 
  DollarSign, 
  Receipt, 
  Calculator, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Target,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  CreditCard,
  Zap,
  Users,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, BarChart, Bar } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.getDashboardOverview()
      if (response.success && response.data) {
        setOverview(response.data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={loadDashboardData}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500 mb-6">Start by adding some income and expenses to see your dashboard.</p>
          <div className="flex justify-center space-x-3">
            <Link href="/dashboard/income">
              <Button variant="outline">Add Income</Button>
            </Link>
            <Link href="/dashboard/expenses">
              <Button>Add Expense</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const netIncome = overview.totalIncome - overview.totalExpenses
  const effectiveTaxRate = overview.totalIncome > 0 ? (overview.estimatedTax / overview.totalIncome) * 100 : 0
  const savingsRate = overview.totalIncome > 0 ? ((overview.totalIncome - overview.totalExpenses - overview.estimatedTax) / overview.totalIncome) * 100 : 0

  // Prepare chart data
  const monthlyChartData = overview.monthlyBreakdown.map(item => ({
    ...item,
    netIncome: item.income - item.expenses
  }))

  const financialPieData = [
    { name: 'Income', value: overview.totalIncome, color: '#10B981' },
    { name: 'Expenses', value: overview.totalExpenses, color: '#EF4444' },
    { name: 'Estimated Tax', value: overview.estimatedTax, color: '#F59E0B' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Your comprehensive tax and financial overview for {overview.year}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/income">
                <Button variant="outline" className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Income
                </Button>
              </Link>
              <Link href="/dashboard/expenses">
                <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(overview.totalIncome)}
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-gray-600">
                  {overview.incomeEntries} entries
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
              <div className="p-2 bg-red-100 rounded-full">
                <Receipt className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(overview.totalExpenses)}
              </div>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-xs text-gray-600">
                  {overview.expenseEntries} entries
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Estimated Tax</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <Calculator className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(overview.estimatedTax)}
              </div>
              <div className="flex items-center mt-2">
                <Target className="h-4 w-4 text-orange-500 mr-1" />
                <p className="text-xs text-gray-600">
                  {formatPercent(effectiveTaxRate)} rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Net Income</CardTitle>
              <div className={`p-2 rounded-full ${netIncome >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-4 w-4 ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome)}
              </div>
              <div className="flex items-center mt-2">
                <Activity className="h-4 w-4 text-gray-500 mr-1" />
                <p className="text-xs text-gray-600">
                  After expenses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Monthly Trends</CardTitle>
              <CardDescription>Income vs Expenses throughout the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={formatCompactNumber} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelStyle={{ color: '#666' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netIncome" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                      name="Net Income"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Financial Breakdown */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Financial Breakdown</CardTitle>
              <CardDescription>Distribution of your finances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={financialPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {financialPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                {financialPieData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Deduction Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPercent(overview.deductionCoverage)}
                  </div>
                  <p className="text-sm text-gray-600">of income covered</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(overview.deductionCoverage, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Quarterly Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(overview.quarterlyTax)}
                  </div>
                  <p className="text-sm text-gray-600">per quarter</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Savings Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(savingsRate)}
                  </div>
                  <p className="text-sm text-gray-600">after tax & expenses</p>
                </div>
                <div className={`p-3 rounded-full ${savingsRate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Zap className={`h-6 w-6 ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Manage your finances efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/income">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                  <Plus className="h-5 w-5 mb-1" />
                  <span className="text-sm">Add Income</span>
                </Button>
              </Link>
              <Link href="/dashboard/expenses">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                  <Receipt className="h-5 w-5 mb-1" />
                  <span className="text-sm">Add Expense</span>
                </Button>
              </Link>
              <Link href="/dashboard/estimate">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                  <Calculator className="h-5 w-5 mb-1" />
                  <span className="text-sm">Tax Estimate</span>
                </Button>
              </Link>
              <Link href="/dashboard/report">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-sm">Generate Report</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 