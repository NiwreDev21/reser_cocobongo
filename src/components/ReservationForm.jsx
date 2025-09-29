import React, { useState } from "react";

const ReservationForm = ({ table, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    guestCount: table.capacity,
    reservationTime: new Date().toISOString().slice(0, 16),
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Reservar Mesa #{table.tableNumber}</h3>
        
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-group">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Número de Invitados</label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              min="1"
              max={table.capacity}
              required
            />
            <span className="input-help">Máximo: {table.capacity}</span>
          </div>
          
          <div className="form-group">
            <label>Fecha y Hora</label>
            <input
              type="datetime-local"
              name="reservationTime"
              value={formData.reservationTime}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Notas (opcional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel}>Cancelar</button>
            <button type="submit">Confirmar Reserva</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;