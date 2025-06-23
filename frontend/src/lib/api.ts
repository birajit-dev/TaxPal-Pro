interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface PaginatedResponse<T> {
  entries: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  summary?: any
}

interface User {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: string
  subscription: {
    plan: string
    status: string
  }
  taxScore?: number
  reminderOptIn?: boolean
  isPaid?: boolean
  joinedAt?: string
  lastLoginAt?: string
}

interface Income {
  _id: string
  userId: string
  source: string
  description: string
  amount: number
  category: string
  platform?: string
  date: string
  createdAt: string
  updatedAt: string
}

interface Expense {
  _id: string
  userId: string
  description: string
  amount: number
  category: string
  paymentMethod?: string
  receiptUrl?: string
  isRecurring: boolean
  isDeductible: boolean
  date: string
  createdAt: string
  updatedAt: string
}

interface DashboardOverview {
  totalIncome: number
  totalExpenses: number
  deductibleExpenses: number
  estimatedTax: number
  quarterlyTax: number
  incomeEntries: number
  expenseEntries: number
  deductionCoverage: number
  monthlyBreakdown: Array<{
    month: string
    income: number
    expenses: number
  }>
  year: number
}

interface TaxEstimate {
  currentYear: number
  totalIncome: number
  totalExpenses: number
  deductibleExpenses: number
  taxableIncome: number
  federalTax: number
  selfEmploymentTax: number
  totalTax: number
  effectiveRate: number
  marginalRate: number
  quarterlyPayment: number
  recommendations: string[]
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  // Auth endpoints
  async register(firstName: string, lastName: string, email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    })
    
    if (response.data?.token) {
      this.setToken(response.data.token)
    }
    
    return response
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response.data?.token) {
      this.setToken(response.data.token)
    }
    
    return response
  }

  async logout() {
    const response = await this.request('/auth/logout', { method: 'POST' })
    this.clearToken()
    return response
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me')
  }

  // Income endpoints
  async getIncome(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value.toString())
      })
    }
    
    return this.request<PaginatedResponse<Income>>(`/income?${query}`)
  }

  async createIncome(data: {
    source: string
    description: string
    amount: number
    category: string
    platform?: string
    date: string
  }) {
    return this.request<{ entry: Income }>('/income', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateIncome(id: string, data: Partial<Income>) {
    return this.request<{ entry: Income }>(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteIncome(id: string) {
    return this.request(`/income/${id}`, { method: 'DELETE' })
  }

  async getIncomeStats() {
    return this.request('/income/stats/summary')
  }

  // Expense endpoints
  async getExpenses(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    startDate?: string
    endDate?: string
    isDeductible?: boolean
    sortBy?: string
    sortOrder?: string
  }) {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, value.toString())
      })
    }
    
    return this.request<PaginatedResponse<Expense>>(`/expenses?${query}`)
  }

  async createExpense(data: {
    description: string
    amount: number
    category: string
    paymentMethod?: string
    isRecurring?: boolean
    isDeductible?: boolean
    date: string
  }) {
    return this.request<{ entry: Expense; aiSuggestedCategory?: string }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExpense(id: string, data: Partial<Expense>) {
    return this.request<{ entry: Expense }>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, { method: 'DELETE' })
  }

  async getExpenseStats() {
    return this.request('/expenses/stats/summary')
  }

  // Dashboard endpoints
  async getDashboardOverview() {
    return this.request<DashboardOverview>('/dashboard/overview')
  }

  async getDashboardTrends(period: '30days' | '6months' | '12months' = '12months') {
    return this.request(`/dashboard/trends?period=${period}`)
  }

  async getDashboardCategories() {
    return this.request('/dashboard/categories')
  }

  // Tax endpoints
  async getTaxEstimate() {
    return this.request<TaxEstimate>('/tax/estimate')
  }

  async calculateTaxScenario(data: {
    additionalIncome?: number
    additionalExpenses?: number
    retirementContribution?: number
  }) {
    return this.request<{
      current: {
        totalIncome: number
        deductibleExpenses: number
        taxableIncome: number
        totalTax: number
        effectiveRate: number
      }
      scenario: {
        totalIncome: number
        deductibleExpenses: number
        taxableIncome: number
        totalTax: number
        effectiveRate: number
      }
      difference: {
        income: number
        expenses: number
        retirementContribution: number
        taxSavings: number
        netImpact: number
      }
    }>('/tax/scenario', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTaxDeadlines() {
    return this.request('/tax/deadlines')
  }

  async getQuarterlySchedule() {
    return this.request('/tax/quarterly')
  }

  // Reports endpoints
  async generateAnnualReport(year?: number) {
    return this.request<{
      year: number
      generatedAt: string
      summary: {
        totalIncome: number
        totalExpenses: number
        deductibleExpenses: number
        taxableIncome: number
        estimatedTax: number
        netIncome: number
        effectiveRate: number
      }
      breakdown: {
        incomeByCategory: Array<{
          category: string
          amount: number
          count: number
          percentage: number
        }>
        expensesByCategory: Array<{
          category: string
          amount: number
          count: number
          deductibleAmount: number
          percentage: number
          deductible: boolean
        }>
        monthlyBreakdown: Array<{
          month: string
          monthNumber: number
          income: number
          expenses: number
          netIncome: number
        }>
      }
      tax: {
        quarterlyPayments: Array<{
          quarter: string
          period: string
          dueDate: string
          amount: number
          paid: boolean
        }>
        deadlines: Array<{
          description: string
          date: string
        }>
      }
      details: {
        incomeEntries: number
        expenseEntries: number
        avgMonthlyIncome: number
        avgMonthlyExpenses: number
      }
    }>(`/reports/annual${year ? `?year=${year}` : ''}`)
  }

  async getReportSummary() {
    return this.request('/reports/summary')
  }

  async exportData(format: 'json' | 'csv' = 'json') {
    return this.request(`/reports/export?format=${format}`)
  }
}

export const api = new ApiClient()
export type { User, Income, Expense, DashboardOverview, TaxEstimate, ApiResponse, PaginatedResponse } 