import {
    getAllProjects,
    getProjectById,
    insertProject,
    updateProjectById,
    deleteProjectById
  } from '../models/projectModel.js';
  import pool from '../db/pool.js';
  
  export const getProjects = async (_, res) => {
    try {
      const result = await getAllProjects();
      res.json(result.rows);
    } catch (err) {
      console.error('Fetch projects error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const getProject = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await getProjectById(id);
      if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const createProject = async (req, res) => {
    const { user_id, title, description = '', is_pinned = false } = req.body;
    try {
      const result = await insertProject(user_id, title, description, is_pinned);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Create project error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, is_pinned } = req.body;
    try {
      const result = await updateProjectById(id, title, description, is_pinned);
      if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Update project error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM tasks WHERE project_id = $1', [id]); // cleanup
      const result = await deleteProjectById(id);
      if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
      res.json({ message: 'Project deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  