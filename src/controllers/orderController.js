import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../services/emailService.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, notes } = req.body;

        // Validate products and calculate prices
        let itemsPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.images[0] || '',
                price: product.price,
                quantity: item.quantity,
                vendor: product.vendor
            });

            itemsPrice += product.price * item.quantity;

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate additional prices
        const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
        const taxPrice = Number((itemsPrice * 0.1).toFixed(2)); // 10% tax
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        // Generate order number
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        const orderNumber = `ORD-${timestamp}-${random}`;

        // Create order
        const order = await Order.create({
            orderNumber,
            customer: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            notes
        });

        // Populate order details
        await order.populate('customer', 'name email');
        await order.populate('items.product', 'name');

        // Send confirmation email (async)
        sendOrderConfirmation(order, req.user).catch(err =>
            console.error('Order confirmation email failed:', err)
        );

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
    try {
        const query = { customer: req.user._id };

        const orders = await Order.find(query)
            .populate('items.product', 'name images')
            .sort('-createdAt');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name images')
            .populate('items.vendor', 'name vendorInfo.storeName');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (
            req.user.role !== 'admin' &&
            order.customer._id.toString() !== req.user._id.toString() &&
            !order.items.some(item => item.vendor._id.toString() === req.user._id.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor for their items, Admin for all)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization for vendors
        if (req.user.role === 'vendor') {
            const hasItems = order.items.some(
                item => item.vendor.toString() === req.user._id.toString()
            );

            if (!hasItems) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this order'
                });
            }
        }

        order.orderStatus = orderStatus;

        if (orderStatus === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        if (orderStatus === 'Paid') {
            order.paymentStatus = 'Paid';
        }

        await order.save();

        // Send status update email (async)
        sendOrderStatusUpdate(order, order.customer, orderStatus).catch(err =>
            console.error('Status update email failed:', err)
        );

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};
