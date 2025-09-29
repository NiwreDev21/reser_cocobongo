import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReservations, getTables } from "../services/api";
import ClientReservation from "./ClientReservation";

const Home = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("inicio");
  const [showReservationForm, setShowReservationForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reservationsData, tablesData] = await Promise.all([
        getReservations(),
        getTables()
      ]);
      setReservations(reservationsData);
      setTables(tablesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de contadores
  const countReservationsByStatus = (status) => {
    return reservations.filter(res => res.status === status).length;
  };

  const countTablesByStatus = (status) => {
    return tables.filter(table => table.status === status).length;
  };

  const recentReservations = reservations.slice(0, 5);

  const handleReservationClick = () => {
    setShowReservationForm(true);
    setActiveSection("reservar");
  };

  const handleBackToHome = () => {
    setShowReservationForm(false);
    setActiveSection("inicio");
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Cargando información del local...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header Principal con Navegación */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🍹 Coco Bongo</h1>
            <p>Sistema de Reservas</p>
          </div>
          
          <nav className="main-nav">
            <button 
              className={activeSection === "inicio" ? "nav-btn active" : "nav-btn"}
              onClick={() => {
                setActiveSection("inicio");
                setShowReservationForm(false);
              }}
            >
              🏠 Inicio
            </button>
            <button 
              className={activeSection === "lounges" ? "nav-btn active" : "nav-btn"}
              onClick={() => {
                setActiveSection("lounges");
                setShowReservationForm(false);
              }}
            >
              🪑 Nuestros Lounges
            </button>
            <button 
              className={activeSection === "reservas" ? "nav-btn active" : "nav-btn"}
              onClick={() => {
                setActiveSection("reservas");
                setShowReservationForm(false);
              }}
            >
              📋 Reservas
            </button>
            <button 
              className={activeSection === "estadisticas" ? "nav-btn active" : "nav-btn"}
              onClick={() => {
                setActiveSection("estadisticas");
                setShowReservationForm(false);
              }}
            >
              📊 Estadísticas
            </button>
          </nav>

          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={handleReservationClick}
            >
              📅 Hacer Reserva
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate("/admin/login")}
            >
              ⚙️ Panel Admin
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="main-content">
        {showReservationForm ? (
          // Mostrar formulario de reservas
          <section className="reservation-section">
            <div className="section-header">
              <div className="back-button-container">
                <button 
                  className="back-btn"
                  onClick={handleBackToHome}
                >
                  ← Volver al Inicio
                </button>
              </div>
              <h2>Reserva Online - Coco Bongo</h2>
              <p>Realiza tu reserva de forma rápida y sencilla</p>
            </div>
            <ClientReservation embedded={true} />
          </section>
        ) : (
          // Mostrar contenido normal según la sección activa
          <>
            {/* Sección: INICIO */}
            {activeSection === "inicio" && (
              <section className="content-section">
                <div className="section-header">
                </div>

                {/* Imagen Destacada */}
                <div className="featured-image-container">
                  <div className="featured-image">
                    <img 
                      src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                      alt="Ambiente exclusivo de Coco Bongo Lounge" 
                    />
                    <div className="featured-overlay">
                      <div className="featured-content">
                        <h3>Experiencia Única en Coco Bongo</h3>
                        <p>Disfruta de nuestros exclusivos lounges, cócteles premium y ambiente sofisticado</p>
                        <button 
                          className="featured-btn"
                          onClick={handleReservationClick}
                        >
                          Reservar Ahora
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjetas de Estado Rápido */}
                <div className="quick-stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🪑</div>
                    <div className="stat-info">
                      <h3>Total Mesas</h3>
                      <p className="stat-number">{tables.length}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <h3>Disponibles</h3>
                      <p className="stat-number">{countTablesByStatus('available')}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                      <h3>Reservadas</h3>
                      <p className="stat-number">{countTablesByStatus('reserved')}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <h3>Ocupadas</h3>
                      <p className="stat-number">{countTablesByStatus('occupied')}</p>
                    </div>
                  </div>
                </div>

                {/* Información destacada */}
                <div className="featured-info">
                  <div className="info-card">
                    <h3>📍 Ubicación Premium</h3>
                    <p>Shinahota, Cochabamba - Lauca ene</p>
                    <p>Ambiente exclusivo y confortable</p>
                  </div>
                  
                  <div className="info-card">
                    <h3>🕒 Horario Extendido</h3>
                    <p>Lunes a Viernes: 20:00 - 01:00</p>
                    <p>Sábados y Domingos: 20:00 - 04:00</p>
                  </div>
                  
                  <div className="info-card">
                    <h3>📞 Reservas Inmediatas</h3>
                    <p>Teléfono: +591 63590391</p>
                    <p>Reserva online 24/7</p>
                  </div>
                </div>

                {/* Llamada a la acción */}
                <div className="cta-section">
                  <h3>¿Listo para reservar?</h3>
                  <p>Haz tu reserva ahora y asegura tu lugar en nuestro exclusivo lounge</p>
                  <button 
                    className="btn-primary large"
                    onClick={handleReservationClick}
                  >
                    📅 Reservar Ahora
                  </button>
                </div>
              </section>
            )}

            {/* Sección: LOUNGES */}
            {activeSection === "lounges" && (
              <section className="content-section">
                <div className="section-header">
                  <h2>Nuestros Lounges y Mesas</h2>
                  <p>Selecciona el ambiente perfecto para tu ocasión</p>
                </div>

                <div className="lounges-grid">
                  {tables.map(table => (
                    <div key={table._id} className={`lounge-card ${table.status}`}>
                      <div className="lounge-header">
                        <h4>Mesa {table.tableNumber}</h4>
                        <span className={`status-badge ${table.status}`}>
                          {table.status === 'available' ? 'Disponible' : 
                          table.status === 'reserved' ? 'Reservada' : 'Ocupada'}
                        </span>
                      </div>
                      
                      <div className="lounge-details">
                        <p><strong>Capacidad:</strong> {table.capacity} personas</p>
                        <p><strong>Ubicación:</strong> 
                          {table.location === 'main' ? ' Salón Principal' : 
                          table.location === 'terrace' ? ' Terraza' : ' Área VIP'}
                        </p>
                        {table.features && table.features.length > 0 && (
                          <p><strong>Características:</strong> {table.features.join(', ')}</p>
                        )}
                      </div>
                      
                      {table.status === 'available' && (
                        <button 
                          className="reserve-btn"
                          onClick={handleReservationClick}
                        >
                          Reservar Ahora
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sección: RESERVAS */}
            {activeSection === "reservas" && (
              <section className="content-section">
                <div className="section-header">
                  <h2>Reservas Recientes</h2>
                  <p>Gestión y seguimiento de reservas activas</p>
                </div>

                <div className="reservations-container">
                  {recentReservations.length > 0 ? (
                    <div className="reservations-list">
                      {recentReservations.map(reservation => (
                        <div key={reservation._id} className="reservation-item">
                          <div className="reservation-info">
                            <h4>Mesa {reservation.tableNumber} - {reservation.clientName}</h4>
                            <p><strong>Fecha:</strong> {new Date(reservation.reservationTime).toLocaleDateString()}</p>
                            <p><strong>Hora:</strong> {new Date(reservation.reservationTime).toLocaleTimeString()}</p>
                            <p><strong>Personas:</strong> {reservation.guestCount}</p>
                            <p><strong>Teléfono:</strong> {reservation.clientPhone}</p>
                          </div>
                          <div className={`reservation-status ${reservation.status}`}>
                            {reservation.status === 'reserved' ? 'Reservada' : 
                            reservation.status === 'checked-in' ? 'Ocupada' : 
                            reservation.status === 'checked-out' ? 'Finalizada' : 'Cancelada'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No hay reservas recientes</p>
                    </div>
                  )}
                  
                  <div className="action-panel">
                    <button 
                      className="btn-primary large"
                      onClick={handleReservationClick}
                    >
                      📋 Crear Nueva Reserva
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate("/admin/login")}
                    >
                      👁️ Ver Todas las Reservas
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Sección: ESTADÍSTICAS */}
            {activeSection === "estadisticas" && (
              <section className="content-section">
                <div className="section-header">
                  <h2>Estadísticas del Local</h2>
                  <p>Métricas y análisis de rendimiento</p>
                </div>

                <div className="stats-overview">
                  <div className="stat-card-large">
                    <h3>Reservas Totales</h3>
                    <p className="stat-number-large">{reservations.length}</p>
                  </div>
                  
                  <div className="stat-card-large">
                    <h3>Por Estado</h3>
                    <div className="status-stats">
                      <p><span className="status-dot reserved"></span> Reservadas: {countReservationsByStatus('reserved')}</p>
                      <p><span className="status-dot checked-in"></span> En curso: {countReservationsByStatus('checked-in')}</p>
                      <p><span className="status-dot checked-out"></span> Finalizadas: {countReservationsByStatus('checked-out')}</p>
                      <p><span className="status-dot cancelled"></span> Canceladas: {countReservationsByStatus('cancelled')}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card-large">
                    <h3>Capacidad Total</h3>
                    <p className="stat-number-large">
                      {tables.reduce((total, table) => total + table.capacity, 0)}
                    </p>
                    <p>personas en total</p>
                  </div>
                </div>

                <div className="additional-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <h3>📈 Tendencia</h3>
                      <p>Reservas este mes: {reservations.filter(r => {
                        const resDate = new Date(r.reservationTime);
                        const now = new Date();
                        return resDate.getMonth() === now.getMonth() && 
                              resDate.getFullYear() === now.getFullYear();
                      }).length}</p>
                    </div>
                    
                    <div className="info-item">
                      <h3>⭐ Popularidad</h3>
                      <p>Mesa más solicitada: {
                        tables.length > 0 ? `Mesa ${tables[0].tableNumber}` : 'N/A'
                      }</p>
                    </div>
                  </div>
                </div>

                <div className="cta-section">
                  <button 
                    className="btn-primary large"
                    onClick={handleReservationClick}
                  >
                    📊 Hacer Nueva Reserva
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer Información de Contacto */}
      {!showReservationForm && (
        <footer className="main-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🍹 Coco Bongo Lounge</h3>
              <p>Tu lugar de escape perfecto</p>
            </div>
            
            <div className="footer-section">
              <h4>Contacto</h4>
              <p>📞 +591 63590391</p>
              <p>📧 info@cocobongo.com</p>
            </div>
            
            <div className="footer-section">
              <h4>Horario</h4>
              <p>Lun-Vie: 20:00 - 01:00</p>
              <p>Sab-Dom: 20:00 - 04:00</p>
            </div>
          </div>
<div className="footer-bottom">
  <p>
    &copy; 2025 Coco Bongo Lounge. Todos los derechos reservados. 
    Nuestro sistema de reservas garantiza seguridad, privacidad y atención profesional a todos nuestros clientes. 
    Para más información, consulte nuestra 
    <a href="/privacy-policy">Política de Privacidad</a> y 
    <a href="/terms">Términos y Condiciones</a>. 
    Contacto y soporte disponible las 24 horas.
  </p>
</div>

        </footer>
      )}
    </div>
  );
};

export default Home;