const Income = require('../models/Income');
const Expense = require('../models/Expense');

// Tax bracket for 2024 (single filer)
const TAX_BRACKETS = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11000, max: 44725, rate: 0.12 },
  { min: 44725, max: 95375, rate: 0.22 },
  { min: 95375, max: 182050, rate: 0.24 },
  { min: 182050, max: 231250, rate: 0.32 },
  { min: 231250, max: 578125, rate: 0.35 },
  { min: 578125, max: Infinity, rate: 0.37 }
];

const STANDARD_DEDUCTION = 13850; // 2024 standard deduction for single filers
const SE_TAX_RATE = 0.1413; // Self-employment tax rate

// Helper function to calculate federal income tax
const calculateFederalTax = (taxableIncome) => {
  let tax = 0;
  let remainingIncome = Math.max(0, taxableIncome - STANDARD_DEDUCTION);

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    
    const taxableAtThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableAtThisBracket * bracket.rate;
    remainingIncome -= taxableAtThisBracket;
  }

  return tax;
};

// Helper function to get marginal tax rate
const getMarginalTaxRate = (taxableIncome) => {
  const adjustedIncome = Math.max(0, taxableIncome - STANDARD_DEDUCTION);
  
  for (const bracket of TAX_BRACKETS) {
    if (adjustedIncome <= bracket.max) {
      return bracket.rate * 100;
    }
  }
  return TAX_BRACKETS[TAX_BRACKETS.length - 1].rate * 100;
};

// Helper function to generate tax recommendations
const generateTaxRecommendations = (totalIncome, deductibleExpenses, totalExpenses, effectiveRate) => {
  const recommendations = [];

  // Deduction optimization
  if (deductibleExpenses < totalIncome * 0.15) {
    recommendations.push("Consider tracking more business expenses - you may be missing valuable deductions");
  }

  // High tax rate warning
  if (effectiveRate > 25) {
    recommendations.push("Your effective tax rate is high - consider maximizing retirement contributions (SEP-IRA, Solo 401k)");
  }

  // Expense optimization
  if (totalExpenses - deductibleExpenses > totalIncome * 0.10) {
    recommendations.push("You have significant non-deductible expenses - review your business spending strategy");
  }

  // Income-based recommendations
  if (totalIncome > 50000 && deductibleExpenses < 5000) {
    recommendations.push("With your income level, you should have more business deductions - track home office, equipment, and professional expenses");
  }

  // Quarterly payment recommendation
  if (totalIncome > 30000) {
    recommendations.push("Consider making quarterly estimated tax payments to avoid penalties");
  }

  // Equipment deduction recommendation
  if (totalIncome > 40000 && deductibleExpenses < totalIncome * 0.20) {
    recommendations.push("Look into Section 179 deductions for business equipment purchases");
  }

  if (recommendations.length === 0) {
    recommendations.push("Your tax situation looks well-optimized! Keep tracking expenses consistently.");
  }

  return recommendations;
};

