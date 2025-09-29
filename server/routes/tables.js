import express from 'express';
import Table from '../models/Table.js';

const router = express.Router();

// GET todas las mesas
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    console.error('Error obteniendo mesas:', error);
    res.status(500).json({ message: 'Error al obtener las mesas' });
  }
});

// GET mesas disponibles por capacidad
router.get('/available/:capacity', async (req, res) => {
  try {
    const capacity = parseInt(req.params.capacity);
    const tables = await Table.find({
      status: 'available',
      capacity: { $gte: capacity },
      isActive: { $ne: false }
    }).sort({ tableNumber: 1 });
    
    res.json(tables);
  } catch (error) {
    console.error('Error obteniendo mesas disponibles:', error);
    res.status(500).json({ message: 'Error al obtener las mesas disponibles' });
  }
});

// GET una mesa por ID
router.get('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    res.json(table);
  } catch (error) {
    console.error('Error obteniendo mesa:', error);
    res.status(500).json({ message: 'Error al obtener la mesa' });
  }
});

// PUT actualizar mesa
router.put('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    
    res.json({
      message: 'Mesa actualizada exitosamente',
      table
    });
  } catch (error) {
    console.error('Error actualizando mesa:', error);
    res.status(500).json({ message: 'Error al actualizar la mesa' });
  }
});

// POST crear nueva mesa
router.post('/', async (req, res) => {
  try {
    const { tableNumber, capacity, location, features } = req.body;
    
    // Validar datos requeridos
    if (!tableNumber || !capacity) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: tableNumber, capacity' 
      });
    }

    // Verificar si el número de mesa ya existe
    const existingTable = await Table.findOne({ tableNumber: parseInt(tableNumber) });
    if (existingTable) {
      return res.status(400).json({ message: 'El número de mesa ya existe' });
    }

    // Crear la nueva mesa
    const tableData = {
      tableNumber: parseInt(tableNumber),
      capacity: parseInt(capacity),
      location: location || 'main',
      features: features || ['standard'],
      status: 'available',
      isActive: true
    };
    
    const table = new Table(tableData);
    const savedTable = await table.save();

    res.status(201).json({
      message: 'Mesa creada exitosamente',
      table: savedTable
    });
  } catch (error) {
    console.error('Error creando mesa:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Error de validación',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ message: 'Error al crear la mesa' });
  }
});

// DELETE eliminar mesa (marcar como inactiva)
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    
    res.json({ 
      message: 'Mesa desactivada correctamente',
      table 
    });
  } catch (error) {
    console.error('Error desactivando mesa:', error);
    res.status(500).json({ message: 'Error al desactivar la mesa' });
  }
});
// GET obtener el número máximo de mesa
router.get('/max-table-number', async (req, res) => {
  try {
    const maxTable = await Table.findOne()
      .sort({ tableNumber: -1 })
      .select('tableNumber');
    
    const maxTableNumber = maxTable ? maxTable.tableNumber : 0;
    
    res.json({ maxTableNumber });
  } catch (error) {
    console.error('Error obteniendo número máximo de mesa:', error);
    res.status(500).json({ message: 'Error al obtener el número máximo de mesa' });
  }
});

// GET mesas activas (para mostrar solo mesas activas)
router.get('/active/all', async (req, res) => {
  try {
    const tables = await Table.find({ isActive: { $ne: false } }).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    console.error('Error obteniendo mesas activas:', error);
    res.status(500).json({ message: 'Error al obtener las mesas activas' });
  }
});

// PUT activar mesa
router.put('/:id/activate', async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { isActive: true, status: 'available' },
      { new: true }
    );
    
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    
    res.json({
      message: 'Mesa activada exitosamente',
      table
    });
  } catch (error) {
    console.error('Error activando mesa:', error);
    res.status(500).json({ message: 'Error al activar la mesa' });
  }
});

export { router };