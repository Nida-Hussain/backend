const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "doc", "docx", "txt"],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
