import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Configurar Resend (para producción)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Configurar Nodemailer (para desarrollo local)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Envía un correo con el código de verificación para el pago
 */
export const enviarCodigoVerificacion = async (
  destinatario: string,
  nombreUsuario: string,
  codigo: string,
  ordenId: number,
  monto: number
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .code-box {
          background: white;
          border: 3px dashed #667eea;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          border-radius: 10px;
        }
        .code {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #667eea;
          font-family: 'Courier New', monospace;
        }
        .info-box {
          background: white;
          padding: 15px;
          border-left: 4px solid #667eea;
          margin: 20px 0;
          border-radius: 5px;
        }
        .warning {
          background: #fff3cd;
          border-left-color: #ffc107;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✈️ SkyReserva</h1>
        <p style="margin: 0; font-size: 18px;">Código de Verificación de Pago</p>
      </div>
      
      <div class="content">
        <p>Hola <strong>${nombreUsuario}</strong>,</p>
        
        <p>Hemos recibido una solicitud de pago para tu orden. Para completar la transacción, por favor utiliza el siguiente código de verificación:</p>
        
        <div class="code-box">
          <p style="margin: 0; color: #666; font-size: 14px;">TU CÓDIGO DE VERIFICACIÓN</p>
          <div class="code">${codigo}</div>
        </div>
        
        <div class="info-box">
          <p style="margin: 5px 0;"><strong>📋 Orden:</strong> #${ordenId}</p>
          <p style="margin: 5px 0;"><strong>💰 Monto:</strong> $${monto.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>⏱️ Válido por:</strong> 5 minutos</p>
        </div>
        
        <div class="warning">
          <p style="margin: 0;"><strong>⚠️ Importante:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Este código expirará en <strong>5 minutos</strong></li>
            <li>No compartas este código con nadie</li>
            <li>Si no solicitaste este pago, ignora este correo</li>
          </ul>
        </div>
        
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        
        <p style="margin-top: 30px;">
          Gracias por elegir SkyReserva,<br>
          <strong>El equipo de SkyReserva</strong> ✈️
        </p>
      </div>
      
      <div class="footer">
        <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        <p>&copy; ${new Date().getFullYear()} SkyReserva. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `;

  // Usar Resend si está configurado (producción)
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SkyReserva <onboarding@resend.dev>', // Dominio de prueba de Resend
        to: [destinatario],
        subject: '🔐 Código de Verificación - SkyReserva',
        html: htmlContent,
      });

      if (error) {
        console.error('❌ Error al enviar correo con Resend:', error);
        throw error;
      }

      console.log('✅ Correo enviado exitosamente con Resend:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('❌ Error al enviar correo:', error);
      throw error;
    }
  }

  // Fallback a Nodemailer (desarrollo local)
  const mailOptions = {
    from: {
      name: 'SkyReserva ✈️',
      address: process.env.EMAIL_USER || '',
    },
    to: destinatario,
    subject: '🔐 Código de Verificación - SkyReserva',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado exitosamente con Nodemailer:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error;
  }
};

/**
 * Verifica la configuración del servicio de email
 */
export const verificarConfiguracion = async () => {
  // Si hay API key de Resend, verificar con Resend
  if (resend) {
    try {
      // Resend no tiene un método verify(), así que solo verificamos que la instancia existe
      console.log('✅ Resend configurado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error en configuración de Resend:', error);
      return false;
    }
  }

  // Fallback a Nodemailer
  try {
    await transporter.verify();
    console.log('✅ Nodemailer configurado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de Nodemailer:', error);
    return false;
  }
};
