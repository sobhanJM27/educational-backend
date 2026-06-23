const mongoose = require('mongoose');

const SitemapSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    priority: {
      type: Number,
      required: true,
      min: 0.0,
      max: 1.0,
      default: 0.5,
    },
    changefreq: {
      type: String,
      enum: [
        'always',
        'hourly',
        'daily',
        'weekly',
        'monthly',
        'yearly',
        'never',
      ],
      default: 'daily',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = {
  SitemapModel: mongoose.model('Sitemap', SitemapSchema),
};
