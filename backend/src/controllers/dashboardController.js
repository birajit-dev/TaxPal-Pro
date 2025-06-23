const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get dashboard overview (frontend compatible)
// @route   GET /api/v1/dashboard/overview  
// @access  Private
const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Date ranges
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get all data for the year
    const [incomeData, expenseData] = await Promise.all([
      Income.find({ userId, date: { $gte: yearStart, $lte: yearEnd } }),
      Expense.find({ userId, date: { $gte: yearStart, $lte: yearEnd } })
    ]);

    // Calculate totals
    const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenseData.reduce((sum, entry) => sum + entry.amount, 0);
    const deductibleExpenses = expenseData
      .filter(entry => entry.isDeductible)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Calculate tax estimates
    const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
    const selfEmploymentTax = totalIncome * 0.1413;
    const federalTax = Math.max(0, (taxableIncome - 13850) * 0.22); // Simplified
    const estimatedTax = selfEmploymentTax + federalTax;
    const quarterlyTax = estimatedTax / 4;
    
    // Deduction coverage percentage
    const deductionCoverage = totalExpenses > 0 ? (deductibleExpenses / totalExpenses) * 100 : 0;

    // Monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59);
      
      const monthIncome = incomeData
        .filter(entry => entry.date >= monthStart && entry.date <= monthEnd)
        .reduce((sum, entry) => sum + entry.amount, 0);

      const monthExpenses = expenseData
        .filter(entry => entry.date >= monthStart && entry.date <= monthEnd)
        .reduce((sum, entry) => sum + entry.amount, 0);

      monthlyBreakdown.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome,
        expenses: monthExpenses
      });
    }

    const overview = {
      totalIncome,
      totalExpenses,
      deductibleExpenses,
      estimatedTax,
      quarterlyTax,
      incomeEntries: incomeData.length,
      expenseEntries: expenseData.length,
      deductionCoverage,
      monthlyBreakdown,
      year: currentYear
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary
// @route   GET /api/v1/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Date ranges
    const yearStart = new Date(currentYear, 0, 1);
    const monthStart = new Date(currentYear, currentMonth, 1);

    // Aggregate data
    const [
      totalIncome,
      monthlyIncome,
      yearlyIncome,
      totalExpenses,
      monthlyExpenses,
      yearlyExpenses,
      deductibleExpenses,
      incomeByCategory,
      expensesByCategory,
      recentIncome,
      recentExpenses
    ] = await Promise.all([
      // Total income
      Income.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Monthly income
      Income.aggregate([
        { $match: { userId, date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Yearly income
      Income.aggregate([
        { $match: { userId, date: { $gte: yearStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Total expenses
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Monthly expenses
      Expense.aggregate([
        { $match: { userId, date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Yearly expenses
      Expense.aggregate([
        { $match: { userId, date: { $gte: yearStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Deductible expenses
      Expense.aggregate([
        { $match: { userId, isDeductible: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Income by category
      Income.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      // Expenses by category
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      // Recent income
      Income.find({ userId }).sort({ date: -1 }).limit(5),
      // Recent expenses
      Expense.find({ userId }).sort({ date: -1 }).limit(5)
    ]);

    const summary = {
      income: {
        total: totalIncome[0]?.total || 0,
        monthly: monthlyIncome[0]?.total || 0,
        yearly: yearlyIncome[0]?.total || 0,
        byCategory: incomeByCategory
      },
      expenses: {
        total: totalExpenses[0]?.total || 0,
        monthly: monthlyExpenses[0]?.total || 0,
        yearly: yearlyExpenses[0]?.total || 0,
        deductible: deductibleExpenses[0]?.total || 0,
        byCategory: expensesByCategory
      },
      profit: {
        total: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
        monthly: (monthlyIncome[0]?.total || 0) - (monthlyExpenses[0]?.total || 0),
        yearly: (yearlyIncome[0]?.total || 0) - (yearlyExpenses[0]?.total || 0)
      },
      recent: {
        income: recentIncome,
        expenses: recentExpenses
      },
      taxEstimate: {
        taxableIncome: Math.max(0, (yearlyIncome[0]?.total || 0) - (deductibleExpenses[0]?.total || 0)),
        deductibleAmount: deductibleExpenses[0]?.total || 0,
        estimatedTax: Math.max(0, ((yearlyIncome[0]?.total || 0) - (deductibleExpenses[0]?.total || 0)) * 0.25)
      }
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly trends
// @route   GET /api/v1/dashboard/trends
// @access  Private
const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { year = new Date().getFullYear() } = req.query;

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const [incomeByMonth, expensesByMonth] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            userId,
            date: { $gte: yearStart, $lte: yearEnd }
          }
        },
        {
          $group: {
            _id: { $month: '$date' },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Expense.aggregate([
        {
          $match: {
            userId,
            date: { $gte: yearStart, $lte: yearEnd }
          }
        },
        {
          $group: {
            _id: { $month: '$date' },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Create month data array
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthIncome = incomeByMonth.find(item => item._id === i + 1);
      const monthExpenses = expensesByMonth.find(item => item._id === i + 1);
      
      return {
        month: i + 1,
        income: monthIncome?.total || 0,
        expenses: monthExpenses?.total || 0,
        profit: (monthIncome?.total || 0) - (monthExpenses?.total || 0),
        incomeCount: monthIncome?.count || 0,
        expenseCount: monthExpenses?.count || 0
      };
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        months
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getDashboardSummary,
  getMonthlyTrends
}; 