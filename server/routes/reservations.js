import express from 'express';
import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';

const router = express.Router();

// GET todas las reservas
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
});

// GET una reserva por ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    res.json(reservation);
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    res.status(500).json({ message: 'Error al obtener la reserva' });
  }
});

// POST crear nueva reserva
router.post('/', async (req, res) => {
  try {
    // Validar datos requeridos
    const { clientName, clientPhone, guestCount, reservationTime, tableNumber } = req.body;
    
    if (!clientName || !clientPhone || !guestCount || !reservationTime || !tableNumber) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: clientName, clientPhone, guestCount, reservationTime, tableNumber' 
      });
    }

    // Verificar si la mesa existe y está activa
    const table = await Table.findOne({ 
      tableNumber: parseInt(tableNumber),
      isActive: { $ne: false }
    });
    if (!table) {
      return res.status(400).json({ message: 'La mesa seleccionada no existe o está inactiva' });
    }

    // Verificar si la mesa está disponible
    if (table.status !== 'available') {
      return res.status(400).json({ message: 'La mesa no está disponible' });
    }

    // Verificar si la fecha de reserva es válida
    const reservationDate = new Date(reservationTime);
    if (isNaN(reservationDate.getTime())) {
      return res.status(400).json({ message: 'Fecha de reserva inválida' });
    }

    // Verificar si la reserva es para una fecha futura
    if (reservationDate < new Date()) {
      return res.status(400).json({ message: 'La reserva debe ser para una fecha futura' });
    }

    // Verificar si ya existe una reserva para la misma mesa en un horario similar
    const existingReservation = await Reservation.findOne({
      tableNumber: parseInt(tableNumber),
      reservationTime: {
        $gte: new Date(reservationDate.getTime() - 2 * 60 * 60 * 1000), // 2 horas antes
        $lte: new Date(reservationDate.getTime() + 2 * 60 * 60 * 1000)  // 2 horas después
      },
      status: { $in: ['reserved', 'checked-in'] }
    });

    if (existingReservation) {
      return res.status(400).json({ 
        message: 'Ya existe una reserva para esta mesa en un horario similar' 
      });
    }

    // Crear la reserva
    const reservationData = {
      ...req.body,
      tableNumber: parseInt(tableNumber),
      guestCount: parseInt(guestCount)
    };
    
    const reservation = new Reservation(reservationData);
    const savedReservation = await reservation.save();

    // Actualizar el estado de la mesa
    await Table.findOneAndUpdate(
      { tableNumber: parseInt(tableNumber) },
      { status: 'reserved' }
    );
    
    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reservation: savedReservation
    });
  } catch (error) {
    console.error('Error creando reserva:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Error de validación',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ message: 'Error al crear la reserva' });
  }
});

// PUT actualizar reserva
router.put('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    res.json({
      message: 'Reserva actualizada exitosamente',
      reservation
    });
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    res.status(500).json({ message: 'Error al actualizar la reserva' });
  }
});

// DELETE eliminar reserva
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    // Liberar la mesa al eliminar la reserva
    await Table.findOneAndUpdate(
      { tableNumber: reservation.tableNumber },
      { status: 'available' }
    );
    
    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    res.status(500).json({ message: 'Error al eliminar la reserva' });
  }
});

export { router };