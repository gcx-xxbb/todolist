const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '标签名称不能为空'],
    unique: true,
    trim: true,
    maxlength: [30, '标签名称最多30个字符']
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  useCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

tagSchema.pre('save', function() {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
});

module.exports = mongoose.model('Tag', tagSchema);