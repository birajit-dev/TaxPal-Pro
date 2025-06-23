'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { api, Income, PaginatedResponse } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)

  // Form state with validation
  const [formData, setFormData] = useState({
    source: '',
    description: '',
    amount: '',
    category: '',
    platform: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  const categories = [
    'freelance',
    'consulting', 
    'products',
    'services',
    'royalties',
    'investment',
    'rental',
    'commission',
    'bonus',
    'other'
  ]

  const platforms = [
    'upwork',
    'fiverr', 
    'freelancer',
    'stripe',
    'paypal',
    'bank-transfer',
    'check',
    'cash',
    'venmo',
    'square',
    'other'
  ]

  useEffect(() => {
    loadIncome()
  }, [currentPage, searchTerm, categoryFilter])

  const loadIncome = async () => {
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

      const response = await api.getIncome(params)
      
      if (response.success && response.data) {
        setIncome(response.data.entries)
        setTotalPages(response.data.pagination.pages)
        setTotalEntries(response.data.pagination.total)
        
        // Calculate total income for current filter
        const total = response.data.entries.reduce((sum, entry) => sum + entry.amount, 0)
        setTotalIncome(total)
      } else {
        throw new Error(response.message || 'Failed to load income')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load income data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    if (!formData.source.trim()) errors.source = 'Income source is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valid amount is required'
    if (!formData.category) errors.category = 'Category is required'
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

      const incomeData = {
        source: formData.source.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        platform: formData.platform || undefined,
        date: formData.date
      }

      if (editingIncome) {
        const response = await api.updateIncome(editingIncome._id, incomeData)
        if (!response.success) throw new Error(response.message || 'Failed to update income')
        setSuccess('Income updated successfully!')
      } else {
        const response = await api.createIncome(incomeData)
        if (!response.success) throw new Error(response.message || 'Failed to create income')
        setSuccess('Income added successfully!')
      }

      // Reset form and close dialog
      resetForm()
      setIsDialogOpen(false)
      setEditingIncome(null)
      loadIncome()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to save income')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (incomeItem: Income) => {
    setEditingIncome(incomeItem)
    setFormData({
      source: incomeItem.source,
      description: incomeItem.description,
      amount: incomeItem.amount.toString(),
      category: incomeItem.category,
      platform: incomeItem.platform || '',
      date: incomeItem.date.split('T')[0]
    })
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income entry? This action cannot be undone.')) return

    try {
      const response = await api.deleteIncome(id)
      if (!response.success) throw new Error(response.message || 'Failed to delete income')
      
      setSuccess('Income deleted successfully!')
      loadIncome()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete income')
    }
  }

  const resetForm = () => {
    setFormData({
      source: '',
      description: '',
      amount: '',
      category: '',
      platform: '',
      date: new Date().toISOString().split('T')[0]
    })
    setFormErrors({})
  }

  const openNewIncomeDialog = () => {
    setEditingIncome(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track and manage all your income sources
              </p>
            </div>
            <Button onClick={openNewIncomeDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Income
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
                {formatCurrency(totalEntries > 0 ? totalIncome / totalEntries : 0)}
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
                    placeholder="Search income sources..."
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
                    <SelectItem key={category} value={category}>
                      {formatCategoryName(category)}
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

        {/* Income Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading income...</span>
              </div>
            ) : income.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No income entries</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first income entry.</p>
                <div className="mt-6">
                  <Button onClick={openNewIncomeDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Income
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source & Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {income.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.source}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(item.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formatCategoryName(item.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.platform ? formatCategoryName(item.platform) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
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

        {/* Add/Edit Income Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? 'Edit Income Entry' : 'Add New Income Entry'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">Income Source *</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder="e.g., ABC Company, Client Name"
                  className={formErrors.source ? 'border-red-500' : ''}
                />
                {formErrors.source && <p className="text-sm text-red-500">{formErrors.source}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g., Website development, Consulting services"
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
                        <SelectItem key={category} value={category}>
                          {formatCategoryName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value) => setFormData({...formData, platform: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {formatCategoryName(platform)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {editingIncome ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingIncome ? 'Update Income' : 'Add Income'
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