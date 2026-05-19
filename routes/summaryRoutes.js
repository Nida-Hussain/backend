const express = require("express");
const router = express.Router();
const {
  generateSummary,
  getSummaries,
  getSummary,
  deleteSummary,
} = require("../controllers/summaryController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getSummaries);
router.post("/generate/:noteId", protect, generateSummary);
router.route("/:id").get(protect, getSummary).delete(protect, deleteSummary);

module.exports = router;
