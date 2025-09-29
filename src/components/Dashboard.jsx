import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const Dashboard = ({ reservations, tables }) => {
  // Calcular estadísticas
  const totalTables = tables.length;
  const occupiedTables = tables.filter(table => table.status === 'occupied').length;
  const reservedTables = tables.filter(table => table.status === 'reserved').length;
  const availableTables = tables.filter(table => table.status === 'available').length;
  
  const todayReservations = reservations.filter(res => {
    const resDate = new Date(res.reservationTime);
    const today = new Date();
    return resDate.toDateString() === today.toDateString();
  }).length;

  const chartData = [
    { name: "Ocupadas", value: occupiedTables },
    { name: "Reservadas", value: reservedTables },
    { name: "Disponibles", value: availableTables },
  ];
  
  const COLORS = ["#FF8042", "#FFBB28", "#00C49F"];

  const stats = [
    { title: "Total Mesas", value: totalTables, icon: "🪑", color: "#4f46e5" },
    { title: "Ocupadas", value: occupiedTables, icon: "✅", color: "#10b981" },
    { title: "Reservas Hoy", value: todayReservations, icon: "📅", color: "#f59e0b" },
    { title: "Disponibles", value: availableTables, icon: "🔓", color: "#ef4444" },
  ];

  // Preparar datos para el gráfico de barras (reservas por hora)
  const hours = Array.from({ length: 14 }, (_, i) => i + 9); // De 9:00 a 22:00
  const reservationsByHour = hours.map(hour => {
    const hourReservations = reservations.filter(res => {
      const resHour = new Date(res.reservationTime).getHours();
      return resHour === hour;
    }).length;
    
    return { hour: `${hour}:00`, reservations: hourReservations };
  });

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="chart-section">
        <div className="chart-container">
          <h3>Estado de Mesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h3>Reservas por Hora</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservationsByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reservations" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Reservas Recientes</h3>
        <div className="activity-list">
          {reservations.slice(0, 5).map((reservation, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">{reservation.status === 'checked-in' ? '✅' : '📅'}</div>
              <div className="activity-content">
                <p>Mesa {reservation.tableNumber} - {reservation.clientName}</p>
                <span>{new Date(reservation.reservationTime).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;