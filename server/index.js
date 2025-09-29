import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { router as reservationRoutes } from './routes/reservations.js';
import { router as tableRoutes } from './routes/tables.js';
import { router as notificationRoutes } from './routes/notifications.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'https://reser-cocobov3.vercel.app/',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configuración de CORS
const corsOptions = {
  origin: [
    'https://reser-cocobov3.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/notifications', notificationRoutes);

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reservations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
  console.log('ℹ️  Verifica tu cadena de conexión MONGODB_URI en el archivo .env');
  process.exit(1);
});

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Usuario conectado:', socket.id);

  // Unirse a una sala específica para recibir actualizaciones
  socket.on('join-tables', () => {
    socket.join('tables-room');
    console.log(`Usuario ${socket.id} se unió a tables-room`);
  });

  socket.on('join-reservations', () => {
    socket.join('reservations-room');
    console.log(`Usuario ${socket.id} se unió a reservations-room`);
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado:', socket.id);
  });
});

// Función para emitir actualizaciones de mesas a todos los clientes
export const emitTableUpdate = async () => {
  try {
    const Table = (await import('./models/Table.js')).default;
    const allTables = await Table.find({ isActive: { $ne: false } }).sort({ tableNumber: 1 });
    io.to('tables-room').emit('table-updated', allTables);
    console.log('📢 Actualización de mesas enviada a todos los clientes');
  } catch (error) {
    console.error('Error emitiendo actualización de mesas:', error);
  }
};

// Función para emitir actualizaciones de reservas
export const emitReservationUpdate = async () => {
  try {
    const Reservation = (await import('./models/Reservation.js')).default;
    const allReservations = await Reservation.find().sort({ createdAt: -1 });
    io.to('reservations-room').emit('reservation-updated', allReservations);
    console.log('📢 Actualización de reservas enviada a todos los clientes');
  } catch (error) {
    console.error('Error emitiendo actualización de reservas:', error);
  }
};

// Middleware para agregar io a las requests
app.use((req, res, next) => {
  req.io = io;
  next();
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
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const socketConnections = io.engine.clientsCount;
    
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando correctamente',
      database: dbStatus,
      websockets: {
        connected: socketConnections,
        enabled: true
      },
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
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🔌 WebSockets habilitados para tiempo real`);
  console.log(`🌐 Health check disponible en: http://localhost:${PORT}/api/health`);
  console.log(`🔧 CORS configurado para:`);
  console.log(`   - https://reser-cocobov3.vercel.app`);
  console.log(`   - http://localhost:5173`);
  console.log(`   - http://127.0.0.1:5173`);
  console.log(`   - https://localhost:5173`);
});

export default app;