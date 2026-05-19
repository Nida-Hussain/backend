const Note = require("../models/Note");
const cloudinary = require("../config/cloudinary");
const { extractTextFromFile } = require("../utils/extractText");

// @desc    Upload a note
// @route   POST /api/notes
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const { title, description, category, tags } = req.body;

    // Upload to Cloudinary
    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "studybuddy/notes",
      resource_type: "raw",
    });

    // Extract text from file
    const extractedText = extractTextFromFile(req.file.buffer, req.file.mimetype);

    // Determine file type
    const ext = req.file.originalname.split(".").pop().toLowerCase();

    const note = await Note.create({
      user: req.user._id,
      title: title || req.file.originalname,
      description: description || "",
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      fileType: ext,
      fileSize: req.file.size,
      extractedText,
      category: category || "General",
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notes for user
// @route   GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(note.filePublicId, { resource_type: "raw" });

    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
