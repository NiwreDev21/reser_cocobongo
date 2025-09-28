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
      capacity: { $gte: capacity }
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

export default router;