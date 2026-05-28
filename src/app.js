const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());

// Hacer pública la carpeta de imágenes subidas para que sean accesibles vía URL
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Enlace de Rutas de la API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./middlewares/productRoutes'));

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

module.exports = app;