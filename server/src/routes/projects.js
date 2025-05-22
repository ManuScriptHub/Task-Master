import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';

const router = express.Router();

router.get('/projects', verifyToken, getProjects);
router.get('/project/:id', verifyToken, getProject);
router.post('/projects', verifyToken, createProject);
router.put('/project/:id', verifyToken, updateProject);
router.delete('/project/:id', verifyToken, deleteProject);

export default router;