// @desc    Get comprehensive tax estimate
// @route   GET /api/v1/tax/estimate
// @access  Private
const getTaxEstimate = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Date range for the year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get income and expense data
    const [incomeData, expenseData] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      }),
      Expense.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      })
    ]);

    // Calculate totals
    const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenseData.reduce((sum, entry) => sum + entry.amount, 0);
    const deductibleExpenses = expenseData
      .filter(entry => entry.isDeductible)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Tax calculations
    const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
    const selfEmploymentTax = totalIncome * SE_TAX_RATE;
    const federalTax = calculateFederalTax(taxableIncome);
    const totalTax = federalTax + selfEmploymentTax;
    
    // Rates and payments
    const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
    const marginalRate = getMarginalTaxRate(taxableIncome);
    const quarterlyPayment = totalTax / 4;

    // Generate recommendations
    const recommendations = generateTaxRecommendations(
      totalIncome, 
      deductibleExpenses, 
      totalExpenses, 
      effectiveRate
    );

    const estimate = {
      currentYear,
      totalIncome,
      totalExpenses,
      deductibleExpenses,
      taxableIncome,
      federalTax,
      selfEmploymentTax,
      totalTax,
      quarterlyPayment,
      effectiveRate,
      marginalRate,
      standardDeduction: STANDARD_DEDUCTION,
      recommendations
    };

    res.json({
      success: true,
      data: estimate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate tax scenario (what-if analysis)
// @route   POST /api/v1/tax/scenario
// @access  Private
const calculateTaxScenario = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      additionalIncome = 0,
      additionalExpenses = 0,
      retirementContribution = 0,
      year
    } = req.body;

    const currentYear = year || new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get current data
    const [incomeData, expenseData] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      }),
      Expense.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      })
    ]);

    // Calculate current totals
    const currentIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const currentDeductibleExpenses = expenseData
      .filter(entry => entry.isDeductible)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Calculate scenario
    const scenarioIncome = currentIncome + additionalIncome;
    const scenarioDeductibleExpenses = currentDeductibleExpenses + additionalExpenses + retirementContribution;
    const scenarioTaxableIncome = Math.max(0, scenarioIncome - scenarioDeductibleExpenses);

    // Tax calculations for scenario
    const scenarioSelfEmploymentTax = scenarioIncome * SE_TAX_RATE;
    const scenarioFederalTax = calculateFederalTax(scenarioTaxableIncome);
    const scenarioTotalTax = scenarioFederalTax + scenarioSelfEmploymentTax;

    // Current tax calculation for comparison
    const currentTaxableIncome = Math.max(0, currentIncome - currentDeductibleExpenses);
    const currentSelfEmploymentTax = currentIncome * SE_TAX_RATE;
    const currentFederalTax = calculateFederalTax(currentTaxableIncome);
    const currentTotalTax = currentFederalTax + currentSelfEmploymentTax;

    const scenario = {
      current: {
        totalIncome: currentIncome,
        deductibleExpenses: currentDeductibleExpenses,
        taxableIncome: currentTaxableIncome,
        totalTax: currentTotalTax,
        effectiveRate: currentIncome > 0 ? (currentTotalTax / currentIncome) * 100 : 0
      },
      scenario: {
        totalIncome: scenarioIncome,
        deductibleExpenses: scenarioDeductibleExpenses,
        taxableIncome: scenarioTaxableIncome,
        totalTax: scenarioTotalTax,
        effectiveRate: scenarioIncome > 0 ? (scenarioTotalTax / scenarioIncome) * 100 : 0
      },
      difference: {
        income: additionalIncome,
        expenses: additionalExpenses,
        retirementContribution,
        taxSavings: currentTotalTax - scenarioTotalTax,
        netImpact: additionalIncome - (scenarioTotalTax - currentTotalTax)
      }
    };

    res.json({
      success: true,
      data: scenario
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quarterly tax payment schedule
// @route   GET /api/v1/tax/quarterly
// @access  Private
const getQuarterlySchedule = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get tax estimate for the year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const [incomeData, expenseData] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      }),
      Expense.find({
        userId,
        date: { $gte: yearStart, $lte: yearEnd }
      })
    ]);

    const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const deductibleExpenses = expenseData
      .filter(entry => entry.isDeductible)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
    const selfEmploymentTax = totalIncome * SE_TAX_RATE;
    const federalTax = calculateFederalTax(taxableIncome);
    const totalTax = federalTax + selfEmploymentTax;
    const quarterlyAmount = totalTax / 4;

    // Generate quarterly payment schedule
    const schedule = [
      {
        quarter: 'Q1',
        period: `Jan 1 - Mar 31, ${currentYear}`,
        dueDate: `${currentYear}-04-15`,
        amount: quarterlyAmount
      },
      {
        quarter: 'Q2',
        period: `Apr 1 - May 31, ${currentYear}`,
        dueDate: `${currentYear}-06-17`,
        amount: quarterlyAmount
      },
      {
        quarter: 'Q3',
        period: `Jun 1 - Aug 31, ${currentYear}`,
        dueDate: `${currentYear}-09-16`,
        amount: quarterlyAmount
      },
      {
        quarter: 'Q4',
        period: `Sep 1 - Dec 31, ${currentYear}`,
        dueDate: `${currentYear + 1}-01-15`,
        amount: quarterlyAmount
      }
    ];

    res.json({
      success: true,
      data: {
        year: currentYear,
        totalEstimatedTax: totalTax,
        quarterlyAmount,
        schedule
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tax deadlines and important dates
// @route   GET /api/v1/tax/deadlines
// @access  Private
const getTaxDeadlines = async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const deadlines = [
      {
        title: 'Q1 Quarterly Payment',
        date: `${currentYear}-04-15`,
        description: 'First quarter estimated tax payment due',
        type: 'quarterly'
      },
      {
        title: 'Q2 Quarterly Payment',
        date: `${currentYear}-06-17`,
        description: 'Second quarter estimated tax payment due',
        type: 'quarterly'
      },
      {
        title: 'Q3 Quarterly Payment',
        date: `${currentYear}-09-16`,
        description: 'Third quarter estimated tax payment due',
        type: 'quarterly'
      },
      {
        title: 'Annual Tax Return',
        date: `${currentYear + 1}-04-15`,
        description: `${currentYear} tax return filing deadline`,
        type: 'annual'
      },
      {
        title: 'Q4 Quarterly Payment',
        date: `${currentYear + 1}-01-15`,
        description: 'Fourth quarter estimated tax payment due',
        type: 'quarterly'
      },
      {
        title: '1099 Forms Available',
        date: `${currentYear + 1}-01-31`,
        description: 'Clients must provide 1099-NEC forms',
        type: 'informational'
      }
    ];

    res.json({
      success: true,
      data: {
        year: currentYear,
        deadlines: deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTaxEstimate,
  calculateTaxScenario,
  getQuarterlySchedule,
  getTaxDeadlines
}; 