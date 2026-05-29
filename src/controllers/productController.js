const pool = require('../config/db');

const getAll = async (req, res) => {
  const { search = '', category, sort = 'newest', page = 1, limit = 12 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let orderBy = 'p.created_at DESC';
  if (sort === 'price_asc')  orderBy = 'p.price ASC';
  if (sort === 'price_desc') orderBy = 'p.price DESC';

  try {
    let conditions = ["p.status = 'active'"];
    const params   = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    if (category) {
      params.push(category);
      conditions.push(`p.category_id = $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products p WHERE ${where}`,
      params
    );

    params.push(Number(limit), offset);

    const result = await pool.query(
      `SELECT
         p.id, p.title, p.price, p.stock, p.created_at,
         c.name AS category,
         u.name AS seller,
         (SELECT image_url FROM product_images
          WHERE product_id = p.id AND is_cover = true LIMIT 1) AS cover_image
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN users u ON u.id = p.user_id
       WHERE ${where}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      total:    Number(countResult.rows[0].count),
      page:     Number(page),
      limit:    Number(limit),
      products: result.rows,
    });
  } catch (err) {
    console.error('getAll products error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


const getMine = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.id, p.title, p.price, p.stock, p.status, p.created_at,
         c.name AS category,
         (SELECT image_url FROM product_images
          WHERE product_id = p.id AND is_cover = true LIMIT 1) AS cover_image
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getMine error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         p.id, p.title, p.description, p.price, p.stock, p.status, p.created_at,
         json_build_object('id', c.id, 'name', c.name) AS category,
         json_build_object('id', u.id, 'name', u.name, 'created_at', u.created_at) AS seller
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const images = await pool.query(
      'SELECT image_url, is_cover FROM product_images WHERE product_id = $1 ORDER BY is_cover DESC',
      [id]
    );

    const product = result.rows[0];
    product.images = images.rows.map((i) => i.image_url);

    res.json(product);
  } catch (err) {
    console.error('getById error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


const create = async (req, res) => {
  const { title, description, price, stock = 1, category_id } = req.body;
  
  // ✅ CORRECCIÓN: Multer .single('image') inyecta el archivo en req.file (singular)
  const file = req.file;

  try {
    const result = await pool.query(
      `INSERT INTO products (user_id, category_id, title, description, price, stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, category_id || null, title.trim(), description || '', price, stock]
    );

    const product = result.rows[0];

    // ✅ CORRECCIÓN: Validamos si el usuario adjuntó una imagen antes de registrarla en la BD
    if (file) {
      const imageUrl = `/uploads/${file.filename}`;
      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_cover) VALUES ($1, $2, $3)',
        [product.id, imageUrl, true]
      );
    }

    res.status(201).json({
      message: 'Publicación creada exitosamente.',
      product: { id: product.id, title: product.title, price: product.price },
    });
  } catch (err) {
    console.error('create product error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


const update = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, stock, status, category_id } = req.body;

  try {
    const check = await pool.query(
      'SELECT user_id FROM products WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    if (check.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este producto.' });
    }

    const result = await pool.query(
      `UPDATE products
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           price       = COALESCE($3, price),
           stock       = COALESCE($4, stock),
           status      = COALESCE($5, status),
           category_id = COALESCE($6, category_id)
       WHERE id = $7
       RETURNING *`,
      [title, description, price, stock, status, category_id, id]
    );

    res.json({
      message: 'Publicación actualizada.',
      product: result.rows[0],
    });
  } catch (err) {
    console.error('update product error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      'SELECT user_id FROM products WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    if (check.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto.' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    res.json({ message: 'Publicación eliminada exitosamente.' });
  } catch (err) {
    console.error('remove product error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { 
  getAllProducts: getAll, 
  getMineProducts: getMine, 
  getProductById: getById, 
  createProduct: create, 
  updateProduct: update, 
  deleteProduct: remove 
};