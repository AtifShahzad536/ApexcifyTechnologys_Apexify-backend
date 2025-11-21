import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get vendor dashboard statistics
// @route   GET /api/vendor/dashboard
// @access  Private (Vendor only)
export const getVendorDashboard = async (req, res) => {
    try {
        // Total products
        const totalProducts = await Product.countDocuments({ vendor: req.user._id });
        // Active products
        const activeProducts = await Product.countDocuments({ vendor: req.user._id, isActive: true });
        // All orders containing vendor's products
        const orders = await Order.find({ 'items.vendor': req.user._id });
        const totalOrders = orders.length;
        // Calculate pending orders (status not delivered or cancelled)
        const pendingOrders = orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length;
        // Calculate total revenue
        let totalRevenue = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.vendor.toString() === req.user._id.toString()) {
                    totalRevenue += item.price * item.quantity;
                }
            });
        });
        // Recent orders (limit 5)
        const recentOrders = await Order.find({ 'items.vendor': req.user._id })
            .populate('customer', 'name email')
            .sort('-createdAt')
            .limit(5);
        // Filter recent orders to only vendor items
        const filteredRecentOrders = recentOrders.map(order => {
            const vendorItems = order.items.filter(item => item.vendor.toString() === req.user._id.toString());
            return { ...order.toObject(), items: vendorItems };
        });
        res.json({
            success: true,
            stats: { totalProducts, activeProducts, totalOrders, pendingOrders, totalRevenue: totalRevenue.toFixed(2) },
            recentOrders: filteredRecentOrders,
        });
    } catch (error) {
        console.error('Vendor dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching vendor dashboard', error: error.message });
    }
};

// @desc    Get all vendor's products
// @route   GET /api/vendor/products
// @access  Private (Vendor only)
export const getVendorProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.user._id }).sort('-createdAt');
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
};

// @desc    Get all orders containing vendor's products
// @route   GET /api/vendor/orders
// @access  Private (Vendor only)
export const getVendorOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 'items.vendor': req.user._id })
            .populate('customer', 'name email phone')
            .populate('items.product', 'name images')
            .sort('-createdAt');
        const vendorOrders = orders.map(order => {
            const vendorItems = order.items.filter(item => item.vendor.toString() === req.user._id.toString());
            return { ...order.toObject(), items: vendorItems };
        });
        res.json({ success: true, orders: vendorOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
};
