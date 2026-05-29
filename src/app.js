const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Enlaces a los archivos de rutas correctos
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// CORRECCIÓN 1: Apuntar a la carpeta routes y no a middlewares
app.use('/api/products', require('./routes/productRoutes'));

// CORRECCIÓN 2: Agregar la ruta de categorías que faltaba
app.use('/api/categories', require('./routes/categoryRoutes'));

// Manejador para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

module.exports = app;