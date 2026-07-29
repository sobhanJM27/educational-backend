const mongoose  = require("mongoose");

const RedirectSchema = new mongoose.Schema(
  {
    oldUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    newUrl: {
      type: String,
      required: true,
      trim: true,
    },

    statusCode: {
      type: Number,
      default: 301,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const RedirectModel = mongoose.model("redirect", RedirectSchema);

module.exports = {
  RedirectModel,
};