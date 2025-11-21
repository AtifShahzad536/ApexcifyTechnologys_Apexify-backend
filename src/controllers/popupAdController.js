import PopupAd from '../models/PopupAd.js';

// @desc    Get active popup ad
// @route   GET /api/popup-ads/active
// @access  Public
export const getActivePopupAd = async (req, res) => {
    try {
        const popupAd = await PopupAd.findOne({ isActive: true }).sort('-createdAt');

        res.json({
            success: true,
            popupAd
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching popup ad',
            error: error.message
        });
    }
};

// @desc    Get all popup ads
// @route   GET /api/popup-ads
// @access  Private (Admin only)
export const getAllPopupAds = async (req, res) => {
    try {
        const popupAds = await PopupAd.find().sort('-createdAt');

        res.json({
            success: true,
            popupAds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching popup ads',
            error: error.message
        });
    }
};

// @desc    Create popup ad
// @route   POST /api/popup-ads
// @access  Private (Admin only)
export const createPopupAd = async (req, res) => {
    try {
        const popupAd = await PopupAd.create(req.body);

        res.status(201).json({
            success: true,
            popupAd
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating popup ad',
            error: error.message
        });
    }
};

// @desc    Update popup ad
// @route   PUT /api/popup-ads/:id
// @access  Private (Admin only)
export const updatePopupAd = async (req, res) => {
    try {
        const popupAd = await PopupAd.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!popupAd) {
            return res.status(404).json({
                success: false,
                message: 'Popup ad not found'
            });
        }

        res.json({
            success: true,
            popupAd
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating popup ad',
            error: error.message
        });
    }
};

// @desc    Delete popup ad
// @route   DELETE /api/popup-ads/:id
// @access  Private (Admin only)
export const deletePopupAd = async (req, res) => {
    try {
        const popupAd = await PopupAd.findByIdAndDelete(req.params.id);

        if (!popupAd) {
            return res.status(404).json({
                success: false,
                message: 'Popup ad not found'
            });
        }

        res.json({
            success: true,
            message: 'Popup ad deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting popup ad',
            error: error.message
        });
    }
};

// @desc    Toggle popup ad active status
// @route   PATCH /api/popup-ads/:id/toggle
// @access  Private (Admin only)
export const togglePopupAdStatus = async (req, res) => {
    try {
        const popupAd = await PopupAd.findById(req.params.id);

        if (!popupAd) {
            return res.status(404).json({
                success: false,
                message: 'Popup ad not found'
            });
        }

        // If activating this ad, deactivate all others
        if (!popupAd.isActive) {
            await PopupAd.updateMany({}, { isActive: false });
        }

        popupAd.isActive = !popupAd.isActive;
        await popupAd.save();

        res.json({
            success: true,
            popupAd
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling popup ad status',
            error: error.message
        });
    }
};
