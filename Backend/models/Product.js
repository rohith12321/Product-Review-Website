const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  username: String,
  review: String,
  rating: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  buyLinks: {
    amazon: String,
    flipkart: String
  },
  prices: {
    amazon: String,
    flipkart: String
  },
  reviews: {
    amazon: [reviewSchema],
    flipkart: [reviewSchema],
    custom: [reviewSchema]
  }
});

module.exports = mongoose.model('Product', productSchema);
