import Product from '../models/Product.js';

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            sort = '-createdAt',
            page = 1,
            limit = 12,
            featured
        } = req.query;

        // Build query
        const query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Google-like search - searches across name, description, category, and tags
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { tags: searchRegex }
            ];
        }

        if (featured === 'true') {
            query.featured = true;
        }

        // Execute query
        const products = await Product.find(query)
            .populate('vendor', 'name vendorInfo.storeName')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments(query);

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('vendor', 'name email vendorInfo');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Vendor only)
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, images, stock, tags, specifications, featured } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            category,
            images: images || [],
            stock,
            vendor: req.user._id,
            tags: tags || [],
            specifications: specifications || {},
            featured: req.user.role === 'admin' ? featured : false
        });

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Vendor - own products, Admin - all)
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' && product.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        const { name, description, price, category, images, stock, tags, specifications, featured, isActive } = req.body;

        const updateFields = {
            name: name || product.name,
            description: description || product.description,
            price: price !== undefined ? price : product.price,
            category: category || product.category,
            images: images || product.images,
            stock: stock !== undefined ? stock : product.stock,
            tags: tags || product.tags,
            specifications: specifications || product.specifications
        };

        // Only admin can set featured
        if (req.user.role === 'admin') {
            if (featured !== undefined) updateFields.featured = featured;
            if (isActive !== undefined) updateFields.isActive = isActive;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Vendor - own products, Admin - all)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' && product.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// @desc    Get all categories
// @route   GET /api/products/categories/list
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};
