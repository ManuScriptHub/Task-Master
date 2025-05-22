import pool from '../db/pool.js';

export const getAllTasks = () => {
  return pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
};

export const getTasksByProjectId = (project_id) => {
  return pool.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC', [project_id]);
};

export const getTaskById = (id) => {
  return pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
};

export const insertTask = (project_id, task_name, priority, due_date, is_completed) => {
  return pool.query(
    'INSERT INTO tasks (project_id, task_name, priority, due_date, is_completed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [project_id, task_name, priority, due_date, is_completed]
  );
};

export const updateTaskById = (id, task_name, priority, due_date, is_completed) => {
  return pool.query(
    'UPDATE tasks SET task_name = $1, priority = $2, due_date = $3, is_completed = $4 WHERE id = $5 RETURNING *',
    [task_name, priority, due_date, is_completed, id]
  );
};

export const deleteTaskById = (id) => {
  return pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
};
