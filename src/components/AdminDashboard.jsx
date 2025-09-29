import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = ({ reservations, tables, onRefresh }) => {
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    availableTables: 0,
    occupiedTables: 0
  });

  useEffect(() => {
    calculateStats();
  }, [reservations, tables]);

  const calculateStats = () => {
    const totalReservations = reservations.length;
    const pendingReservations = reservations.filter(r => r.status === 'reserved').length;
    const confirmedReservations = reservations.filter(r => r.status === 'checked-in').length;
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
    
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'reserved').length;

    setStats({
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      availableTables,
      occupiedTables
    });
  };

  // Datos para gráficos
  const reservationStatusData = [
    { name: 'Pendientes', value: stats.pendingReservations },
    { name: 'Confirmadas', value: stats.confirmedReservations },
    { name: 'Canceladas', value: stats.cancelledReservations }
  ];

  const tableStatusData = [
    { name: 'Disponibles', value: stats.availableTables },
    { name: 'Ocupadas/Reservadas', value: stats.occupiedTables }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Panel de Administración</h2>
        <button onClick={onRefresh} className="refresh-btn">
          Actualizar Datos
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Total Reservas</h3>
            <p className="stat-number">{stats.totalReservations}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Reservas Pendientes</h3>
            <p className="stat-number">{stats.pendingReservations}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Reservas Confirmadas</h3>
            <p className="stat-number">{stats.confirmedReservations}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>Reservas Canceladas</h3>
            <p className="stat-number">{stats.cancelledReservations}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-info">
            <h3>Mesas Disponibles</h3>
            <p className="stat-number">{stats.availableTables}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Mesas Ocupadas</h3>
            <p className="stat-number">{stats.occupiedTables}</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Estado de Reservas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reservationStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {reservationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Estado de Mesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tableStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;