const Quiz = require("../models/Quiz");
const Note = require("../models/Note");
const { generateContent } = require("../config/openrouter");

// @desc    Generate AI quiz from a note
// @route   POST /api/quizzes/generate/:noteId
exports.generateQuiz = async (req, res) => {
  try {
    const { difficulty = "medium", numberOfQuestions = 10 } = req.body;

    const note = await Note.findOne({
      _id: req.params.noteId,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const prompt = `Based on the following study notes, generate a quiz with exactly ${numberOfQuestions} questions.
Difficulty level: ${difficulty}

Create a mix of:
- Multiple Choice Questions (MCQ) with 4 options
- True/False questions

Format your response as a JSON array where each question has:
{
  "question": "question text",
  "options": ["A", "B", "C", "D"] (for MCQ) or ["True", "False"] (for T/F),
  "correctAnswer": "correct option text",
  "explanation": "why this is correct",
  "type": "mcq" or "truefalse"
}

Study Notes:
${note.extractedText}`;

    const response = await generateContent(prompt);

    let questions;
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      return res.status(500).json({ message: "Failed to parse quiz questions" });
    }

    const quiz = await Quiz.create({
      user: req.user._id,
      note: note._id,
      title: `Quiz: ${note.title}`,
      difficulty,
      questions,
      totalQuestions: questions.length,
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    quiz.score = score;
    quiz.totalAttempted = answers.length;
    quiz.timeTaken = timeTaken || 0;
    quiz.isCompleted = true;
    await quiz.save();

    res.json({
      score,
      total: quiz.totalQuestions,
      percentage: Math.round((score / quiz.totalQuestions) * 100),
      timeTaken: quiz.timeTaken,
      questions: quiz.questions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes for user
// @route   GET /api/quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id })
      .populate("note", "title")
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("note", "title");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    await quiz.deleteOne();
    res.json({ message: "Quiz deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
