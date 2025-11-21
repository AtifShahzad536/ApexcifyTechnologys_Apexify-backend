import mongoose from 'mongoose';

const popupAdSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    linkUrl: {
        type: String,
        default: '/products'
    },
    buttonText: {
        type: String,
        default: 'Shop Now'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    backgroundColor: {
        type: String,
        default: '#f97316' // orange-500
    },
    textColor: {
        type: String,
        default: '#ffffff'
    },
    displayDuration: {
        type: Number,
        default: 5000 // 5 seconds
    },
    delayBeforeShow: {
        type: Number,
        default: 3000 // 3 seconds
    }
}, {
    timestamps: true
});

const PopupAd = mongoose.model('PopupAd', popupAdSchema);

export default PopupAd;
