const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');



// input validatios 

const validateUpdateInputs  = (data, allowedFields) => {
    const errors = {};

    // check for empty Strings
    //Returns an object with error messages if validation fails
    //Returns null if all fields are valid

    Object.keys(data).forEach(key => {
        if (allowedFields.includes(key) && data[key] === ''){
            errors[key] = `${key} cannot be empty`
        }
    });

    return Object.keys(errors).length > 0 ? errors: null;
}
// Get user profile
// GET /api/users/profile
// access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('issuedBooks.bookId', 'title author');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
// PUT /api/users/profile
// access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, address } = req.body;

    // validate Inputs
    const errors = validateUpdateInputs(
        { firstName, lastName, phoneNumber, address },
        ['firstName', 'lastName', 'phoneNumber']
    );
    
    if (errors){
        return res.status(400).json({message: 'Validation error ', errors});
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phoneNumber, address },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's transactions
// GET /api/users/transactions
// access  Private
const getMyTransactions = async (req, res) => {
  try {
    const {page = 1, limit = 10, status, type } = req.query;
    
    //Dynamic Query Filtering
    
    let query = {user: req.user._id}
    // Filter By status if provided
    if (status) {
        query.status = status;
    }
    //filter by type if provided 
    if (type) {
        query.type = type;
    }
    const skip = (page -1 ) * limit;

    const transactions = await Transaction.find(query)
      .populate('book', 'title author coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (Admin only)
// GET /api/users
// access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  Get single user (Admin only)
//  GET /api/users/:id
// access  Private (Admin)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('issuedBooks.bookId', 'title author');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await Transaction.find({ user: user._id })
      .populate('book', 'title author')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ user, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (Admin only)
//  PUT /api/users/:id
// access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, role, isActive, phoneNumber, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, role, isActive, phoneNumber, address },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  Delete user (Admin only)
//  DELETE /api/users/:id
//  access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active book issues
    const activeTransactions = await Transaction.countDocuments({
      user: user._id,
      status: 'approved',
      returnedAt: { $exists: false }
    });

    if (activeTransactions > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with active book issues. Please return all books first.' 
      });
    }

    // Soft delete - deactivate user instead of actually deleting
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  Get dashboard statistics (Admin only)
// GET /api/users/dashboard/stats
// access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    console.log('Dashboard stats endpoint hit');
    
    // Simplified version for debugging
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalBooks = await Book.countDocuments({ isActive: true});
    const totalTransactions = await Transaction.countDocuments();
    const pendingRequests = await Transaction.countDocuments({ status: 'pending'})
    
    const activeIssues = await Transaction.countDocuments(
        {
            status: 'approved',
            type: 'issue',
            returnedAt: { $exists: false}
        });
    const availableBooks = await Book.countDocuments({
        'availability.availableCopies' : { $gt: 0},
        isActive: true
    })

    const overdueBooks = await Transaction.countDocuments({
        status: 'approved',
        type: 'issue',
        dueDate: { $lt: new Date()},
        returnedAt: { $exists: false}
    });
    const totalFinesCollected = await Transaction.aggregate([
        { $match: { finePaid: true}},
        { $group: {_id: null, total: {$sum: '$fineAmount'}}}
    ]);

    const recentTransactios = await Transaction.find()
        .populate ('user','firstName lastName email')
        .populate ('book', 'title author')
        .sort({ createdAt: -1 })
        .limit(10)

    res.json({
        totalUsers,
        totalBooks,
        totalTransactions,
        pendingRequests,
        activeIssues,
        availableBooks,
        overdueBooks,
        totalFinesCollected: totalFinesCollected[0]?.total || 0,
        recentTransactions: recentTransactios
    })
    

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyTransactions,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDashboardStats
}; 