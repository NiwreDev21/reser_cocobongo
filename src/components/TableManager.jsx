import React, { useState } from "react";
import { createTable, deleteTable, activateTable, getMaxTableNumber } from "../services/api";

const TableManager = ({ tables, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [newTableData, setNewTableData] = useState({
    tableNumber: "",
    capacity: "2",
    location: "main",
    features: ["standard"]
  });
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Función para obtener el siguiente número disponible
  const getNextTableNumber = async () => {
    try {
      const maxTableNumber = await getMaxTableNumber();
      return maxTableNumber + 1;
    } catch (error) {
      console.error("Error obteniendo número de mesa:", error);
      // Si falla, calcularlo localmente
      const maxTableNumber = tables.length > 0 
        ? Math.max(...tables.map(table => table.tableNumber))
        : 0;
      return maxTableNumber + 1;
    }
  };

  // Cuando se abre el formulario individual, sugerir el siguiente número
  const handleOpenAddForm = async () => {
    const nextNumber = await getNextTableNumber();
    setNewTableData(prev => ({
      ...prev,
      tableNumber: nextNumber.toString()
    }));
    setShowAddForm(true);
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createTable(newTableData);
      setShowAddForm(false);
      // Resetear con el siguiente número
      const nextNumber = await getNextTableNumber();
      setNewTableData({
        tableNumber: nextNumber.toString(),
        capacity: "2",
        location: "main",
        features: ["standard"]
      });
      onUpdate();
      alert("Mesa agregada exitosamente");
    } catch (error) {
      console.error("Error agregando mesa:", error);
      alert("Error al agregar la mesa: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateTables = async () => {
    setBulkLoading(true);
    
    try {
      // Obtener el siguiente número disponible automáticamente
      const startNumber = await getNextTableNumber();
      
      let createdCount = 0;
      const locations = ['main', 'terrace', 'vip'];
      
      console.log(`Creando mesas desde el número: ${startNumber}`);
      
      // Crear 50 mesas automáticamente
      for (let i = 0; i < 50; i++) {
        const tableNumber = startNumber + i;
        
        // Generar capacidad aleatoria
        const capacity = Math.random() < 0.6 ? 2 : 
                        Math.random() < 0.8 ? 4 : 
                        Math.random() < 0.95 ? 6 : 8;
        
        // Generar ubicación aleatoria
        const location = locations[Math.floor(Math.random() * locations.length)];
        
        // Generar características
        const features = capacity > 4 ? ['premium'] : ['standard'];
        
        try {
          await createTable({
            tableNumber: tableNumber,
            capacity: capacity,
            location: location,
            features: features
          });
          createdCount++;
          
          // Pequeña pausa cada 10 mesas para no sobrecargar
          if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Error creando mesa ${tableNumber}:`, error);
          // Continuar con la siguiente mesa aunque falle una
        }
      }
      
      setShowBulkCreate(false);
      onUpdate();
      alert(`Se crearon ${createdCount} mesas nuevas exitosamente (desde Mesa ${startNumber} hasta Mesa ${startNumber + 49})`);
    } catch (error) {
      console.error("Error en creación masiva:", error);
      alert("Error al crear las mesas automáticamente");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCreateSpecificTables = async () => {
    setBulkLoading(true);
    
    try {
      // Obtener el siguiente número disponible automáticamente
      const startNumber = await getNextTableNumber();
      
      let createdCount = 0;
      const locations = ['main', 'terrace', 'vip'];
      
      console.log(`Creando mesas balanceadas desde: ${startNumber}`);
      
      // Crear distribución específica de mesas
      const tableDistribution = [
        { count: 25, capacity: 2 },  // 25 mesas para 2 personas
        { count: 15, capacity: 4 },  // 15 mesas para 4 personas
        { count: 7, capacity: 6 },   // 7 mesas para 6 personas
        { count: 3, capacity: 8 }    // 3 mesas para 8 personas
      ];
      
      let currentTableNumber = startNumber;
      
      for (const distribution of tableDistribution) {
        for (let i = 0; i < distribution.count; i++) {
          // Generar ubicación aleatoria
          const location = locations[Math.floor(Math.random() * locations.length)];
          
          // Generar características
          const features = distribution.capacity > 4 ? ['premium'] : ['standard'];
          
          try {
            await createTable({
              tableNumber: currentTableNumber,
              capacity: distribution.capacity,
              location: location,
              features: features
            });
            createdCount++;
            currentTableNumber++;
            
            // Pequeña pausa cada 10 mesas
            if (createdCount % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(`Error creando mesa ${currentTableNumber}:`, error);
            currentTableNumber++;
          }
        }
      }
      
      setShowBulkCreate(false);
      onUpdate();
      alert(`Se crearon ${createdCount} mesas nuevas exitosamente (desde Mesa ${startNumber} hasta Mesa ${currentTableNumber - 1})`);
    } catch (error) {
      console.error("Error en creación específica:", error);
      alert("Error al crear las mesas automáticamente");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm("¿Estás seguro de que quieres desactivar esta mesa?")) {
      try {
        await deleteTable(tableId);
        onUpdate();
        alert("Mesa desactivada exitosamente");
      } catch (error) {
        console.error("Error desactivando mesa:", error);
        alert("Error al desactivar la mesa");
      }
    }
  };

  const handleActivateTable = async (tableId) => {
    try {
      await activateTable(tableId);
      onUpdate();
      alert("Mesa activada exitosamente");
    } catch (error) {
      console.error("Error activando mesa:", error);
      alert("Error al activar la mesa");
    }
  };

  const activeTables = tables.filter(table => table.isActive !== false);
  const inactiveTables = tables.filter(table => table.isActive === false);

  // Calcular distribución de mesas activas
  const tableStats = {
    total: activeTables.length,
    capacity2: activeTables.filter(t => t.capacity === 2).length,
    capacity4: activeTables.filter(t => t.capacity === 4).length,
    capacity6: activeTables.filter(t => t.capacity === 6).length,
    capacity8: activeTables.filter(t => t.capacity === 8).length,
    main: activeTables.filter(t => t.location === 'main').length,
    terrace: activeTables.filter(t => t.location === 'terrace').length,
    vip: activeTables.filter(t => t.location === 'vip').length
  };

  // Calcular el próximo número disponible para mostrar
  const nextAvailableNumber = tables.length > 0 
    ? Math.max(...tables.map(t => t.tableNumber)) + 1 
    : 1;

  return (
    <div className="table-manager">
      <div className="manager-header">
        <h2>Gestión de Mesas</h2>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={handleOpenAddForm}
          >
            + Agregar Mesa Individual
          </button>
          <button 
            className="btn-secondary"
            onClick={() => setShowBulkCreate(!showBulkCreate)}
          >
            🚀 Crear 50 Mesas Automáticamente
          </button>
        </div>
      </div>

      {/* Formulario para agregar mesa individual */}
      {showAddForm && (
        <div className="add-table-form">
          <h3>Agregar Nueva Mesa</h3>
          <div className="form-info">
            <p>💡 <strong>Número sugerido:</strong> {newTableData.tableNumber}</p>
          </div>
          <form onSubmit={handleAddTable}>
            <div className="form-row">
              <div className="form-group">
                <label>Número de Mesa *</label>
                <input
                  type="number"
                  value={newTableData.tableNumber}
                  onChange={(e) => setNewTableData({...newTableData, tableNumber: e.target.value})}
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Capacidad *</label>
                <select
                  value={newTableData.capacity}
                  onChange={(e) => setNewTableData({...newTableData, capacity: e.target.value})}
                  required
                >
                  <option value="2">2 personas</option>
                  <option value="4">4 personas</option>
                  <option value="6">6 personas</option>
                  <option value="8">8 personas</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <select
                  value={newTableData.location}
                  onChange={(e) => setNewTableData({...newTableData, location: e.target.value})}
                >
                  <option value="main">Salón Principal</option>
                  <option value="terrace">Terraza</option>
                  <option value="vip">Área VIP</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Agregando..." : "Agregar Mesa"}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Panel para creación masiva de mesas */}
      {showBulkCreate && (
        <div className="bulk-create-panel">
          <h3>Creación Masiva de Mesas</h3>
          <div className="bulk-info">
            <p><strong>📊 Información:</strong> Las mesas se crearán automáticamente con números consecutivos</p>
            <p><strong>🔢 Próximo número disponible:</strong> {nextAvailableNumber}</p>
            <p><strong>📈 Rango estimado:</strong> Desde {nextAvailableNumber} hasta {nextAvailableNumber + 49}</p>
          </div>
          
          <div className="bulk-options">
            <div className="option-card">
              <h4>🥗 Distribución Balanceada</h4>
              <p>25 mesas para 2 personas, 15 para 4, 7 para 6 y 3 para 8 personas</p>
              <button 
                onClick={handleCreateSpecificTables}
                disabled={bulkLoading}
                className="btn-primary"
              >
                {bulkLoading ? "Creando..." : "Crear 50 Mesas Balanceadas"}
              </button>
            </div>
            
            <div className="option-card">
              <h4>🎲 Distribución Aleatoria</h4>
              <p>50 mesas con capacidades y ubicaciones aleatorias</p>
              <button 
                onClick={handleBulkCreateTables}
                disabled={bulkLoading}
                className="btn-secondary"
              >
                {bulkLoading ? "Creando..." : "Crear 50 Mesas Aleatorias"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas de mesas */}
      <div className="tables-summary">
        <div className="summary-card">
          <h3>Total Mesas</h3>
          <p className="summary-number">{tables.length}</p>
        </div>
        <div className="summary-card">
          <h3>Mesas Activas</h3>
          <p className="summary-number">{activeTables.length}</p>
        </div>
        <div className="summary-card">
          <h3>Próximo Número</h3>
          <p className="summary-number">{nextAvailableNumber}</p>
        </div>
        <div className="summary-card">
          <h3>Meta</h3>
          <p className="summary-number">50</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${Math.min((activeTables.length / 50) * 100, 100)}%`}}
            ></div>
          </div>
        </div>
      </div>

      {/* Distribución de mesas */}
      <div className="distribution-section">
        <h3>Distribución Actual de Mesas Activas</h3>
        <div className="distribution-grid">
          <div className="dist-card">
            <h4>Por Capacidad</h4>
            <div className="dist-item">
              <span>2 personas:</span>
              <span>{tableStats.capacity2}</span>
            </div>
            <div className="dist-item">
              <span>4 personas:</span>
              <span>{tableStats.capacity4}</span>
            </div>
            <div className="dist-item">
              <span>6 personas:</span>
              <span>{tableStats.capacity6}</span>
            </div>
            <div className="dist-item">
              <span>8 personas:</span>
              <span>{tableStats.capacity8}</span>
            </div>
          </div>
          
          <div className="dist-card">
            <h4>Por Ubicación</h4>
            <div className="dist-item">
              <span>Salón Principal:</span>
              <span>{tableStats.main}</span>
            </div>
            <div className="dist-item">
              <span>Terraza:</span>
              <span>{tableStats.terrace}</span>
            </div>
            <div className="dist-item">
              <span>Área VIP:</span>
              <span>{tableStats.vip}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de mesas activas */}
      <div className="tables-section">
        <div className="section-header">
          <h3>Mesas Activas ({activeTables.length})</h3>
          <button 
            className="btn-small"
            onClick={() => setShowBulkCreate(true)}
          >
            + Agregar Más Mesas
          </button>
        </div>
        <div className="tables-grid">
          {activeTables.map(table => (
            <div key={table._id} className={`table-card ${table.status}`}>
              <div className="table-header">
                <h4>Mesa {table.tableNumber}</h4>
                <span className={`status-badge ${table.status}`}>
                  {table.status === 'available' ? 'Disponible' : 
                   table.status === 'reserved' ? 'Reservada' : 'Ocupada'}
                </span>
              </div>
              
              <div className="table-details">
                <p><strong>Capacidad:</strong> {table.capacity} personas</p>
                <p><strong>Ubicación:</strong> 
                  {table.location === 'main' ? ' Salón Principal' : 
                   table.location === 'terrace' ? ' Terraza' : ' Área VIP'}
                </p>
                <p><strong>Características:</strong> {table.features?.join(', ') || 'Estándar'}</p>
              </div>
              
              <div className="table-actions">
                <button 
                  onClick={() => handleDeleteTable(table._id)}
                  className="btn-danger"
                >
                  Desactivar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de mesas inactivas */}
      {inactiveTables.length > 0 && (
        <div className="tables-section">
          <h3>Mesas Inactivas ({inactiveTables.length})</h3>
          <div className="tables-grid">
            {inactiveTables.map(table => (
              <div key={table._id} className="table-card inactive">
                <div className="table-header">
                  <h4>Mesa {table.tableNumber}</h4>
                  <span className="status-badge inactive">Inactiva</span>
                </div>
                
                <div className="table-details">
                  <p><strong>Capacidad:</strong> {table.capacity} personas</p>
                  <p><strong>Ubicación:</strong> 
                    {table.location === 'main' ? ' Salón Principal' : 
                     table.location === 'terrace' ? ' Terraza' : ' Área VIP'}
                  </p>
                </div>
                
                <div className="table-actions">
                  <button 
                    onClick={() => handleActivateTable(table._id)}
                    className="btn-success"
                  >
                    Activar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .table-manager {
          padding: 20px;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-secondary {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-small {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }

        .add-table-form, .bulk-create-panel {
          background: #21262cff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #424643ff;
        }

        .form-info {
          background: #2d3748;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
          border-left: 4px solid #4299e1;
        }

        .form-info p {
          margin: 0;
          color: #bee3f8;
          font-size: 0.9em;
        }

        .bulk-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .option-card {
          background: #9f9ea3;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #637180ff;
        }

        .option-card h4 {
          margin-bottom: 10px;
          color: #0a1322ff;
        }

        .option-card p {
          color: #220b0bce;
          margin-bottom: 15px;
          font-size: 0.9em;
        }

        .bulk-info {
          background: #21262bff;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #2196f3;
          margin-bottom: 20px;
        }

        .bulk-info p {
          margin: 5px 0;
          color: #7f91a5ff;
        }

        .tables-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: #161a1dc0;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
        }

        .summary-number {
          font-size: 2em;
          font-weight: bold;
          margin: 10px 0 0 0;
          color: #82819bff;
        }

        .progress-bar {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          margin-top: 10px;
          overflow: hidden;
        }

        .progress-fill {
          background: #10b981;
          height: 100%;
          transition: width 0.3s ease;
        }

        .distribution-section {
          background: rgba(26, 21, 17, 1);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .distribution-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 15px;
        }

        .dist-card {
          background: #333c46ff;
          padding: 15px;
          border-radius: 6px;
        }

        .dist-card h4 {
          margin-bottom: 10px;
          color: #46bb5fff;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 5px;
        }

        .dist-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #f1f3f4;
        }

        .dist-item:last-child {
          border-bottom: none;
        }

        .tables-section {
          margin-bottom: 30px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .table-card {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 4px solid #4f46e5;
        }

        .table-card.available {
          border-left-color: #10b981;
        }

        .table-card.reserved {
          border-left-color: #f59e0b;
        }

        .table-card.occupied {
          border-left-color: #ef4444;
        }

        .table-card.inactive {
          border-left-color: #6b7280;
          opacity: 0.7;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .table-header h4 {
          margin: 0;
          color: #459132ff;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: bold;
          color: white;
        }

        .status-badge.available {
          background: #3c4441ff;
        }

        .status-badge.reserved {
          background: #f59e0b;
        }

        .status-badge.occupied {
          background: #ef4444;
        }

        .status-badge.inactive {
          background: #6b7280;
        }

        .table-details {
          margin-bottom: 15px;
        }

        .table-details p {
          margin: 5px 0;
          font-size: 0.9em;
          color: #c2b2b2ff;
        }

        .table-actions {
          display: flex;
          gap: 10px;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }

        .btn-success {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 5px;
          font-weight: bold;
          color: #faf3f3ff;
        }

        .form-group input, .form-group select {
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 1em;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .manager-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .header-actions {
            flex-direction: column;
          }
          
          .bulk-options {
            grid-template-columns: 1fr;
          }
          
          .distribution-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .tables-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TableManager;