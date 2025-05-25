import express from 'express';
import { summarizeTasks, chatWithAI, testGeminiAPI } from '../controllers/aiController.js';

const router = express.Router();

// Route to get AI summary of tasks for a project
router.get('/ai/summary/:projectId', summarizeTasks);

// Route to chat with AI about a project
router.post('/ai/chat/:projectId', chatWithAI);

// Test route for Gemini API
router.get('/ai/test', testGeminiAPI);

export default router;