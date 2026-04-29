const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { analyzeReport } = require('../controllers/aiController');
const { getHomeRemedies } = require('../controllers/homeRemediesController');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /\.(png|jpg|jpeg|bmp|tiff|webp)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (PNG, JPG, BMP, TIFF, WebP) are supported.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// @route   POST /api/ai/analyze-report
// @desc    Upload medical report and get AI analysis
// @access  Protected
router.post('/analyze-report', protect, upload.single('report'), analyzeReport);

// @route   POST /api/ai/home-remedies
// @desc    Get AI-powered safe home remedies for symptoms
// @access  Public (pre-consultation guidance)
router.post('/home-remedies', getHomeRemedies);

module.exports = router;
