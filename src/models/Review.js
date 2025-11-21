import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: [true, 'Please provide a comment'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Prevent duplicate reviews from same user for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                numReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            numReviews: stats[0].numReviews
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            numReviews: 0
        });
    }
};

// Update product rating after save
reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.product);
});

// Update product rating after delete
reviewSchema.post('remove', function () {
    this.constructor.calcAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
