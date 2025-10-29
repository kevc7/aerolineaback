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

app.use("/api/auth", authRoutes);
app.use("/api/vuelos", vuelosRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/ordenes", ordenesRoutes);
app.use("/api/facturas", facturasRoutes);
app.use("/api/billetes", billetesRoutes);
app.use("/api/pasajeros", pasajerosRoutes);
app.use("/api/tarjetas", tarjetasRoutes);
app.use("/api/ciudades", ciudadesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  
  // Verificar configuración de email
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('\n📧 Verificando configuración de email...');
    const emailConfigOk = await verificarConfiguracion();
    if (emailConfigOk) {
      console.log('✅ Servicio de email listo para usar\n');
    } else {
      console.log('⚠️  Servicio de email no configurado correctamente');
      console.log('   Los códigos de verificación solo se mostrarán en consola');
      console.log('   Ver CONFIG_EMAIL.md para instrucciones de configuración\n');
    }
  } else {
    console.log('\n⚠️  Variables de email no configuradas');
    console.log('   EMAIL_USER y EMAIL_PASSWORD no encontradas en .env');
    console.log('   Los códigos solo se mostrarán en consola');
    console.log('   Ver CONFIG_EMAIL.md para instrucciones\n');
  }
});
