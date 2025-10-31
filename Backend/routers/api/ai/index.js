/**
 * AI Routes 
 */

const express = require('express');
const router = express.Router();
const aiController = require('../../../controllers/ai.controller');
const { authenticateToken } = require('../../../service/middlewares/auth.middleware');

/**
 * POST /api/ai/chat
 * Minden route előtt jwt ellenőrzés
 */
router.post('/chat', authenticateToken, (req, res) => {
  aiController.chatWithAI(req, res);
});

/**
 * POST /api/ai/analyze-color
 *
 */
router.post('/analyze-color', authenticateToken, (req, res) => {
  aiController.analyzeColorType(req, res);
});

module.exports = router;
