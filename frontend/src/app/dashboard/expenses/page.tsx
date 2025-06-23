'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Receipt, 
  DollarSign, 
  TrendingDown, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'

interface ExpenseEntry {
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

export default function ExpensesPage() {
  const [entries, setEntries] = useState<ExpenseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ExpenseEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)

  // Form state with validation
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    paymentMethod: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    isDeductible: true
  })

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  const categories = [
    { value: 'office-supplies', label: 'Office Supplies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'software', label: 'Software & Subscriptions' },
    { value: 'travel', label: 'Travel & Transportation' },
    { value: 'meals', label: 'Meals & Entertainment' },
    { value: 'marketing', label: 'Marketing & Advertising' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent & Office Space' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'professional-services', label: 'Professional Services' },
    { value: 'education', label: 'Education & Training' },
    { value: 'taxes', label: 'Taxes & Fees' },
    { value: 'other', label: 'Other Business Expenses' }
  ]

  const paymentMethods = [
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'debit-card', label: 'Debit Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'business-account', label: 'Business Account' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    loadExpenses()
  }, [currentPage, searchTerm, categoryFilter])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: currentPage,
        limit: 10,
        sortBy: 'date',
        sortOrder: 'desc'
      }

      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (categoryFilter) params.category = categoryFilter

      const response = await api.getExpenses(params)
      
      if (response.success && response.data) {
        setEntries(response.data.entries)
        setTotalPages(response.data.pagination?.pages || 1)
        setTotalEntries(response.data.pagination?.total || response.data.entries.length)
        
        // Calculate total expenses for current filter
        const total = response.data.entries.reduce((sum, entry) => sum + entry.amount, 0)
        setTotalExpenses(total)
      } else {
        throw new Error(response.message || 'Failed to load expenses')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load expense data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valid amount is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required'
    if (!formData.date) errors.date = 'Date is required'

    // Validate amount is a valid number
    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      errors.amount = 'Amount must be a valid number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      const expenseData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        isRecurring: formData.isRecurring,
        isDeductible: formData.isDeductible
      }

      if (editingEntry) {
        const response = await api.updateExpense(editingEntry._id, expenseData)
        if (!response.success) throw new Error(response.message || 'Failed to update expense')
        setSuccess('Expense updated successfully!')
      } else {
        const response = await api.createExpense(expenseData)
        if (!response.success) throw new Error(response.message || 'Failed to create expense')
        setSuccess('Expense added successfully!')
      }

      // Reset form and close dialog
      resetForm()
      setIsDialogOpen(false)
      setEditingEntry(null)
      loadExpenses()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to save expense')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (entry: ExpenseEntry) => {
    setEditingEntry(entry)
    setFormData({
      description: entry.description,
      amount: entry.amount.toString(),
      category: entry.category,
      paymentMethod: entry.paymentMethod || '',
      date: entry.date.split('T')[0],
      isRecurring: entry.isRecurring,
      isDeductible: entry.isDeductible
    })
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) return

    try {
      const response = await api.deleteExpense(id)
      if (!response.success) throw new Error(response.message || 'Failed to delete expense')
      
      setSuccess('Expense deleted successfully!')
      loadExpenses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense')
    }
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      paymentMethod: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      isDeductible: true
    })
    setFormErrors({})
  }

  const openNewExpenseDialog = () => {
    setEditingEntry(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const getCategoryLabel = (value: string) => {
    const category = categories.find(cat => cat.value === value)
    return category ? category.label : value
  }

  const getPaymentMethodLabel = (value: string) => {
    const method = paymentMethods.find(pm => pm.value === value)
    return method ? method.label : value
  }

  const deductibleExpenses = entries.filter(entry => entry.isDeductible).reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track and manage all your business expenses
              </p>
            </div>
            <Button onClick={openNewExpenseDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Deductible</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(deductibleExpenses)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalEntries > 0 ? totalExpenses / totalEntries : 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchTerm || categoryFilter) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading expenses...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No expense entries</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first expense entry.</p>
                <div className="mt-6">
                  <Button onClick={openNewExpenseDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{entry.description}</div>
                          {entry.isRecurring && (
                            <div className="text-xs text-blue-600 mt-1">Recurring expense</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrency(entry.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getCategoryLabel(entry.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.paymentMethod ? getPaymentMethodLabel(entry.paymentMethod) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.isDeductible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.isDeductible ? 'Deductible' : 'Non-deductible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(entry._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Add/Edit Expense Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Expense Entry' : 'Add New Expense Entry'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g., Office supplies, Software subscription"
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    className={formErrors.amount ? 'border-red-500' : ''}
                  />
                  {formErrors.amount && <p className="text-sm text-red-500">{formErrors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className={formErrors.date ? 'border-red-500' : ''}
                  />
                  {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                  >
                    <SelectTrigger className={formErrors.paymentMethod ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.paymentMethod && <p className="text-sm text-red-500">{formErrors.paymentMethod}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDeductible"
                    checked={formData.isDeductible}
                    onChange={(e) => setFormData({...formData, isDeductible: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isDeductible">Tax deductible</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isRecurring">Recurring expense</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingEntry ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingEntry ? 'Update Expense' : 'Add Expense'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 