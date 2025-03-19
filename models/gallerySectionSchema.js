const mongoose = require('mongoose');

const gallerySectionSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    }
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
    AlbumName: {
        type: String,
        required: true, 
    },
    Coverpic: {
        type: String,
        required: true,
    },
    gallerySection: [gallerySectionSchema] 
}, { timestamps: true });

const Album = mongoose.model("Album", eventSchema);

module.exports = Album;
