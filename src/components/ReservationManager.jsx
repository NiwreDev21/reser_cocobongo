import React, { useState } from "react";
import { updateReservation, deleteReservation, sendWhatsAppNotification } from "../services/api";

const ReservationManager = ({ reservations, onUpdate }) => {
  const [filter, setFilter] = useState("all");
  const [editingReservation, setEditingReservation] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [notificationMessage, setNotificationMessage] = useState("");

  const filteredReservations = reservations.filter(res => {
    if (filter === "all") return true;
    return res.status === filter;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateReservation(id, { status: newStatus });
      
      // Si se cancela una reserva, liberar la mesa
      if (newStatus === 'cancelled') {
        // Aquí iría la lógica para liberar la mesa
        console.log("Mesa liberada debido a cancelación");
      }
      
      onUpdate();
      alert("Estado de reserva actualizado correctamente");
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Error al actualizar la reserva");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar permanentemente esta reserva?")) {
      try {
        await deleteReservation(id);
        onUpdate();
        alert("Reserva eliminada correctamente");
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
      notes: reservation.notes,
      status: reservation.status
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
      alert("Reserva actualizada correctamente");
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Error al actualizar la reserva");
    }
  };

  const handleCancelEdit = () => {
    setEditingReservation(null);
  };

  const handleSendNotification = async (reservation) => {
    if (!notificationMessage.trim()) {
      alert("Por favor, ingrese un mensaje para enviar");
      return;
    }

    try {
      await sendWhatsAppNotification({
        phone: reservation.clientPhone,
        message: notificationMessage,
        reservationId: reservation._id
      });
      alert("Notificación enviada correctamente");
      setNotificationMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Error al enviar la notificación");
    }
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
    <div className="reservation-manager">
      <div className="view-header">
        <h2>Gestión de Reservas</h2>
        <div className="manager-controls">
          <div className="filter-controls">
            <label>Filtrar por estado:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todas las reservas</option>
              <option value="reserved">Reservadas</option>
              <option value="checked-in">Ocupadas</option>
              <option value="checked-out">Finalizadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          <div className="notification-controls">
            <input
              type="text"
              placeholder="Mensaje para notificación..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="reservations-table-container">
        <table className="reservations-table">
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
                        title="Editar reserva"
                      >
                        ✏️
                      </button>
                      
                      {reservation.status === 'reserved' && (
                        <button 
                          onClick={() => handleStatusChange(reservation._id, 'checked-in')}
                          className="btn-success"
                          title="Marcar como ocupada"
                        >
                          ✅
                        </button>
                      )}
                      
                      {reservation.status === 'checked-in' && (
                        <button 
                          onClick={() => handleStatusChange(reservation._id, 'checked-out')}
                          className="btn-info"
                          title="Marcar como finalizada"
                        >
                          🏁
                        </button>
                      )}
                      
                      {(reservation.status === 'reserved' || reservation.status === 'checked-in') && (
                        <button 
                          onClick={() => handleStatusChange(reservation._id, 'cancelled')}
                          className="btn-warning"
                          title="Cancelar reserva"
                        >
                          ❌
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleSendNotification(reservation)}
                        className="btn-notify"
                        title="Enviar notificación"
                      >
                        📱
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(reservation._id)}
                        className="btn-danger"
                        title="Eliminar reserva"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                
                {editingReservation === reservation._id && (
                  <tr className="edit-row">
                    <td colSpan="7">
                      <div className="edit-form-container">
                        <h3>Editando Reserva #{reservation.tableNumber}</h3>
                        <form onSubmit={handleEditFormSubmit} className="edit-form">
                          <div className="form-row">
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
                          </div>
                          
                          <div className="form-row">
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
                              <label>Estado</label>
                              <select
                                name="status"
                                value={editFormData.status}
                                onChange={handleEditFormChange}
                              >
                                <option value="reserved">Reservada</option>
                                <option value="checked-in">Ocupada</option>
                                <option value="checked-out">Finalizada</option>
                                <option value="cancelled">Cancelada</option>
                              </select>
                            </div>
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
                            <button type="submit" className="btn-save">Guardar Cambios</button>
                            <button type="button" onClick={handleCancelEdit} className="btn-cancel">Cancelar</button>
                          </div>
                        </form>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {filteredReservations.length === 0 && (
          <div className="empty-state">
            <p>No hay reservas que coincidan con el filtro seleccionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManager;