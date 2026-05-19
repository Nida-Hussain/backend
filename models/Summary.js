const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    shortSummary: {
      type: String,
      required: true,
    },
    detailedSummary: {
      type: String,
      required: true,
    },
    keyPoints: [String],
    importantTopics: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", summarySchema);
