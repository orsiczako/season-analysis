/**
 * AI Routes 
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const aiController = require('../../../controllers/ai.controller');
const { authenticateToken } = require('../../../service/middlewares/auth.middleware');

// Multer konfiguráció - memória tárolás (nem mentjük a képet diszkre)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

/**
 * POST /api/ai/chat
 * Regisztrált felhasználóknak - JWT token szükséges
 */
router.post('/chat', authenticateToken, (req, res) => {
  aiController.chatWithAI(req, res);
});

/**
 * POST /api/ai/chat-guest
 * Vendég módban - authentication nélkül
 */
router.post('/chat-guest', (req, res) => {
  aiController.chatWithAIGuest(req, res);
});

/**
 * POST /api/ai/analyze-color
 * Kötelező auth - csak bejelentkezett felhasználóknak
 */
router.post('/analyze-color', authenticateToken, (req, res) => {
  aiController.analyzeColorType(req, res);
});

/**
 * POST /api/ai/chat-with-image
 * Kép alapú chat - kamera módhoz (Frame Snapshotting)
 * A frontend Base64 formátumban küldi a képet
 */
router.post('/chat-with-image', authenticateToken, (req, res) => {
  aiController.chatWithImage(req, res);
});

/**
 * POST /api/ai/analyze-skin
 * Bőrelemzés képfeltöltéssel - csak bejelentkezett felhasználóknak
 * A kép NEM kerül tárolásra - csak az elemzés idejére létezik
 */
router.post('/analyze-skin', authenticateToken, upload.single('image'), (err, req, res, next) => {
  // Multer error handling
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      errorCode: 'MULTER_ERROR'
    });
  } else if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message,
      errorCode: 'UPLOAD_ERROR'
    });
  }
  next();
}, (req, res) => {
  aiController.analyzeSkin(req, res);
});

module.exports = router;
