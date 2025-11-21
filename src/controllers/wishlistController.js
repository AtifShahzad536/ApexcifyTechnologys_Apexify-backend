import Wishlist from '../models/Wishlist.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.json({ wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: [req.params.productId]
            });
        } else {
            if (wishlist.products.includes(req.params.productId)) {
                return res.status(400).json({ message: 'Product already in wishlist' });
            }
            wishlist.products.push(req.params.productId);
            await wishlist.save();
        }

        await wishlist.populate('products');
        res.json({ wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(
            p => p.toString() !== req.params.productId
        );
        await wishlist.save();
        await wishlist.populate('products');

        res.json({ wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access   Private
export const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.products = [];
        await wishlist.save();

        res.json({ message: 'Wishlist cleared', wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
