const mongoose = require('mongoose');

const SliderSchema = new mongoose.Schema({
  images: { type: [String], default: [] },
});

module.exports = {
  SliderModel: mongoose.model('slider', SliderSchema),
};
