const pool = require('../config/db');

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('getAll categories error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Exportamos la función directamente dentro de un objeto
module.exports = { getAllCategories };