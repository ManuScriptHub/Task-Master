import pool from '../db/pool.js';

export const insertUser = (name, email, password_hash) => {
  return pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, password_hash]
  );
};

export const getAllUsers = () => {
  return pool.query('SELECT id, name, email FROM users ORDER BY id ASC');
};


export const getUserById = (id) => {
  return pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
};

export const deleteUser = (id) => {
  return pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
};
