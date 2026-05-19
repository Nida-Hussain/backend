const express = require("express");
const router = express.Router();
const {
  uploadNote,
  getNotes,
  getNote,
  deleteNote,
} = require("../controllers/noteController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router
  .route("/")
  .get(protect, getNotes)
  .post(protect, upload.single("file"), uploadNote);

router.route("/:id").get(protect, getNote).delete(protect, deleteNote);

module.exports = router;
