const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Generate annual tax report
// @route   GET /api/v1/reports/annual
// @access  Private
const generateAnnualReport = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { year } = req.query;
    const reportYear = year ? parseInt(year) : new Date().getFullYear();

    // Date range for the year
    const yearStart = new Date(reportYear, 0, 1);
    const yearEnd = new Date(reportYear, 11, 31, 23, 59, 59);

    // Get all income and expense data for the year
    const [incomeData, expenseData] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      }).sort({ date: 1 }),
      Expense.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      }).sort({ date: 1 })
    ]);

    // Calculate totals
    const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenseData.reduce((sum, entry) => sum + entry.amount, 0);
    const deductibleExpenses = expenseData
      .filter(entry => entry.isDeductible)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);

    // Basic tax calculation
    const selfEmploymentTax = totalIncome * 0.1413;
    const standardDeduction = 13850;
    const federalTaxableIncome = Math.max(0, taxableIncome - standardDeduction);
    const estimatedFederalTax = federalTaxableIncome * 0.22; // Simplified calculation
    const estimatedTax = selfEmploymentTax + estimatedFederalTax;

    // Group income by category
    const incomeByCategory = incomeData.reduce((acc, entry) => {
      const existing = acc.find(item => item.category === entry.category);
      if (existing) {
        existing.amount += entry.amount;
        existing.count += 1;
      } else {
        acc.push({
          category: entry.category,
          amount: entry.amount,
          count: 1,
          percentage: 0
        });
      }
      return acc;
    }, []);

    // Calculate percentages for income categories
    incomeByCategory.forEach(item => {
      item.percentage = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0;
    });

    // Group expenses by category
    const expensesByCategory = expenseData.reduce((acc, entry) => {
      const existing = acc.find(item => item.category === entry.category);
      if (existing) {
        existing.amount += entry.amount;
        existing.count += 1;
        if (entry.isDeductible) existing.deductibleAmount += entry.amount;
      } else {
        acc.push({
          category: entry.category,
          amount: entry.amount,
          count: 1,
          deductibleAmount: entry.isDeductible ? entry.amount : 0,
          percentage: 0,
          deductible: entry.isDeductible
        });
      }
      return acc;
    }, []);

    // Calculate percentages for expense categories
    expensesByCategory.forEach(item => {
      item.percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
    });

    // Monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(reportYear, month, 1);
      const monthEnd = new Date(reportYear, month + 1, 0, 23, 59, 59);
      
      const monthIncome = incomeData
        .filter(entry => entry.date >= monthStart && entry.date <= monthEnd)
        .reduce((sum, entry) => sum + entry.amount, 0);

      const monthExpenses = expenseData
        .filter(entry => entry.date >= monthStart && entry.date <= monthEnd)
        .reduce((sum, entry) => sum + entry.amount, 0);

      monthlyBreakdown.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        monthNumber: month + 1,
        income: monthIncome,
        expenses: monthExpenses,
        netIncome: monthIncome - monthExpenses
      });
    }

    // Quarterly payment schedule
    const quarterlyPayments = [
      {
        quarter: 'Q1',
        period: `Jan 1 - Mar 31, ${reportYear}`,
        dueDate: `${reportYear}-04-15`,
        amount: estimatedTax / 4,
        paid: false
      },
      {
        quarter: 'Q2',
        period: `Apr 1 - May 31, ${reportYear}`,
        dueDate: `${reportYear}-06-17`,
        amount: estimatedTax / 4,
        paid: false
      },
      {
        quarter: 'Q3',
        period: `Jun 1 - Aug 31, ${reportYear}`,
        dueDate: `${reportYear}-09-16`,
        amount: estimatedTax / 4,
        paid: false
      },
      {
        quarter: 'Q4',
        period: `Sep 1 - Dec 31, ${reportYear}`,
        dueDate: `${reportYear + 1}-01-15`,
        amount: estimatedTax / 4,
        paid: false
      }
    ];

    const report = {
      year: reportYear,
      generatedAt: new Date(),
      summary: {
        totalIncome,
        totalExpenses,
        deductibleExpenses,
        taxableIncome,
        estimatedTax,
        netIncome: totalIncome - totalExpenses,
        effectiveRate: totalIncome > 0 ? (estimatedTax / totalIncome) * 100 : 0
      },
      breakdown: {
        incomeByCategory: incomeByCategory.sort((a, b) => b.amount - a.amount),
        expensesByCategory: expensesByCategory.sort((a, b) => b.amount - a.amount),
        monthlyBreakdown
      },
      tax: {
        quarterlyPayments,
        deadlines: [
          { description: 'Q1 Quarterly Payment', date: `${reportYear}-04-15` },
          { description: 'Q2 Quarterly Payment', date: `${reportYear}-06-17` },
          { description: 'Q3 Quarterly Payment', date: `${reportYear}-09-16` },
          { description: 'Annual Tax Return', date: `${reportYear + 1}-04-15` },
          { description: 'Q4 Quarterly Payment', date: `${reportYear + 1}-01-15` }
        ]
      },
      details: {
        incomeEntries: incomeData.length,
        expenseEntries: expenseData.length,
        avgMonthlyIncome: totalIncome / 12,
        avgMonthlyExpenses: totalExpenses / 12
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get report summary
// @route   GET /api/v1/reports/summary
// @access  Private
const getReportSummary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const currentYear = new Date().getFullYear();

    // Get data for current and previous year
    const currentYearStart = new Date(currentYear, 0, 1);
    const currentYearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
    const prevYearStart = new Date(currentYear - 1, 0, 1);
    const prevYearEnd = new Date(currentYear - 1, 11, 31, 23, 59, 59);

    const [
      currentIncomeData,
      currentExpenseData,
      prevIncomeData,
      prevExpenseData
    ] = await Promise.all([
      Income.find({ userId, date: { $gte: currentYearStart, $lte: currentYearEnd } }),
      Expense.find({ userId, date: { $gte: currentYearStart, $lte: currentYearEnd } }),
      Income.find({ userId, date: { $gte: prevYearStart, $lte: prevYearEnd } }),
      Expense.find({ userId, date: { $gte: prevYearStart, $lte: prevYearEnd } })
    ]);

    // Current year calculations
    const currentIncome = currentIncomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const currentExpenses = currentExpenseData.reduce((sum, entry) => sum + entry.amount, 0);
    const currentDeductible = currentExpenseData
      .filter(entry => entry.isDeductible)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Previous year calculations
    const prevIncome = prevIncomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const prevExpenses = prevExpenseData.reduce((sum, entry) => sum + entry.amount, 0);
    const prevDeductible = prevExpenseData
      .filter(entry => entry.isDeductible)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Calculate year-over-year changes
    const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;
    const deductibleChange = prevDeductible > 0 ? ((currentDeductible - prevDeductible) / prevDeductible) * 100 : 0;

    const summary = {
      currentYear,
      current: {
        totalIncome: currentIncome,
        totalExpenses: currentExpenses,
        deductibleExpenses: currentDeductible,
        netIncome: currentIncome - currentExpenses,
        entryCount: currentIncomeData.length + currentExpenseData.length
      },
      previous: {
        totalIncome: prevIncome,
        totalExpenses: prevExpenses,
        deductibleExpenses: prevDeductible,
        netIncome: prevIncome - prevExpenses,
        entryCount: prevIncomeData.length + prevExpenseData.length
      },
      changes: {
        income: incomeChange,
        expenses: expenseChange,
        deductible: deductibleChange,
        netIncome: (prevIncome - prevExpenses) > 0 ? 
          (((currentIncome - currentExpenses) - (prevIncome - prevExpenses)) / (prevIncome - prevExpenses)) * 100 : 0
      },
      recommendations: []
    };

    // Generate recommendations
    if (incomeChange < -10) {
      summary.recommendations.push('Income has decreased significantly - consider diversifying income sources');
    }
    if (expenseChange > 20) {
      summary.recommendations.push('Expenses have increased substantially - review spending categories');
    }
    if (currentDeductible < currentIncome * 0.15) {
      summary.recommendations.push('You may be missing tax deductions - track more business expenses');
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export data in specified format
// @route   GET /api/v1/reports/export
// @access  Private
const exportData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { format = 'json', year, type = 'all' } = req.query;
    const exportYear = year ? parseInt(year) : new Date().getFullYear();

    // Date range
    const yearStart = new Date(exportYear, 0, 1);
    const yearEnd = new Date(exportYear, 11, 31, 23, 59, 59);

    let data = {};

    if (type === 'all' || type === 'income') {
      const incomeData = await Income.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      }).sort({ date: 1 });
      data.income = incomeData;
    }

    if (type === 'all' || type === 'expenses') {
      const expenseData = await Expense.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      }).sort({ date: 1 });
      data.expenses = expenseData;
    }

    // Add metadata
    data.metadata = {
      exportDate: new Date(),
      year: exportYear,
      type,
      totalRecords: (data.income?.length || 0) + (data.expenses?.length || 0)
    };

    if (format === 'csv') {
      // Convert to CSV format
      let csvContent = '';
      
      if (data.income) {
        csvContent += 'Type,Date,Description,Amount,Category,Source,Platform,Taxable\n';
        data.income.forEach(entry => {
          csvContent += `Income,${entry.date.toISOString().split('T')[0]},${entry.description},${entry.amount},${entry.category},${entry.source},${entry.platform || ''},${entry.taxable}\n`;
        });
      }

      if (data.expenses) {
        if (!csvContent.includes('Type,Date')) {
          csvContent += 'Type,Date,Description,Amount,Category,Vendor,Payment Method,Deductible\n';
        }
        data.expenses.forEach(entry => {
          csvContent += `Expense,${entry.date.toISOString().split('T')[0]},${entry.description},${entry.amount},${entry.category},${entry.vendor || ''},${entry.paymentMethod},${entry.isDeductible}\n`;
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=taxpal-export-${exportYear}.csv`);
      res.send(csvContent);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=taxpal-export-${exportYear}.json`);
      res.json({
        success: true,
        data
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAnnualReport,
  getReportSummary,
  exportData
}; 