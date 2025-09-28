import mongoose from 'mongoose';
import Table from './models/Table.js';
import dotenv from 'dotenv';

dotenv.config();

const checkTables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const tables = await Table.find().sort({ tableNumber: 1 });
    
    console.log(`Total de mesas en la base de datos: ${tables.length}`);
    console.log('\nPrimeras 10 mesas:');
    
    tables.slice(0, 10).forEach(table => {
      console.log(`Mesa ${table.tableNumber}: Capacidad ${table.capacity}, Estado: ${table.status}, Ubicación: ${table.location}`);
    });
    
    const availableCount = tables.filter(t => t.status === 'available').length;
    console.log(`\nMesas disponibles: ${availableCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error verificando mesas:', error);
    process.exit(1);
  }
};

checkTables();