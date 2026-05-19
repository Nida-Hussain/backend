const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

// Avatar upload (protected + multer)
router.put("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;