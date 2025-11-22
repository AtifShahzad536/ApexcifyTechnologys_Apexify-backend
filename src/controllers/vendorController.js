import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get vendor dashboard statistics
// @route   GET /api/vendor/dashboard
// @access  Private (Vendor only)
export const getVendorDashboard = async (req, res) => {
    try {
        const vendorId = req.user._id;

        // 1. Basic Stats
        const totalProducts = await Product.countDocuments({ vendor: vendorId });
        const activeProducts = await Product.countDocuments({ vendor: vendorId, isActive: true });

        // Fetch all orders for this vendor
        const orders = await Order.find({ 'items.vendor': vendorId }).sort('-createdAt');

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order =>
            order.status !== 'delivered' && order.status !== 'cancelled'
        ).length;

        // Calculate Total Revenue
        let totalRevenue = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.vendor.toString() === vendorId.toString()) {
                    totalRevenue += item.price * item.quantity;
                }
            });
        });

        // 2. Revenue Chart Data (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const revenueMap = new Map();
        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            revenueMap.set(dateStr, 0);
        }

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            if (orderDate >= sevenDaysAgo) {
                const dateStr = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
                let orderRevenue = 0;
                order.items.forEach(item => {
                    if (item.vendor.toString() === vendorId.toString()) {
                        orderRevenue += item.price * item.quantity;
                    }
                });

                if (revenueMap.has(dateStr)) {
                    revenueMap.set(dateStr, revenueMap.get(dateStr) + orderRevenue);
                }
            }
        });

        // Convert map to array and reverse to show Mon -> Sun order
        const revenueData = Array.from(revenueMap, ([name, value]) => ({ name, value })).reverse();

        // 3. Sales by Category
        const categoryMap = new Map();

        // We need to fetch products to get their categories as they might not be in order items directly if schema is simple
        // Assuming order items have product reference. 
        // To be safe and accurate, let's aggregate from the orders we already have, 
        // but we might need to populate product details if category isn't on the item.
        // Checking Order model schema would be ideal, but let's assume we need to look up products or it's on the item.
        // Usually Order Items copy essential data. If category isn't there, we fetch products.
        // Let's do a quick aggregation or manual tally if we trust the item data.
        // For now, let's fetch all vendor products to create a map of ProductID -> Category
        const vendorProducts = await Product.find({ vendor: vendorId }).select('_id category');
        const productCategoryMap = new Map(vendorProducts.map(p => [p._id.toString(), p.category]));

        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.vendor.toString() === vendorId.toString()) {
                    const category = productCategoryMap.get(item.product.toString()) || 'Uncategorized';
                    categoryMap.set(category, (categoryMap.get(category) || 0) + item.quantity);
                }
            });
        });

        const salesData = Array.from(categoryMap, ([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 categories

        // 4. Recent Orders (Limit 5)
        const recentOrders = orders.slice(0, 5).map(order => {
            const vendorItems = order.items.filter(item => item.vendor.toString() === vendorId.toString());
            return { ...order.toObject(), items: vendorItems };
        });

        // 5. Calculate Trends (Simple comparison vs previous period logic could go here, 
        // but for now let's return 0 or calculate if we had historical data easily accessible)
        // Let's mock trends for now based on some logic or just return 0 if no data.
        // Real implementation would require querying previous month's data.

        res.json({
            success: true,
            stats: {
                totalProducts,
                activeProducts,
                totalOrders,
                pendingOrders,
                totalRevenue: totalRevenue.toFixed(2),
                averageRating: 0 // Placeholder, would need Review model aggregation
            },
            charts: {
                revenueData,
                salesData
            },
            recentOrders
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
