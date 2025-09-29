import mongoose from 'mongoose';
import Table from './models/Table.js';
import dotenv from 'dotenv';

dotenv.config();

const seedTables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Conectado a MongoDB Atlas');

    // Eliminar mesas existentes
    await Table.deleteMany({});
    console.log('Mesas existentes eliminadas');

    // Crear 50 mesas de ejemplo con diferentes capacidades y ubicaciones
    const tables = [];
    const locations = ['main', 'terrace', 'vip'];

    for (let i = 1; i <= 50; i++) {
      const capacity = i % 10 === 0 ? 8 : 
                       i % 5 === 0 ? 6 : 
                       i % 3 === 0 ? 4 : 2;
      
      const location = locations[Math.floor(Math.random() * locations.length)];
      const status = 'available';
      
      tables.push({
        tableNumber: i,
        capacity: capacity,
        location: location,
        status: status,
        features: capacity > 4 ? ['premium'] : ['standard'],
        isActive: true
      });
    }

    await Table.insertMany(tables);
    console.log('50 mesas creadas exitosamente');
    
    // Mostrar resumen
    const availableCount = await Table.countDocuments({ status: 'available' });
    const reservedCount = await Table.countDocuments({ status: 'reserved' });
    const occupiedCount = await Table.countDocuments({ status: 'occupied' });
    const activeCount = await Table.countDocuments({ isActive: true });
    
    console.log('\nResumen de mesas:');
    console.log(`Disponibles: ${availableCount}`);
    console.log(`Reservadas: ${reservedCount}`);
    console.log(`Ocupadas: ${occupiedCount}`);
    console.log(`Activas: ${activeCount}`);
    console.log(`Total: ${availableCount + reservedCount + occupiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creando mesas:', error);
    process.exit(1);
  }
};

seedTables();