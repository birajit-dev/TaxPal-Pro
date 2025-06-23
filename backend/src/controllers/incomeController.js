const Income = require('../models/Income');

// @desc    Get all income entries for user
// @route   GET /api/v1/income
// @access  Private
const getIncomes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { userId };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { source: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      Income.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Income.countDocuments(query)
    ]);

    // Calculate summary stats
    const totalAmount = await Income.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
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
          totalEntries: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single income entry
// @route   GET /api/v1/income/:id
// @access  Private
const getIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    res.json({
      success: true,
      data: { income }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new income entry
// @route   POST /api/v1/income
// @access  Private
const createIncome = async (req, res, next) => {
  try {
    const incomeData = {
      ...req.body,
      userId: req.user.userId
    };

    const income = await Income.create(incomeData);

    res.status(201).json({
      success: true,
      message: 'Income entry created successfully',
      data: { income }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income entry
// @route   PUT /api/v1/income/:id
// @access  Private
const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Income entry updated successfully',
      data: { income }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income entry
// @route   DELETE /api/v1/income/:id
// @access  Private
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Income entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome
}; 