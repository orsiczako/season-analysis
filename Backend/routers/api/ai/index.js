/**
 * AI Routes 
 */

const express = require('express');
const router = express.Router();
const aiController = require('../../../controllers/ai.controller');
const { authenticateToken } = require('../../../service/middlewares/auth.middleware');

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

module.exports = router;
