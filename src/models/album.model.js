// models/Album.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trackSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  track_url: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  _id: true
});

const albumSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  cover_image: {
    type: String,
    default: null,
  },
  tracks: [trackSchema],

  subcategories: [
    {
      subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true,
      },
    }
  ]
}, {
  timestamps: true,
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;