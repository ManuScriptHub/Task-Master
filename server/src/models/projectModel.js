import pool from '../db/pool.js';

export const getAllProjects = () => {
  return pool.query('SELECT * FROM projects ORDER BY is_pinned DESC, created_at DESC');
};

export const getProjectById = (id) => {
  return pool.query('SELECT * FROM projects WHERE id = $1', [id]);
};

export const insertProject = (user_id, title, description, is_pinned) => {
  return pool.query(
    'INSERT INTO projects (user_id, title, description, is_pinned) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, title, description, is_pinned]
  );
};

export const updateProjectById = (id, title, description, is_pinned) => {
  return pool.query(
    'UPDATE projects SET title = $1, description = $2, is_pinned = $3 WHERE id = $4 RETURNING *',
    [title, description, is_pinned, id]
  );
};

export const deleteProjectById = (id) => {
  return pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
};
