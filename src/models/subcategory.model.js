const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: null,
    },
    cover_image: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;