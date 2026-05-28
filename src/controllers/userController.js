const pool = require('../config/db');

/* ══════════════════════════════════════════════
   GET /api/users/profile   🔒 Privada
══════════════════════════════════════════════ */
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ══════════════════════════════════════════════
   PUT /api/users/profile   🔒 Privada
══════════════════════════════════════════════ */
const updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, phone = $2
       WHERE id = $3
       RETURNING id, name, email, phone, avatar_url, created_at`,
      [name.trim(), phone || null, req.user.id]
    );

    res.json({
      message: 'Perfil actualizado.',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ══════════════════════════════════════════════
   GET /api/users/:id/products   Pública
══════════════════════════════════════════════ */
const getUserProducts = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.price, p.status, p.created_at,
              c.name AS category,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = true LIMIT 1) AS cover_image
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.user_id = $1 AND p.status = 'active'
       ORDER BY p.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getUserProducts error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { getProfile, updateProfile, getUserProducts };