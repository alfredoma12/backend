/**
 * validate(fields) — fábrica de middlewares para validar campos requeridos.
 * Uso: router.post('/ruta', validate(['campo1', 'campo2']), controller)
 */
const validate = (fields) => (req, res, next) => {
  const missing = fields.filter((f) => {
    const val = req.body[f];
    return val === undefined || val === null || val === '';
  });

  if (missing.length > 0) {
    return res.status(400).json({
      error: `Campos requeridos faltantes: ${missing.join(', ')}`,
    });
  }

  next();
};

/**
 * validateEmail — verifica formato de email básico.
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido.' });
  }
  next();
};

/**
 * validatePrice — verifica que el precio sea un número positivo.
 */
const validatePrice = (req, res, next) => {
  const { price } = req.body;
  if (price !== undefined && (isNaN(price) || Number(price) <= 0)) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo.' });
  }
  next();
};

module.exports = { validate, validateEmail, validatePrice };