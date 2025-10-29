import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import vuelosRoutes from "./routes/vuelos.routes";
import reservasRoutes from "./routes/reservas.routes";
import pagosRoutes from "./routes/pagos.routes";
import ordenesRoutes from "./routes/ordenes.routes";
import facturasRoutes from "./routes/facturas.routes";
import billetesRoutes from "./routes/billetes.routes";
import pasajerosRoutes from "./routes/pasajeros.routes";
import tarjetasRoutes from "./routes/tarjetas.routes";
import ciudadesRoutes from "./routes/ciudades.routes";
import { verificarConfiguracion } from "./services/email.service";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar que el servidor funciona
app.get("/", (_req, res) => {
  res.json({ 
    message: "✅ Backend funcionando correctamente",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/auth",
      "/api/vuelos",
      "/api/reservas",
      "/api/pagos",
      "/api/ordenes",
      "/api/facturas",
      "/api/billetes",
      "/api/pasajeros",
      "/api/tarjetas",
      "/api/ciudades"
    ]
  });
});

console.log("📋 Registrando rutas...");
app.use("/api/auth", authRoutes);
console.log("✅ Ruta /api/auth registrada");
app.use("/api/vuelos", vuelosRoutes);
console.log("✅ Ruta /api/vuelos registrada");
app.use("/api/reservas", reservasRoutes);
console.log("✅ Ruta /api/reservas registrada");
app.use("/api/pagos", pagosRoutes);
console.log("✅ Ruta /api/pagos registrada");
app.use("/api/ordenes", ordenesRoutes);
console.log("✅ Ruta /api/ordenes registrada");
app.use("/api/facturas", facturasRoutes);
console.log("✅ Ruta /api/facturas registrada");
app.use("/api/billetes", billetesRoutes);
console.log("✅ Ruta /api/billetes registrada");
app.use("/api/pasajeros", pasajerosRoutes);
console.log("✅ Ruta /api/pasajeros registrada");
app.use("/api/tarjetas", tarjetasRoutes);
console.log("✅ Ruta /api/tarjetas registrada");
app.use("/api/ciudades", ciudadesRoutes);
console.log("✅ Ruta /api/ciudades registrada");
console.log("🎉 Todas las rutas registradas exitosamente");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, async () => {
  console.log(`🚀 Servidor corriendo en ${HOST}:${PORT}`);
  
  // Verificar configuración de email
  console.log('\n📧 Verificando configuración de email...');
  
  if (process.env.RESEND_API_KEY) {
    console.log('✅ Usando Resend para envío de emails (Producción)');
    const emailConfigOk = await verificarConfiguracion();
    if (emailConfigOk) {
      console.log('✅ Servicio de email listo para usar\n');
    } else {
      console.log('⚠️  Error al configurar Resend\n');
    }
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('📮 Usando Nodemailer/Gmail (Desarrollo Local)');
    const emailConfigOk = await verificarConfiguracion();
    if (emailConfigOk) {
      console.log('✅ Servicio de email listo para usar\n');
    } else {
      console.log('⚠️  Servicio de email no configurado correctamente');
      console.log('   Los códigos de verificación solo se mostrarán en consola\n');
    }
  } else {
    console.log('⚠️  No hay servicio de email configurado');
    console.log('   Agrega RESEND_API_KEY para producción');
    console.log('   O EMAIL_USER/EMAIL_PASSWORD para desarrollo\n');
  }
});
