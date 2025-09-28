import React, { useState } from "react";
import { updateReservation, deleteReservation } from "../services/api";

const ReservationList = ({ reservations, onUpdate }) => {
  const [filter, setFilter] = useState("all");
  const [editingReservation, setEditingReservation] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const filteredReservations = reservations.filter(res => {
    if (filter === "all") return true;
    return res.status === filter;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateReservation(id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Error al actualizar la reserva");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      try {
        await deleteReservation(id);
        onUpdate();
      } catch (error) {
        console.error("Error deleting reservation:", error);
        alert("Error al eliminar la reserva");
      }
    }
  };

  const handleEditClick = (reservation) => {
    setEditingReservation(reservation._id);
    setEditFormData({
      clientName: reservation.clientName,
      clientPhone: reservation.clientPhone,
      guestCount: reservation.guestCount,
      reservationTime: new Date(reservation.reservationTime).toISOString().slice(0, 16),
      notes: reservation.notes
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateReservation(editingReservation, editFormData);
      setEditingReservation(null);
      onUpdate();
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Error al actualizar la reserva");
    }
  };

  const handleCancelEdit = () => {
    setEditingReservation(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reserved': return '#f39c12';
      case 'checked-in': return '#2ecc71';
      case 'checked-out': return '#3498db';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reserved': return 'Reservada';
      case 'checked-in': return 'Ocupada';
      case 'checked-out': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="reservation-list-view">
      <div className="view-header">
        <h2>Gestión de Reservas</h2>
        <div className="filter-controls">
          <label>Filtrar por estado:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="reserved">Reservadas</option>
            <option value="checked-in">Ocupadas</option>
            <option value="checked-out">Finalizadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      <div className="reservations-table">
        <table>
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Invitados</th>
              <th>Fecha/Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map(reservation => (
              <React.Fragment key={reservation._id}>
                <tr>
                  <td>{reservation.tableNumber}</td>
                  <td>{reservation.clientName}</td>
                  <td>{reservation.clientPhone}</td>
                  <td>{reservation.guestCount}</td>
                  <td>{new Date(reservation.reservationTime).toLocaleString()}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(reservation.status) }}
                    >
                      {getStatusText(reservation.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditClick(reservation)}
                        className="btn-edit"
                      >
                        Editar
                      </button>
                      {reservation.status === 'reserved' && (
                        <button 
                          onClick={() => handleStatusChange(reservation._id, 'checked-in')}
                          className="btn-success"
                        >
                          Check-in
                        </button>
                      )}
                      {reservation.status === 'checked-in' && (
                        <button 
                          onClick={() => handleStatusChange(reservation._id, 'checked-out')}
                          className="btn-info"
                        >
                          Check-out
                        </button>
                      )}
                      {(reservation.status === 'reserved' || reservation.status === 'checked-in') && (
                        <button 
                          onClick={() => handleStatusChange(reservation._id, 'cancelled')}
                          className="btn-warning"
                        >
                          Cancelar
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(reservation._id)}
                        className="btn-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
                {editingReservation === reservation._id && (
                  <tr>
                    <td colSpan="7">
                      <form onSubmit={handleEditFormSubmit} className="edit-form">
                        <h3>Editar Reserva</h3>
                        <div className="form-group">
                          <label>Nombre del Cliente</label>
                          <input
                            type="text"
                            name="clientName"
                            value={editFormData.clientName}
                            onChange={handleEditFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Teléfono</label>
                          <input
                            type="tel"
                            name="clientPhone"
                            value={editFormData.clientPhone}
                            onChange={handleEditFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Número de Invitados</label>
                          <input
                            type="number"
                            name="guestCount"
                            value={editFormData.guestCount}
                            onChange={handleEditFormChange}
                            min="1"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Fecha y Hora</label>
                          <input
                            type="datetime-local"
                            name="reservationTime"
                            value={editFormData.reservationTime}
                            onChange={handleEditFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Notas</label>
                          <textarea
                            name="notes"
                            value={editFormData.notes}
                            onChange={handleEditFormChange}
                            rows="3"
                          />
                        </div>
                        <div className="form-actions">
                          <button type="submit">Guardar</button>
                          <button type="button" onClick={handleCancelEdit}>Cancelar</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationList;