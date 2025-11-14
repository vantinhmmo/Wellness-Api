// models/DailyWellness.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho một lần log cụ thể (sub-document)
const logEntrySchema = new Schema({
  mood: { 
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  energy: { 
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  stress: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  sleep: { 
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const dailyWellnessSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: { 
    type: Date,
    required: true
  },
  logs: [logEntrySchema], 
  averages: { 
    mood: { type: Number, default: 0 },
    energy: { type: Number, default: 0 },
    stress: { type: Number, default: 0 },
    sleep: { type: Number, default: 0 }
  },
  logCount: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true 
});

dailyWellnessSchema.index({ user: 1, date: 1 }, { unique: true });

const DailyWellness = mongoose.model('DailyWellness', dailyWellnessSchema);
module.exports = DailyWellness;