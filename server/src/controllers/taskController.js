import {
    getAllTasks,
    getTasksByProjectId,
    getTaskById,
    insertTask,
    updateTaskById,
    deleteTaskById
  } from '../models/taskModel.js';
  
  export const getTasks = async (_, res) => {
    try {
      const result = await getAllTasks();
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  export const getTasksByProject = async (req, res) => {
    const { projectId } = req.params;
    try {
      const result = await getTasksByProjectId(projectId);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const getTask = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await getTaskById(id);
      if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const createTask = async (req, res) => {
    const { project_id, task_name, priority = 'medium', due_date, is_completed = false } = req.body;
    try {
      const result = await insertTask(project_id, task_name, priority, due_date, is_completed);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Create task error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { task_name, priority = 'medium', due_date, is_completed } = req.body;
    try {
      const result = await updateTaskById(id, task_name, priority, due_date, is_completed);
      if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Update task error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await deleteTaskById(id);
      if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  