const Summary = require("../models/Summary");
const Note = require("../models/Note");
const { generateContent } = require("../config/openrouter");

// @desc    Generate AI summary for a note
// @route   POST /api/summaries/generate/:noteId
exports.generateSummary = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const prompt = `Analyze the following study notes and provide:
1. A SHORT SUMMARY (2-3 sentences)
2. A DETAILED SUMMARY (comprehensive, covering all key concepts)
3. KEY POINTS (bullet points of the most important facts/concepts)
4. IMPORTANT TOPICS (main subjects/topics covered)

Format your response as JSON with keys: shortSummary, detailedSummary, keyPoints (array), importantTopics (array)

Study Notes:
${note.extractedText}`;

    const response = await generateContent(prompt);

    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      parsed = {
        shortSummary: response.substring(0, 200),
        detailedSummary: response,
        keyPoints: ["Summary generated - see detailed summary"],
        importantTopics: [note.category || "General"],
      };
    }

    const summary = await Summary.create({
      user: req.user._id,
      note: note._id,
      shortSummary: parsed.shortSummary,
      detailedSummary: parsed.detailedSummary,
      keyPoints: parsed.keyPoints || [],
      importantTopics: parsed.importantTopics || [],
    });

    res.status(201).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all summaries for user
// @route   GET /api/summaries
exports.getSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ user: req.user._id })
      .populate("note", "title fileUrl")
      .sort({ createdAt: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single summary
// @route   GET /api/summaries/:id
exports.getSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("note", "title fileUrl");

    if (!summary) {
      return res.status(404).json({ message: "Summary not found" });
    }

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a summary
// @route   DELETE /api/summaries/:id
exports.deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!summary) {
      return res.status(404).json({ message: "Summary not found" });
    }

    await summary.deleteOne();
    res.json({ message: "Summary deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
