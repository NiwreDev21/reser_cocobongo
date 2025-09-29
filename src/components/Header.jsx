import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ onRefresh, onLogout, activeView, setActiveView, reservations, tables }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Calcular estadísticas rápidas para el header
  const stats = {
    totalReservations: reservations?.length || 0,
    availableTables: tables?.filter(t => t.status === 'available' && t.isActive !== false).length || 0,
    occupiedTables: tables?.filter(t => (t.status === 'occupied' || t.status === 'reserved') && t.isActive !== false).length || 0,
    activeTables: tables?.filter(t => t.isActive !== false).length || 0
  };

  // Opciones de navegación (actualizadas con TableManager)
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", color: "#4f46e5" },
    { id: "tables", label: "Vista de Mesas", icon: "🪑", color: "#10b981" },
    { id: "table-management", label: "Gestión de Mesas", icon: "⚙️", color: "#f59e0b" },
    { id: "reservations", label: "Reservas", icon: "📅", color: "#ef4444" },
    { id: "statistics", label: "Estadísticas", icon: "📈", color: "#8b5cf6" }
  ];

  const handleNavClick = (itemId) => {
    if (itemId === "notifications") {
      setShowNotifications(!showNotifications);
    } else {
      setActiveView(itemId);
      setShowNotifications(false);
    }
  };

  return (
    <header className="admin-header">
      {/* Parte superior del header */}
      <div className="header-top">
        <div className="header-left">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-icon">🍹</span>
            <span className="logo-text">Coco Bongo Admin</span>
          </div>
        </div>

        <div className="header-center">
          <nav className="main-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? "active" : ""}`}
                onClick={() => handleNavClick(item.id)}
                style={{ 
                  borderBottomColor: activeView === item.id ? item.color : 'transparent' 
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.id === "notifications" && stats.totalReservations > 0 && (
                  <span className="notification-badge">{stats.totalReservations}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right">
          {/* Estadísticas rápidas */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-icon">📋</span>
              <span className="stat-value">{stats.totalReservations}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">✅</span>
              <span className="stat-value">{stats.availableTables}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-value">{stats.occupiedTables}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🪑</span>
              <span className="stat-value">{stats.activeTables}</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={onRefresh}
              title="Actualizar datos"
            >
              🔄
            </button>
            
            <button 
              className="action-btn"
              onClick={() => navigate("/reservar")}
              title="Nueva reserva"
            >
              ➕
            </button>
            
            <button 
              className="action-btn"
              onClick={() => navigate("/")}
              title="Ir al inicio"
            >
              🏠
            </button>

            {/* Menú de usuario */}
            <div className="user-menu-container">
              <button 
                className="user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title="Menú de usuario"
              >
                👤
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <span>Administrador</span>
                    <small>admin@cocobongo.com</small>
                  </div>
                  <button 
                    className="dropdown-item"
                    onClick={onLogout}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de notificaciones */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notificaciones Recientes</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="close-btn"
            >
              ×
            </button>
          </div>
          <div className="notifications-list">
            {reservations.slice(0, 5).map(reservation => (
              <div key={reservation._id} className="notification-item">
                <span className="notification-icon">📅</span>
                <div className="notification-content">
                  <p><strong>{reservation.clientName}</strong> - Mesa {reservation.tableNumber}</p>
                  <small>{new Date(reservation.reservationTime).toLocaleString()}</small>
                </div>
                <span className={`status-badge ${reservation.status}`}>
                  {reservation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb/Indicador de vista actual */}
      <div className="view-indicator">
        <span className="current-view">
          {navItems.find(item => item.id === activeView)?.icon}
          {navItems.find(item => item.id === activeView)?.label}
        </span>
        <div className="view-actions">
          <span className="last-update">Actualizado: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;