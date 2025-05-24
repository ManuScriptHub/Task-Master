import express from 'express';
import {
  getTasks,
  getTasksByProject,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion
} from '../controllers/taskController.js';

const router = express.Router();

router.get('/tasks', getTasks);
router.get('/task/:id', getTask);
router.get('/tasks/:projectId', getTasksByProject);
router.post('/tasks', createTask);
router.put('/task/:id', updateTask);
router.delete('/task/:id', deleteTask);
// New route for toggling task completion status
router.patch('/task/:id/toggle-completion', toggleTaskCompletion);

export default router;
