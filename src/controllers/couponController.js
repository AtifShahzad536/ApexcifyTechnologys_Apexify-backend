import Coupon from '../models/Coupon.js';

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Admin/Vendor
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            usageLimit,
            validFrom,
            validUntil,
            applicableCategories,
            applicableProducts
        } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            usageLimit,
            validFrom,
            validUntil,
            applicableCategories,
            applicableProducts,
            createdBy: req.user._id
        });

        res.status(201).json({ coupon });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin/Vendor
export const getCoupons = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
        const coupons = await Coupon.find(query).sort('-createdAt');
        res.json({ coupons });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate coupon code
// @route    POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderTotal, cart } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({ message: 'Coupon is expired or inactive' });
        }

        if (orderTotal < coupon.minPurchase) {
            return res.status(400).json({
                message: `Minimum purchase of $${coupon.minPurchase} required`
            });
        }

        // Check if user has already used this coupon (if usage limit per user exists)
        const userUsage = coupon.usedBy.find(u => u.user.toString() === req.user._id.toString());
        if (userUsage) {
            return res.status(400).json({ message: 'You have already used this coupon' });
        }

        // Check if applicable to cart items
        if (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) {
            const isApplicable = cart.some(item => {
                return coupon.applicableCategories.includes(item.product.category) ||
                    coupon.applicableProducts.includes(item.product._id);
            });

            if (!isApplicable) {
                return res.status(400).json({ message: 'Coupon not applicable to cart items' });
            }
        }

        const discount = coupon.calculateDiscount(orderTotal);

        res.json({
            valid: true,
            discount,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply coupon to order
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon || !coupon.isValid()) {
            return res.status(400).json({ message: 'Invalid or expired coupon' });
        }

        // Increment used count and add user to usedBy
        coupon.usedCount += 1;
        coupon.usedBy.push({ user: req.user._id });
        await coupon.save();

        res.json({ message: 'Coupon applied successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Admin/Vendor (own coupons)
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Check ownership
        if (req.user.role !== 'admin' && coupon.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await coupon.deleteOne();
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Admin/Vendor (own coupons)
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Check ownership
        if (req.user.role !== 'admin' && coupon.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(coupon, req.body);
        await coupon.save();

        res.json({ coupon });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
