import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true },
  location: { 
    type: String, 
    enum: ['main', 'terrace', 'vip'],
    default: 'main'
  },
  status: { 
    type: String, 
    enum: ['available', 'reserved', 'occupied'],
    default: 'available'
  },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true } // Nuevo campo para activar/desactivar mesas
});

export default mongoose.model('Table', tableSchema);