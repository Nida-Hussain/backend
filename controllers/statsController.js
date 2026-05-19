const Note = require("../models/Note");
const Summary = require("../models/Summary");
const Quiz = require("../models/Quiz");

// @desc    Get dashboard statistics
// @route   GET /api/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalNotes, totalSummaries, totalQuizzes, recentQuizzes] =
      await Promise.all([
        Note.countDocuments({ user: userId }),
        Summary.countDocuments({ user: userId }),
        Quiz.countDocuments({ user: userId }),
        Quiz.find({ user: userId, isCompleted: true })
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    // Calculate average quiz score
    const completedQuizzes = await Quiz.find({
      user: userId,
      isCompleted: true,
    });

    const avgScore =
      completedQuizzes.length > 0
        ? Math.round(
            completedQuizzes.reduce(
              (acc, q) => acc + (q.score / q.totalQuestions) * 100,
              0
            ) / completedQuizzes.length
          )
        : 0;

    // Recent activity
    const [recentNotes, recentSummaries] = await Promise.all([
      Note.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
      Summary.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    const activity = [
      ...recentNotes.map((n) => ({
        type: "upload",
        title: n.title,
        date: n.createdAt,
      })),
      ...recentSummaries.map((s) => ({
        type: "summary",
        title: `Summary generated`,
        date: s.createdAt,
      })),
      ...recentQuizzes.map((q) => ({
        type: "quiz",
        title: `${q.title} - ${q.score}/${q.totalQuestions}`,
        date: q.createdAt,
      })),
    ]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    res.json({
      totalNotes,
      totalSummaries,
      totalQuizzes,
      avgScore,
      activity,
      quizHistory: recentQuizzes.map((q) => ({
        title: q.title,
        score: q.score,
        total: q.totalQuestions,
        date: q.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
