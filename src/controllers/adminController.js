import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getAdminDashboard = async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });

        // Get product statistics
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isActive: true });

        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueData[0]?.total || 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .populate('customer', 'name email')
            .sort('-createdAt')
            .limit(10);

        // Get top products
        const topProducts = await Product.find({ isActive: true })
            .sort('-numReviews -averageRating')
            .limit(5);

        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    customers: totalCustomers,
                    vendors: totalVendors
                },
                products: {
                    total: totalProducts,
                    active: activeProducts
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    delivered: deliveredOrders
                },
                revenue: totalRevenue.toFixed(2)
            },
            recentOrders,
            topProducts
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin dashboard',
            error: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;

        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Update user (activate/deactivate, change role)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
    try {
        const { isActive, role } = req.body;

        const updateFields = {};
        if (isActive !== undefined) updateFields.isActive = isActive;
        if (role) updateFields.role = role;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// @desc    Get all products (including inactive)
// @route   GET /api/admin/products
// @access  Private (Admin only)
export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const products = await Product.find()
            .populate('vendor', 'name email')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments();

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin only)
export const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.orderStatus = status;

        const orders = await Order.find(query)
            .populate('customer', 'name email')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};
