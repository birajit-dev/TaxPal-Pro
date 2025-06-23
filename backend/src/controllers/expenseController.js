const Expense = require('../models/Expense');

// @desc    Get all expense entries for user
// @route   GET /api/v1/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, startDate, endDate, isDeductible, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { userId };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (isDeductible !== undefined) {
      query.isDeductible = isDeductible === 'true';
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      Expense.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(query)
    ]);

    // Calculate summary stats
    const [totalAmount, deductibleAmount] = await Promise.all([
      Expense.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { ...query, isDeductible: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          totalAmount: totalAmount[0]?.total || 0,
          deductibleAmount: deductibleAmount[0]?.total || 0,
          totalEntries: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense entry
// @route   GET /api/v1/expenses/:id
// @access  Private
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    res.json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense entry
// @route   POST /api/v1/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const expenseData = {
      ...req.body,
      userId: req.user.userId
    };

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      message: 'Expense entry created successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense entry
// @route   PUT /api/v1/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense entry updated successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense entry
// @route   DELETE /api/v1/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense
}; 