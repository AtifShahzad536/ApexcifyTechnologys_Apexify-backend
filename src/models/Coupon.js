import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Coupon description is required']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'Discount type is required']
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative']
    },
    minPurchase: {
        type: Number,
        default: 0,
        min: [0, 'Minimum purchase cannot be negative']
    },
    maxDiscount: {
        type: Number, // For percentage discounts
        default: null
    },
    usageLimit: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    applicableCategories: [{
        type: String
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for fast lookups
couponSchema.index({ code: 1 });
couponSchema.index({ validUntil: 1, isActive: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (this.usageLimit === null || this.usedCount < this.usageLimit)
    );
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderTotal) {
    if (!this.isValid() || orderTotal < this.minPurchase) {
        return 0;
    }

    if (this.discountType === 'percentage') {
        const discount = (orderTotal * this.discountValue) / 100;
        return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
    } else {
        return Math.min(this.discountValue, orderTotal);
    }
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
