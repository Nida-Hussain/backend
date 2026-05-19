const express = require("express");
const router = express.Router();
const {
  generateQuiz,
  submitQuiz,
  getQuizzes,
  getQuiz,
  deleteQuiz,
} = require("../controllers/quizController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getQuizzes);
router.post("/generate/:noteId", protect, generateQuiz);
router.post("/:id/submit", protect, submitQuiz);
router.route("/:id").get(protect, getQuiz).delete(protect, deleteQuiz);

module.exports = router;
