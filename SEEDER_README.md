# 🌱 Seeder de Datos - Sistema de Reserva de Vuelos

## Descripción

El seeder proporciona datos de prueba realistas para el sistema de reserva de vuelos. Incluye:
- Usuarios de prueba
- Tarjetas de crédito
- Países, provincias y ciudades
- Aerolíneas
- Vuelos con disponibilidad de asientos
- Órdenes, reservas, pasajeros
- Pagos, facturas y billetes

## 📋 Datos que Crea

### Geografía
- **3 Países**: Ecuador, Perú, Colombia
- **4 Provincias**: Pichincha, Guayas, Lima, Cundinamarca
- **4 Ciudades**: Quito (UIO), Guayaquil (GYE), Lima (LIM), Bogotá (BOG)

### Aerolíneas (3)
- LATAM Airlines (LA)
- Avianca (AV)
- Viva Air (VB)

### Categorías de Asiento (3)
- Económica
- Ejecutiva
- Primera Clase

### Usuarios de Prueba (3)
```
Email: juan@example.com
Contraseña: password123
Cédula: 1234567890

Email: maria@example.com
Contraseña: password456
Cédula: 0987654321

Email: carlos@example.com
Contraseña: password789
Cédula: 1122334455
```

### Tarjetas de Crédito (3)
- Juan Pérez → Visa (2027-12-31)
- María García → Mastercard (2026-06-30)
- Carlos Rodríguez → American Express (2028-09-30)

### Vuelos (4)
1. **LA-101**: Quito → Guayaquil (LATAM) - Mañana 08:00
2. **AV-202**: Quito → Lima (Avianca) - En 3 días 10:00
3. **VB-303**: Guayaquil → Bogotá (Viva Air) - En 5 días 12:00
4. **LA-102**: Guayaquil → Quito (LATAM) - Mañana 11:00

### Datos Transaccionales
- **3 Órdenes** (carritos de compra)
- **3 Reservas** (con distintos estados)
- **5 Pasajeros** (adultos y niños)
- **1 Pago** (exitoso)
- **1 Factura** (con IVA calculado)
- **2 Billetes** (emitidos)

## 🚀 Cómo Ejecutar

### Prerequisitos
1. Base de datos PostgreSQL creada y configurada
2. Variable de entorno `DATABASE_URL` configurada en `.env`
3. Prisma Client generado

### Pasos

```bash
# 1. Navegar a la carpeta del backend
cd backend

# 2. Instalar dependencias (si no están instaladas)
npm install

# 3. Generar Prisma Client (si es necesario)
npm run prisma:generate

# 4. Ejecutar migraciones (si es necesario)
npm run prisma:migrate

# 5. EJECUTAR EL SEEDER
npm run seed
```

## 📊 Output Esperado

```
🌱 Iniciando seeder de datos...

📋 Limpiando datos previos...
🌍 Creando países...
🗺️  Creando provincias...
🏙️  Creando ciudades...
✈️  Creando aerolíneas...
💺 Creando categorías de asientos...
👤 Creando usuarios de prueba...
💳 Creando tarjetas de crédito...
🛫 Creando vuelos...
💺 Asignando categorías a vuelos...
🛒 Creando órdenes de compra...
📅 Creando reservas...
👥 Creando pasajeros...
💰 Creando pagos...
📄 Creando facturas...
🎫 Creando billetes...

✅ ¡SEEDER COMPLETADO EXITOSAMENTE!

📊 DATOS CREADOS:
   ✓ 3 Países
   ✓ 4 Provincias
   ✓ 4 Ciudades
   ✓ 3 Aerolíneas
   ✓ 3 Categorías de asiento
   ✓ 3 Usuarios de prueba
   ✓ 3 Tarjetas de crédito
   ✓ 4 Vuelos
   ✓ 8 Categorías de vuelo
   ✓ 3 Órdenes de compra
   ✓ 3 Reservas
   ✓ 5 Pasajeros
   ✓ 1 Pago
   ✓ 1 Factura
   ✓ 2 Billetes
```

## 🔄 Ejecutar Múltiples Veces

El seeder **limpia todos los datos previos** antes de insertar los nuevos. Puedes ejecutarlo múltiples veces sin problemas.

Si quieres **NO limpiar datos**, comenta las líneas de `deleteMany()` en `prisma/seed.ts`.

## 🧪 Probar con los Datos

### 1. Iniciar el servidor
```bash
npm run dev
```

### 2. Hacer login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "correo": "juan@example.com",
  "contrasenia": "password123"
}
```

### 3. Buscar vuelos
```bash
GET http://localhost:3000/api/vuelos/tarifas?origen=1&destino=2&fecha=2025-11-15
```

### 4. Ver órdenes del usuario
```bash
GET http://localhost:3000/api/ordenes/usuario/1
```

### 5. Ver billetes emitidos
```bash
GET http://localhost:3000/api/billetes
```

## 📝 Notas Importantes

1. **Limpieza de datos**: El seeder elimina TODOS los datos antes de ejecutarse. Usar con cuidado en producción.

2. **Fechas dinámicas**: Los vuelos usan fechas relativas (mañana, en 3 días, etc.) para que siempre sean válidos.

3. **Números de tarjeta**: Son números de prueba válidos para testing (NOT reales).

4. **Contraseñas**: NO se hashean en el seeder (como está configurado actualmente).

5. **IDs generados**: Pueden variar dependiendo del estado anterior de la BD. Los IDs mostrados aquí son referencias.

## 🛠️ Personalizar el Seeder

Para agregar más datos, edita `backend/prisma/seed.ts`:

```typescript
// Agregar más usuarios
const usuario4 = await prisma.usuario.create({
  data: {
    usu_correo: "nuevo@example.com",
    usu_contrasenia: "password999",
    usu_cedula: "5555555555",
    usu_nombre: "Nuevo Usuario",
    usu_telefono: "5999999999",
    usu_activo: true,
  },
});

// Luego ejecutar:
// npm run seed
```

## ❌ Solucionar Problemas

### Error: "DATABASE_URL not set"
Asegúrate de tener el archivo `.env` con:
```
DATABASE_URL="postgresql://user:password@localhost:5432/nombre_bd"
```

### Error: "Relación no encontrada"
Asegúrate de que las migraciones se ejecutaron correctamente:
```bash
npm run prisma:migrate
```

### Error: "Violación de constraint único"
El seeder intenta limpiar primero. Si hay bloqueos:
```bash
# Opción 1: Espera un momento y vuelve a intentar
npm run seed

# Opción 2: Resetea toda la BD
npm run prisma:migrate reset
```

## 📚 Referencias

- [Documentación de Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [Documentación de Prisma Client](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

¡Listo! Ahora puedes poblar tu base de datos con datos de prueba. 🚀
