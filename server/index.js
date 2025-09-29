import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { router as reservationRoutes } from './routes/reservations.js';
import { router as tableRoutes } from './routes/tables.js';
import { router as notificationRoutes } from './routes/notifications.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS corregida
const corsOptions = {
  origin: [
    'https://reser-cocobov3.vercel.app', // Tu dominio en Vercel
    'http://localhost:5173', // Para desarrollo local (Vite)
    'http://127.0.0.1:5173', // Alternativa local
    'https://localhost:5173' // HTTPS local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));

// Middleware para manejar preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/notifications', notificationRoutes);

// Conexión a MongoDB Atlas - Con mejor manejo de errores
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reservations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout después de 5 segundos
  socketTimeoutMS: 45000, // Cierra sockets después de 45s de inactividad
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
  console.log('ℹ️  Verifica tu cadena de conexión MONGODB_URI en el archivo .env');
  process.exit(1); // Salir si no puede conectar a la DB
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Ruta de prueba mejorada
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a MongoDB
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando correctamente',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      cors: 'Configurado para Vercel y localhost'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error en el servidor',
      error: error.message 
    });
  }
});

// Ruta específica para probar CORS
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS está funcionando correctamente',
    allowedOrigins: [
      'https://reser-cocobov3.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://localhost:5173'
    ],
    timestamp: new Date().toISOString()
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Health check disponible en: http://localhost:${PORT}/api/health`);
  console.log(`🔧 CORS configurado para:`);
  console.log(`   - https://reser-cocobov3.vercel.app`);
  console.log(`   - http://localhost:5173`);
  console.log(`   - http://127.0.0.1:5173`);
  console.log(`   - https://localhost:5173`);
});