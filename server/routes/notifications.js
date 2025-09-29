import express from 'express';

const router = express.Router();

// Simulación de envío de WhatsApp
router.post('/whatsapp', async (req, res) => {
  try {
    const { phone, message, reservationId } = req.body;
    
    // Aquí integrarías con una API real de WhatsApp como Twilio
    console.log(`Enviando WhatsApp al ${phone}: ${message}`);
    
    // Simulamos un retraso de red
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Notificación de WhatsApp enviada simuladamente',
        // En producción, aquí irían los datos reales de la API de WhatsApp
      });
    }, 1000);
    
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al enviar notificación de WhatsApp' 
    });
  }
});

export { router };