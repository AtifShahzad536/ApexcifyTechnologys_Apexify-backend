import Stripe from 'stripe';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('items.product');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const line_items = order.items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${orderId}`,
            customer_email: req.user.email,
            metadata: {
                orderId: orderId
            }
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ message: 'Failed to create checkout session' });
    }
};

export const handlePaymentSuccess = async (req, res) => {
    try {
        const { session_id, order_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const order = await Order.findById(order_id);
            if (order) {
                order.paymentStatus = 'completed';
                order.paymentIntentId = session.payment_intent;
                // Store session ID as well if needed, or just rely on paymentIntentId
                // The schema doesn't have paidAt, so we skip it or add it if we modify schema.
                // Let's stick to existing schema.

                await order.save();
                res.json({ success: true, order });
            } else {
                res.status(404).json({ message: 'Order not found' });
            }
        } else {
            res.status(400).json({ message: 'Payment not successful' });
        }
    } catch (error) {
        console.error('Payment success error:', error);
        res.status(500).json({ message: 'Failed to verify payment' });
    }
};
