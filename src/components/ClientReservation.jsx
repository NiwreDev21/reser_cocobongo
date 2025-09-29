import React, { useState, useEffect } from "react";
import { createReservation, getAvailableTables } from "../services/api";

const ClientReservation = ({ embedded = false, onReservationComplete }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    guestCount: "2",
    date: "",
    time: "19:00",
    tableNumber: "",
    notes: ""
  });

  const [availableTables, setAvailableTables] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar mesas disponibles cuando cambie el número de invitados
  useEffect(() => {
    const loadAvailableTables = async () => {
      if (formData.guestCount) {
        setLoading(true);
        try {
          const tables = await getAvailableTables(parseInt(formData.guestCount));
          setAvailableTables(tables);
          
          // Si solo hay una mesa disponible, seleccionarla automáticamente
          if (tables.length === 1 && !formData.tableNumber) {
            setFormData(prev => ({
              ...prev,
              tableNumber: tables[0].tableNumber.toString()
            }));
          }
        } catch (error) {
          console.error("Error cargando mesas disponibles:", error);
          setError("Error al cargar las mesas disponibles");
        } finally {
          setLoading(false);
        }
      }
    };

    loadAvailableTables();
  }, [formData.guestCount]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validaciones
    if (!formData.tableNumber) {
      setError("Por favor, selecciona una mesa");
      return;
    }

    try {
      // Formatear fecha y hora para la API
      const dateTimeString = `${formData.date}T${formData.time}:00`;
      const reservationData = {
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        guestCount: parseInt(formData.guestCount),
        tableNumber: parseInt(formData.tableNumber),
        reservationTime: new Date(dateTimeString).toISOString(),
        notes: formData.notes,
        status: "reserved"
      };

      // Enviar a la API
      await createReservation(reservationData);
      setSubmitted(true);
      
      // Llamar al callback si existe
      if (onReservationComplete) {
        onReservationComplete();
      }
      
      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          clientName: "",
          clientPhone: "",
          guestCount: "2",
          date: "",
          time: "19:00",
          tableNumber: "",
          notes: ""
        });
        setAvailableTables([]);
      }, 3000);
    } catch (error) {
      console.error("Error creando reserva:", error);
      setError("Error al crear la reserva. Por favor, intenta nuevamente o contacta al restaurante directamente.");
    }
  };

  // Generar opciones de hora cada 30 minutos
  const timeOptions = [];
  for (let hour = 9; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(<option key={timeValue} value={timeValue}>{timeValue}</option>);
    }
  }

  // Obtener fecha mínima (hoy) y máxima (30 días adelante)
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="client-reservation">
        <div className="reservation-success">
          <h2>¡Reserva Enviada con Éxito!</h2>
          <p>Te contactaremos pronto para confirmar tu reserva.</p>
          <div className="success-animation">✓</div>
          <p className="success-message">Serás redirigido automáticamente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`client-reservation ${embedded ? 'embedded' : ''}`}>
      {!embedded && (
        <div className="reservation-header">
          <h1>Reserva Online - Coco Bongo</h1>
          <p>Realiza tu reserva de forma rápida y sencilla</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="reservation-form public-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clientName">Nombre completo *</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientPhone">Teléfono *</label>
            <input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              required
              placeholder="Tu número de contacto"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="guestCount">Número de personas *</label>
            <select
              id="guestCount"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              required
            >
              <option value="1">1 persona</option>
              <option value="2">2 personas</option>
              <option value="3">3 personas</option>
              <option value="4">4 personas</option>
              <option value="5">5 personas</option>
              <option value="6">6 personas</option>
              <option value="7">7 personas</option>
              <option value="8">8 personas</option>
              <option value="9">9+ personas (especificar en observaciones)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Fecha *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today}
              max={maxDateStr}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Hora *</label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            >
              {timeOptions}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tableNumber">Seleccionar Mesa *</label>
            {loading ? (
              <div className="loading-tables">
                <span>Cargando mesas disponibles...</span>
              </div>
            ) : availableTables.length > 0 ? (
              <select
                id="tableNumber"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una mesa</option>
                {availableTables.map(table => (
                  <option key={table._id} value={table.tableNumber}>
                    Mesa {table.tableNumber} - Capacidad: {table.capacity} personas ({table.location})
                  </option>
                ))}
              </select>
            ) : (
              <p className="no-tables-message">
                No hay mesas disponibles para {formData.guestCount} personas en este momento.
                Por favor, intenta con un número diferente de invitados o selecciona otra fecha/hora.
              </p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Observaciones especiales</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Alergias alimentarias, celebración especial, requerimientos especiales, etc."
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={availableTables.length === 0 || loading}
        >
          {loading ? 'Cargando...' : availableTables.length === 0 ? 'No hay mesas disponibles' : 'Reservar ahora'}
        </button>

        <div className="form-note">
          <p>* Campos obligatorios. Nos contactaremos contigo para confirmar tu reserva.</p>
        </div>
      </form>

      {!embedded && (
        <div className="restaurant-info">
          <h2>Información del Restaurant</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>📍 Ubicación</h3>
              <p>Shinahota, Cochabamba</p>
              <p>Lauca ene</p>
            </div>
            <div className="info-item">
              <h3>🕒 Horario</h3>
              <p>Lunes a Domingo: 9:00 - 23:00</p>
            </div>
            <div className="info-item">
              <h3>📞 Contacto</h3>
              <p>+591 63590391</p>
              <p>info@cocobongo.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientReservation;