const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: "" },
  type: {
    type: String,
    enum: ["mcq", "truefalse"],
    default: "mcq",
  },
});

const quizSchema = new mongoose.Schema(
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
    title: {
      type: String,
      default: "Quiz",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    questions: [questionSchema],
    totalQuestions: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalAttempted: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
