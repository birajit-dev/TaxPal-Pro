import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function calculateTax(income: number, expenses: number): number {
  const standardDeduction = 13850
  const taxableIncome = Math.max(0, income - expenses - standardDeduction)
  const estimatedTax = taxableIncome * 0.153 // Self-employment tax + income tax estimate
  return estimatedTax
}

export function calculateQuarterlyTax(annualTax: number): number {
  return annualTax / 4
}

export function getNextTaxDeadlines(): Array<{ date: Date; type: string }> {
  const currentYear = new Date().getFullYear()
  const deadlines = [
    { date: new Date(currentYear, 0, 15), type: 'Q4 Estimated Tax' },
    { date: new Date(currentYear, 3, 15), type: 'Annual Tax Return' },
    { date: new Date(currentYear, 5, 15), type: 'Q1 Estimated Tax' },
    { date: new Date(currentYear, 8, 15), type: 'Q2 Estimated Tax' },
    { date: new Date(currentYear + 1, 0, 15), type: 'Q3 Estimated Tax' },
  ]
  
  const now = new Date()
  return deadlines.filter(deadline => deadline.date > now).slice(0, 3)
}

export function categorizeExpense(description: string): string {
  const desc = description.toLowerCase()
  
  if (desc.includes('internet') || desc.includes('wifi') || desc.includes('phone')) {
    return 'Internet & Phone'
  }
  if (desc.includes('software') || desc.includes('app') || desc.includes('subscription')) {
    return 'Software & Tools'
  }
  if (desc.includes('travel') || desc.includes('flight') || desc.includes('hotel')) {
    return 'Travel'
  }
  if (desc.includes('office') || desc.includes('desk') || desc.includes('chair')) {
    return 'Office Supplies'
  }
  if (desc.includes('meal') || desc.includes('lunch') || desc.includes('dinner')) {
    return 'Meals & Entertainment'
  }
  if (desc.includes('car') || desc.includes('gas') || desc.includes('uber')) {
    return 'Transportation'
  }
  if (desc.includes('home') || desc.includes('rent') || desc.includes('utilities')) {
    return 'Home Office'
  }
  
  return 'Other'
}

export function calculateTaxScore(
  incomeEntries: number,
  expenseEntries: number,
  totalIncome: number,
  totalExpenses: number
): number {
  let score = 0
  
  // Income tracking completeness (30 points)
  if (incomeEntries > 0) score += 30
  
  // Expense tracking (40 points)
  if (expenseEntries > 0) score += 20
  if (expenseEntries > 10) score += 20
  
  // Deduction ratio (30 points)
  if (totalIncome > 0) {
    const deductionRatio = totalExpenses / totalIncome
    if (deductionRatio > 0.1) score += 15
    if (deductionRatio > 0.2) score += 15
  }
  
  return Math.min(100, score)
} 