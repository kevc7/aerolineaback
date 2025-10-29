import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seeder de datos...");

  try {
    // ============================================================
    // 1. LIMPIAR DATOS PREVIOS (OPCIONAL - comentar si no quieres)
    // ============================================================
    console.log("\n📋 Limpiando datos previos...");
    await prisma.billete.deleteMany();
    await prisma.factura.deleteMany();
    await prisma.pago.deleteMany();
    await prisma.pasajero.deleteMany();
    await prisma.reserva.deleteMany();
    await prisma.orden_compra.deleteMany();
    await prisma.vuelo_categoria.deleteMany();
    await prisma.vuelo.deleteMany();
    await prisma.tarjeta_credito.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.categoria_asiento.deleteMany();
    await prisma.aerolinea.deleteMany();
    await prisma.ciudad.deleteMany();
    await prisma.provincia.deleteMany();
    await prisma.pais.deleteMany();

    // ============================================================
    // 2. CREAR PAÍSES
    // ============================================================
    console.log("\n🌍 Creando países...");
    const ecuador = await prisma.pais.create({
      data: {
        pais_nom: "Ecuador",
        pais_codigo_iso: "EC",
        pais_codigo_iso3: "ECU",
      },
    });

    const peru = await prisma.pais.create({
      data: {
        pais_nom: "Perú",
        pais_codigo_iso: "PE",
        pais_codigo_iso3: "PER",
      },
    });

    const colombia = await prisma.pais.create({
      data: {
        pais_nom: "Colombia",
        pais_codigo_iso: "CO",
        pais_codigo_iso3: "COL",
      },
    });

    // ============================================================
    // 3. CREAR PROVINCIAS
    // ============================================================
    console.log("\n🗺️  Creando provincias...");
    const pichincha = await prisma.provincia.create({
      data: {
        prov_nom: "Pichincha",
        pais_id: ecuador.pais_id,
      },
    });

    const guayas = await prisma.provincia.create({
      data: {
        prov_nom: "Guayas",
        pais_id: ecuador.pais_id,
      },
    });

    const lima = await prisma.provincia.create({
      data: {
        prov_nom: "Lima",
        pais_id: peru.pais_id,
      },
    });

    const bogota_dept = await prisma.provincia.create({
      data: {
        prov_nom: "Cundinamarca",
        pais_id: colombia.pais_id,
      },
    });

    // ============================================================
    // 4. CREAR CIUDADES
    // ============================================================
    console.log("\n🏙️  Creando ciudades...");
    const quito = await prisma.ciudad.create({
      data: {
        ciu_nom: "Quito",
        prov_id: pichincha.prov_id,
        ciu_codigo_aeropuerto: "UIO",
      },
    });

    const guayaquil = await prisma.ciudad.create({
      data: {
        ciu_nom: "Guayaquil",
        prov_id: guayas.prov_id,
        ciu_codigo_aeropuerto: "GYE",
      },
    });

    const lima_ciudad = await prisma.ciudad.create({
      data: {
        ciu_nom: "Lima",
        prov_id: lima.prov_id,
        ciu_codigo_aeropuerto: "LIM",
      },
    });

    const bogota = await prisma.ciudad.create({
      data: {
        ciu_nom: "Bogotá",
        prov_id: bogota_dept.prov_id,
        ciu_codigo_aeropuerto: "BOG",
      },
    });

    // ============================================================
    // 5. CREAR AEROLÍNEAS
    // ============================================================
    console.log("\n✈️  Creando aerolíneas...");
    const latam = await prisma.aerolinea.create({
      data: {
        aero_nom: "LATAM Airlines",
        aero_codigo: "LA",
        aero_info: "Aerolínea líder en Sudamérica",
        aero_activa: true,
      },
    });

    const avianca = await prisma.aerolinea.create({
      data: {
        aero_nom: "Avianca",
        aero_codigo: "AV",
        aero_info: "Aerolínea tradicional",
        aero_activa: true,
      },
    });

    const viva_air = await prisma.aerolinea.create({
      data: {
        aero_nom: "Viva Air",
        aero_codigo: "VB",
        aero_info: "Aerolínea de bajo costo",
        aero_activa: true,
      },
    });

    // ============================================================
    // 6. CREAR CATEGORÍAS DE ASIENTOS
    // ============================================================
    console.log("\n💺 Creando categorías de asientos...");
    const economica = await prisma.categoria_asiento.create({
      data: {
        cat_nombre: "Económica",
        cat_descripcion: "Clase económica estándar",
      },
    });

    const ejecutiva = await prisma.categoria_asiento.create({
      data: {
        cat_nombre: "Ejecutiva",
        cat_descripcion: "Mayor comodidad y servicios",
      },
    });

    const primera = await prisma.categoria_asiento.create({
      data: {
        cat_nombre: "Primera Clase",
        cat_descripcion: "Máxima comodidad y lujo",
      },
    });

    // ============================================================
    // 7. CREAR USUARIOS
    // ============================================================
    console.log("\n👤 Creando usuarios de prueba...");
    const usuario1 = await prisma.usuario.create({
      data: {
        usu_correo: "juan@example.com",
        usu_contrasenia: "password123",
        usu_cedula: "1234567890",
        usu_nombre: "Juan Pérez",
        usu_telefono: "5912345678",
        usu_activo: true,
      },
    });

    const usuario2 = await prisma.usuario.create({
      data: {
        usu_correo: "maria@example.com",
        usu_contrasenia: "password456",
        usu_cedula: "0987654321",
        usu_nombre: "María García",
        usu_telefono: "5987654321",
        usu_activo: true,
      },
    });

    const usuario3 = await prisma.usuario.create({
      data: {
        usu_correo: "carlos@example.com",
        usu_contrasenia: "password789",
        usu_cedula: "1122334455",
        usu_nombre: "Carlos Rodríguez",
        usu_telefono: "5911223344",
        usu_activo: true,
      },
    });

    // ============================================================
    // 8. CREAR TARJETAS DE CRÉDITO
    // ============================================================
    console.log("\n💳 Creando tarjetas de crédito...");
    const tarjeta1 = await prisma.tarjeta_credito.create({
      data: {
        usu_id: usuario1.usu_id,
        tarj_numero: "4532123456789010",
        tarj_titular: "Juan Pérez",
        tarj_vencimiento: new Date("2027-12-31"),
        tarj_tipo: "Visa",
        tarj_activa: true,
      },
    });

    const tarjeta2 = await prisma.tarjeta_credito.create({
      data: {
        usu_id: usuario2.usu_id,
        tarj_numero: "5425233010103010",
        tarj_titular: "María García",
        tarj_vencimiento: new Date("2026-06-30"),
        tarj_tipo: "Mastercard",
        tarj_activa: true,
      },
    });

    const tarjeta3 = await prisma.tarjeta_credito.create({
      data: {
        usu_id: usuario3.usu_id,
        tarj_numero: "378282246310005",
        tarj_titular: "Carlos Rodríguez",
        tarj_vencimiento: new Date("2028-09-30"),
        tarj_tipo: "American Express",
        tarj_activa: true,
      },
    });

    // ============================================================
    // 9. CREAR VUELOS
    // ============================================================
    console.log("\n🛫 Creando vuelos...");
    const hoy = new Date();
    const manana = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);
    const en3dias = new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000);
    const en5dias = new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000);

    const vuelo1 = await prisma.vuelo.create({
      data: {
        vl_numero: "LA-101",
        aero_id: latam.aero_id,
        ciu_origen_id: quito.ciu_id,
        ciu_destino_id: guayaquil.ciu_id,
        vl_fecha_salida: manana,
        vl_hora_salida: new Date("2025-01-01T08:00:00"),
        vl_fecha_llegada: manana,
        vl_hora_llegada: new Date("2025-01-01T09:30:00"),
        vl_estado: "programado",
        vl_es_directo: true,
      },
    });

    const vuelo2 = await prisma.vuelo.create({
      data: {
        vl_numero: "AV-202",
        aero_id: avianca.aero_id,
        ciu_origen_id: quito.ciu_id,
        ciu_destino_id: lima_ciudad.ciu_id,
        vl_fecha_salida: en3dias,
        vl_hora_salida: new Date("2025-01-01T10:00:00"),
        vl_fecha_llegada: en3dias,
        vl_hora_llegada: new Date("2025-01-01T14:00:00"),
        vl_estado: "programado",
        vl_es_directo: true,
      },
    });

    const vuelo3 = await prisma.vuelo.create({
      data: {
        vl_numero: "VB-303",
        aero_id: viva_air.aero_id,
        ciu_origen_id: guayaquil.ciu_id,
        ciu_destino_id: bogota.ciu_id,
        vl_fecha_salida: en5dias,
        vl_hora_salida: new Date("2025-01-01T12:00:00"),
        vl_fecha_llegada: en5dias,
        vl_hora_llegada: new Date("2025-01-01T17:30:00"),
        vl_estado: "programado",
        vl_es_directo: true,
      },
    });

    const vuelo4 = await prisma.vuelo.create({
      data: {
        vl_numero: "LA-102",
        aero_id: latam.aero_id,
        ciu_origen_id: guayaquil.ciu_id,
        ciu_destino_id: quito.ciu_id,
        vl_fecha_salida: manana,
        vl_hora_salida: new Date("2025-01-01T11:00:00"),
        vl_fecha_llegada: manana,
        vl_hora_llegada: new Date("2025-01-01T12:30:00"),
        vl_estado: "en_hora",
        vl_es_directo: true,
      },
    });

    // ============================================================
    // 10. CREAR CATEGORÍAS DE VUELO (precios y asientos)
    // ============================================================
    console.log("\n💺 Asignando categorías a vuelos...");

    // Vuelo 1 - LA-101
    await prisma.vuelo_categoria.create({
      data: {
        vl_id: vuelo1.vl_id,
        cat_id: economica.cat_id,
        vlcat_asientos_totales: 100,
        vlcat_asientos_disponibles: 85,
        vlcat_precio_base: 150,
      },
    });

    await prisma.vuelo_categoria.create({
      data: {
        vl_id: vuelo1.vl_id,
        cat_id: ejecutiva.cat_id,
        vlcat_asientos_totales: 30,
        vlcat_asientos_disponibles: 20,
        vlcat_precio_base: 350,
      },
    });

    // Vuelo 2 - AV-202
    await prisma.vuelo_categoria.create({
      data: {
        vl_id: vuelo2.vl_id,
        cat_id: economica.cat_id,
        vlcat_asientos_totales: 120,
        vlcat_asientos_disponibles: 50,
        vlcat_precio_base: 200,
      },
    });

    await prisma.vuelo_categoria.create({
      data: {
        vl_id: vuelo2.vl_id,
        cat_id: ejecutiva.cat_id,
        vlcat_asientos_totales: 40,
        vlcat_asientos_disponibles: 15,
        vlcat_precio_base: 450,
      },
    });

    await prisma.vuelo_categoria.create({
      data: {
        vl_id: vuelo2.vl_id,
        cat_id: primera.cat_id,
        vlcat_asientos_totales: 10,
        vlcat_asientos_disponibles: 8,
        vlcat_precio_base: 800,
      },
    });

    // Vuelo 3 - VB-303
    await prisma.vuelo_categoria.create({
      data: {
        vl_id: vuelo3.vl_id,
        cat_id: economica.cat_id,
        vlcat_asientos_totales: 180,
        vlcat_asientos_disponibles: 120,
        vlcat_precio_base: 120,
      },
    });

    // Vuelo 4 - LA-102
    await prisma.vuelo_categoria.create({
      data: {
        vl_id: vuelo4.vl_id,
        cat_id: economica.cat_id,
        vlcat_asientos_totales: 100,
        vlcat_asientos_disponibles: 95,
        vlcat_precio_base: 150,
      },
    });

    await prisma.vuelo_categoria.create({
      data: {
        vl_id: vuelo4.vl_id,
        cat_id: ejecutiva.cat_id,
        vlcat_asientos_totales: 30,
        vlcat_asientos_disponibles: 28,
        vlcat_precio_base: 350,
      },
    });

    // ============================================================
    // 11. CREAR ÓRDENES DE COMPRA (CARRITOS)
    // ============================================================
    console.log("\n🛒 Creando órdenes de compra...");
    const orden1 = await prisma.orden_compra.create({
      data: {
        usu_id: usuario1.usu_id,
        orden_estado: "carrito",
        orden_total: 0,
        orden_tipo_entrega: "recoger_aeropuerto",
      },
    });

    const orden2 = await prisma.orden_compra.create({
      data: {
        usu_id: usuario2.usu_id,
        orden_estado: "carrito",
        orden_total: 0,
        orden_tipo_entrega: "domicilio",
      },
    });

    const orden3 = await prisma.orden_compra.create({
      data: {
        usu_id: usuario3.usu_id,
        orden_estado: "pagada",
        orden_total: 300,
        orden_tipo_entrega: "recoger_aeropuerto",
      },
    });

    // ============================================================
    // 12. CREAR RESERVAS
    // ============================================================
    console.log("\n📅 Creando reservas...");
    const reserva1 = await prisma.reserva.create({
      data: {
        orden_id: orden1.orden_id,
        vl_id: vuelo1.vl_id,
        cat_id: economica.cat_id,
        res_cantidad_asientos: 2,
        res_precio_unitario: 150,
      },
    });

    const reserva2 = await prisma.reserva.create({
      data: {
        orden_id: orden2.orden_id,
        vl_id: vuelo2.vl_id,
        cat_id: ejecutiva.cat_id,
        res_cantidad_asientos: 1,
        res_precio_unitario: 450,
      },
    });

    const reserva3 = await prisma.reserva.create({
      data: {
        orden_id: orden3.orden_id,
        vl_id: vuelo4.vl_id,
        cat_id: economica.cat_id,
        res_cantidad_asientos: 2,
        res_precio_unitario: 150,
      },
    });

    // ============================================================
    // 13. CREAR PASAJEROS
    // ============================================================
    console.log("\n👥 Creando pasajeros...");
    const pasajero1 = await prisma.pasajero.create({
      data: {
        res_id: reserva1.res_id,
        pas_nombre: "Juan Pérez García",
        pas_cedula: "1234567890",
        pas_edad: 35,
        pas_tipo: "adulto",
      },
    });

    const pasajero2 = await prisma.pasajero.create({
      data: {
        res_id: reserva1.res_id,
        pas_nombre: "Ana Pérez García",
        pas_cedula: "1234567891",
        pas_edad: 8,
        pas_tipo: "niño",
      },
    });

    const pasajero3 = await prisma.pasajero.create({
      data: {
        res_id: reserva2.res_id,
        pas_nombre: "María García López",
        pas_cedula: "0987654321",
        pas_edad: 28,
        pas_tipo: "adulto",
      },
    });

    const pasajero4 = await prisma.pasajero.create({
      data: {
        res_id: reserva3.res_id,
        pas_nombre: "Carlos Rodríguez Martinez",
        pas_cedula: "1122334455",
        pas_edad: 42,
        pas_tipo: "adulto",
      },
    });

    const pasajero5 = await prisma.pasajero.create({
      data: {
        res_id: reserva3.res_id,
        pas_nombre: "Laura Rodríguez Martinez",
        pas_cedula: "1122334456",
        pas_edad: 40,
        pas_tipo: "adulto",
      },
    });

    // ============================================================
    // 14. CREAR PAGOS
    // ============================================================
    console.log("\n💰 Creando pagos...");
    const pago1 = await prisma.pago.create({
      data: {
        orden_id: orden3.orden_id,
        tarj_id: tarjeta3.tarj_id,
        pago_monto: 300,
        pago_estado: "exitoso",
        pago_codigo_autorizacion: "AUTH-ABC123456",
        pago_metodo: "tarjeta_credito",
      },
    });

    // ============================================================
    // 15. CREAR FACTURAS
    // ============================================================
    console.log("\n📄 Creando facturas...");
    const factura1 = await prisma.factura.create({
      data: {
        orden_id: orden3.orden_id,
        pago_id: pago1.pago_id,
        fac_numero: "001-001-000001",
        fac_subtotal: 300,
        fac_impuestos: 36,
        fac_total: 336,
      },
    });

    // ============================================================
    // 16. CREAR BILLETES
    // ============================================================
    console.log("\n🎫 Creando billetes...");
    await prisma.billete.create({
      data: {
        res_id: reserva3.res_id,
        pas_id: pasajero4.pas_id,
        fac_id: factura1.fac_id,
        bill_codigo: "TK-ABC12345",
        bill_estado: "emitido",
      },
    });

    await prisma.billete.create({
      data: {
        res_id: reserva3.res_id,
        pas_id: pasajero5.pas_id,
        fac_id: factura1.fac_id,
        bill_codigo: "TK-ABC12346",
        bill_estado: "emitido",
      },
    });

    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    console.log("\n✅ ¡SEEDER COMPLETADO EXITOSAMENTE!\n");
    console.log("📊 DATOS CREADOS:");
    console.log("   ✓ 3 Países");
    console.log("   ✓ 4 Provincias");
    console.log("   ✓ 4 Ciudades");
    console.log("   ✓ 3 Aerolíneas");
    console.log("   ✓ 3 Categorías de asiento");
    console.log("   ✓ 3 Usuarios de prueba");
    console.log("   ✓ 3 Tarjetas de crédito");
    console.log("   ✓ 4 Vuelos");
    console.log("   ✓ 8 Categorías de vuelo");
    console.log("   ✓ 3 Órdenes de compra");
    console.log("   ✓ 3 Reservas");
    console.log("   ✓ 5 Pasajeros");
    console.log("   ✓ 1 Pago");
    console.log("   ✓ 1 Factura");
    console.log("   ✓ 2 Billetes\n");

    console.log("🧪 USUARIOS DE PRUEBA:");
    console.log("   1. juan@example.com / password123");
    console.log("   2. maria@example.com / password456");
    console.log("   3. carlos@example.com / password789\n");

    console.log("📡 Para ejecutar nuevamente:");
    console.log("   npm run seed\n");
  } catch (error) {
    console.error("❌ Error en seeder:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
