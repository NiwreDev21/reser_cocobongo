import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import TableGrid from "./components/TableGrid";
import ReservationList from "./components/ReservationList";
import Statistics from "./components/Statistics";
import ClientReservation from "./components/ClientReservation";
import Home from "./components/Home";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ReservationManager from "./components/ReservationManager";
import TableManager from "./components/TableManager";
import { getReservations, getTables } from "./services/api";
import "./App.css";

const App = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchData();
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      setIsAuthenticated(true);
    }
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

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('adminSession', 'active');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminSession');
  };

  const renderAdminContent = () => {
    if (loading) {
      return <div className="loading">Cargando...</div>;
    }

    switch (activeView) {
      case "dashboard":
        return <AdminDashboard reservations={reservations} tables={tables} onRefresh={fetchData} />;
      case "tables":
        return <TableGrid tables={tables} reservations={reservations} onUpdate={fetchData} />;
      case "table-management":
        return <TableManager tables={tables} onUpdate={fetchData} />;
      case "reservations":
        return <ReservationManager reservations={reservations} onUpdate={fetchData} />;
      case "statistics":
        return <Statistics reservations={reservations} tables={tables} />;
      default:
        return <AdminDashboard reservations={reservations} tables={tables} onRefresh={fetchData} />;
    }
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Ruta pública para clientes */}
          <Route path="/" element={<Home reservations={reservations} tables={tables} loading={loading} />} />
          
          {/* Ruta de reserva para clientes */}
          <Route path="/reservar" element={<ClientReservation />} />
          
          {/* Ruta de login para administradores */}
          <Route path="/admin/login" element={
            isAuthenticated ? 
            <Navigate to="/admin/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
          } />
          
          {/* Rutas de administración protegidas */}
          <Route path="/admin/*" element={
            isAuthenticated ? (
              <div className="admin-layout">
                <Header 
                  activeView={activeView}
                  setActiveView={setActiveView}
                  onRefresh={fetchData}
                  onLogout={handleLogout}
                  reservations={reservations}
                  tables={tables}
                />
                <div className="admin-content">
                  <div className="content-wrapper">
                    {renderAdminContent()}
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;