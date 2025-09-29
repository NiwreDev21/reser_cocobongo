import React, { useState } from "react";
import ReservationForm from "./ReservationForm";
import { createReservation, updateTable } from "../services/api";

const TableGrid = ({ tables, reservations, onUpdate }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleTableClick = (table) => {
    // Verificar si la mesa está inactiva
    if (table.isActive === false) {
      alert(`Mesa ${table.tableNumber} está inactiva y no puede ser reservada`);
      return;
    }

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
    // Si la mesa está inactiva
    if (table.isActive === false) {
      return 'inactive';
    }
    
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
      case 'inactive': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'available': return 'Disponible';
      case 'inactive': return 'Inactiva';
      default: return 'Desconocido';
    }
  };

  const getLocationText = (location) => {
    switch (location) {
      case 'main': return 'Principal';
      case 'terrace': return 'Terraza';
      case 'vip': return 'VIP';
      default: return location;
    }
  };

  // Filtrar solo mesas activas para mostrar (opcional - puedes mostrar todas si prefieres)
  const activeTables = tables.filter(table => table.isActive !== false);

  return (
    <div className="table-grid-view">
      <div className="view-header">
        <h2>Vista de Mesas</h2>
        <p>Selecciona una mesa disponible para crear una reserva</p>
        <div className="view-stats">
          <span className="stat-item">
            Total: {tables.length} mesas
          </span>
          <span className="stat-item">
            Activas: {activeTables.length} mesas
          </span>
          <span className="stat-item">
            Disponibles: {activeTables.filter(t => getTableStatus(t) === 'available').length} mesas
          </span>
        </div>
      </div>

      <div className="tables-container">
        {tables.map(table => {
          const status = getTableStatus(table);
          const color = getTableColor(status);
          const isClickable = status === 'available' && table.isActive !== false;
          
          return (
            <div 
              key={table._id}
              className={`table-item ${status} ${isClickable ? 'clickable' : 'non-clickable'}`}
              style={{ backgroundColor: color }}
              onClick={() => isClickable && handleTableClick(table)}
              title={!isClickable ? 
                (status === 'inactive' ? 'Mesa inactiva' : `Mesa ${getStatusText(status).toLowerCase()}`) : 
                'Haz clic para reservar'
              }
            >
              <div className="table-number">Mesa {table.tableNumber}</div>
              <div className="table-capacity">Cap: {table.capacity}</div>
              <div className="table-location">{getLocationText(table.location)}</div>
              <div className="table-status">{getStatusText(status)}</div>
              {table.features && table.features.includes('premium') && (
                <div className="table-feature">⭐ Premium</div>
              )}
              {status === 'inactive' && (
                <div className="table-inactive-overlay">
                  <span>INACTIVA</span>
                </div>
              )}
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

      <style jsx>{`
        .table-grid-view {
          padding: 20px;
        }

        .view-header {
          margin-bottom: 30px;
        }

        .view-header h2 {
          color: #ccc9c9ff;
          margin-bottom: 10px;
        }

        .view-header p {
          color: #af9292ff;
          margin-bottom: 15px;
        }

        .view-stats {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .stat-item {
          background: #1e2225ff;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          color: #9ba4acff;
          border: 1px solid #e9ecef;
        }

        .tables-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .table-item {
          position: relative;
          padding: 20px 15px;
          border-radius: 12px;
          color: white;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-item.clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .table-item.non-clickable {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .table-item.inactive {
          background: linear-gradient(135deg, #95a5a6, #7b8a8b) !important;
        }

        .table-number {
          font-size: 1.4em;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .table-capacity {
          font-size: 1em;
          margin-bottom: 5px;
          opacity: 0.9;
        }

        .table-location {
          font-size: 0.9em;
          margin-bottom: 5px;
          opacity: 0.8;
          font-style: italic;
        }

        .table-status {
          font-size: 0.9em;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-feature {
          font-size: 0.8em;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 10px;
          margin-top: 5px;
          display: inline-block;
        }

        .table-inactive-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1em;
        }

      

        /* Leyenda de estados */
        .table-legend {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9em;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .tables-container {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
          }

          .table-item {
            padding: 15px 10px;
          }

          .table-number {
            font-size: 1.2em;
          }

          .view-stats {
            flex-direction: column;
            gap: 10px;
          }

          .stat-item {
            text-align: center;
          }
        }
      `}</style>

      {/* Leyenda de estados */}
      <div className="table-legend">
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#2f4e3cff'}}></div>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#f39c12'}}></div>
          <span>Reservada</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#e74c3c'}}></div>
          <span>Ocupada</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#95a5a6'}}></div>
          <span>Inactiva</span>
        </div>
      </div>
    </div>
  );
};

export default TableGrid;