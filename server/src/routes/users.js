import express from 'express';
import {
  getUsers,
  getUser,
  deleteUserById,
  createUser,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/users', getUsers);
router.get('/user/:id', getUser);
router.post('/users', createUser);
router.delete('/user/:id', deleteUserById);

export default router;
