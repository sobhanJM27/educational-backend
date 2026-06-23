const mongoose = require('mongoose');

const LandingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  section1Title: { type: String, required: true },
  section1Text1: { type: String, required: true },
  section1Text2: { type: [String], default: [], required: true },
  section1Text3: { type: String, required: true },
  formTitle: { type: String, required: true },
  formTitle2: { type: String, required: true },
  packTitle: { type: String, required: true },
  packText1: { type: String, required: true },
  packText2: { type: [String], default: [], required: true },
  courseTitle: { type: String, required: true },
  courseText1: { type: String, required: true },
  courseText2: { type: String, required: true },
  courseText3: { type: String, required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'course',
    default: '',
    required: true,
  },
  coursePrice: { type: Number, required: true },
  coursePriceWithDiscount: { type: Number, default: 0, required: true },
  faqs: { type: [{ q: String, a: String }], default: [], required: true },
  videos: {
    type: [{ url: { type: String, required: true } }],
    default: [],
  },
  showTopForm: { type: Boolean, default: false },
  showBottomForm: { type: Boolean, default: false },
  showTelegramButton: { type: Boolean, default: false },
  showWatsupButton: { type: Boolean, default: false },
});

module.exports = {
  LandingModel: mongoose.model('Landing', LandingSchema),
};
