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
  features: [{ type: String }]
});

export default mongoose.model('Table', tableSchema);