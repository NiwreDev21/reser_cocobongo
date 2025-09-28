import React, { useState } from "react";
import ReservationForm from "./ReservationForm";
import { createReservation, updateTable } from "../services/api";

const TableGrid = ({ tables, reservations, onUpdate }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleTableClick = (table) => {
    // Buscar si la mesa tiene reserva activa
    const activeReservation = reservations.find(
      res => res.tableNumber === table.tableNumber && 
      (res.status === 'reserved' || res.status === 'checked-in')
    );

    if (activeReservation) {
      alert(`Mesa ${table.tableNumber} reservada por ${activeReservation.clientName}`);
    } else {
      setSelectedTable(table);
      setShowForm(true);
    }
  };

  const handleReservationSubmit = async (reservationData) => {
    try {
      await createReservation({
        ...reservationData,
        tableNumber: selectedTable.tableNumber
      });
      
      // Actualizar estado de la mesa
      await updateTable(selectedTable._id, { status: 'reserved' });
      
      setShowForm(false);
      setSelectedTable(null);
      onUpdate(); // Actualizar datos
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Error al crear la reserva");
    }
  };

  const getTableStatus = (table) => {
    const reservation = reservations.find(
      res => res.tableNumber === table.tableNumber && 
      (res.status === 'reserved' || res.status === 'checked-in')
    );
    
    if (reservation) {
      return reservation.status === 'checked-in' ? 'occupied' : 'reserved';
    }
    return table.status;
  };

  const getTableColor = (status) => {
    switch (status) {
      case 'occupied': return '#e74c3c';
      case 'reserved': return '#f39c12';
      case 'available': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="table-grid-view">
      <div className="view-header">
        <h2>Gestión de Mesas</h2>
        <p>Selecciona una mesa para crear una reserva</p>
      </div>

      <div className="tables-container">
        {tables.map(table => {
          const status = getTableStatus(table);
          const color = getTableColor(status);
          
          return (
            <div 
              key={table._id}
              className="table-item"
              style={{ backgroundColor: color }}
              onClick={() => handleTableClick(table)}
            >
              <div className="table-number">{table.tableNumber}</div>
              <div className="table-capacity">Cap: {table.capacity}</div>
              <div className="table-status">{status === 'occupied' ? 'Ocupada' : status === 'reserved' ? 'Reservada' : 'Disponible'}</div>
            </div>
          );
        })}
      </div>

      {showForm && selectedTable && (
        <ReservationForm
          table={selectedTable}
          onSubmit={handleReservationSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
};

export default TableGrid;