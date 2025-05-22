import { getAllUsers, getUserById, insertUser, deleteUser } from '../models/userModel.js';
import bcrypt from 'bcrypt';

export const getUsers = async (_, res) => {
  try {
    const result = await getAllUsers();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await getUserById(id);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await insertUser(name, email, hashedPassword);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteUser(id);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
