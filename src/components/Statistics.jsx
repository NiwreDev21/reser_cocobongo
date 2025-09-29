import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Statistics = ({ reservations, tables }) => {
  // Calcular estadísticas
  const totalReservations = reservations.length;
  const completedReservations = reservations.filter(r => r.status === 'checked-out').length;
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
  
  // Reservas por día de la semana
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const reservationsByDay = daysOfWeek.map(day => ({ day, reservations: 0 }));
  
  reservations.forEach(res => {
    const day = new Date(res.reservationTime).getDay();
    reservationsByDay[day].reservations += 1;
  });

  // Mesas por ubicación
  const tablesByLocation = [
    { location: 'Main', tables: tables.filter(t => t.location === 'main').length },
    { location: 'Terraza', tables: tables.filter(t => t.location === 'terrace').length },
    { location: 'VIP', tables: tables.filter(t => t.location === 'vip').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="statistics-view">
      <h2>Estadísticas y Reportes</h2>
      
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total Reservas</h3>
          <p className="stat-number">{totalReservations}</p>
        </div>
        <div className="stat-card">
          <h3>Completadas</h3>
          <p className="stat-number">{completedReservations}</p>
        </div>
        <div className="stat-card">
          <h3>Canceladas</h3>
          <p className="stat-number">{cancelledReservations}</p>
        </div>
        <div className="stat-card">
          <h3>Ratio de Éxito</h3>
          <p className="stat-number">
            {totalReservations > 0 
              ? `${((completedReservations / totalReservations) * 100).toFixed(1)}%` 
              : '0%'}
          </p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Reservas por Día de la Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservationsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reservations" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Mesas por Ubicación</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tablesByLocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="tables"
                label={({ location, tables }) => `${location}: ${tables}`}
              >
                {tablesByLocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="top-clients">
        <h3>Clientes Frecuentes</h3>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Reservas</th>
              <th>Última Visita</th>
            </tr>
          </thead>
          <tbody>
            {[...reservations]
              .reduce((acc, res) => {
                const existing = acc.find(item => item.clientName === res.clientName);
                if (existing) {
                  existing.count += 1;
                  if (new Date(res.reservationTime) > new Date(existing.lastVisit)) {
                    existing.lastVisit = res.reservationTime;
                  }
                } else {
                  acc.push({
                    clientName: res.clientName,
                    count: 1,
                    lastVisit: res.reservationTime
                  });
                }
                return acc;
              }, [])
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((client, index) => (
                <tr key={index}>
                  <td>{client.clientName}</td>
                  <td>{client.count}</td>
                  <td>{new Date(client.lastVisit).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Statistics;