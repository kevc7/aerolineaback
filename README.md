# 🛫 SkyReserva - Backend

Sistema de Reserva de Vuelos - API Backend construida con Node.js, Express y Prisma.

## 🚀 Tecnologías

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - Gestión de base de datos
- **PostgreSQL** - Base de datos
- **Nodemailer** - Envío de emails

## 📋 Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado y corriendo
- npm o yarn

## 🔧 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/aerolineaback.git
cd aerolineaback
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# DATABASE_URL=postgresql://usuario:password@localhost:5432/skyreserva
```

### 4. Configurar la base de datos

```bash
# Crear las tablas
npx prisma migrate deploy

# (Opcional) Poblar con datos de prueba
npx ts-node prisma/seed.ts
```

### 5. Iniciar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

El servidor estará corriendo en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Datos de prueba
├── src/
│   ├── config/
│   │   └── db.ts          # Configuración de Prisma
│   ├── controllers/       # Lógica de negocio
│   ├── routes/            # Rutas de la API
│   ├── services/          # Servicios (email, etc.)
│   └── server.ts          # Punto de entrada
├── .env.example           # Ejemplo de variables de entorno
└── package.json
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Vuelos
- `GET /api/vuelos` - Listar todos los vuelos
- `GET /api/vuelos/:id` - Obtener vuelo por ID
- `GET /api/vuelos/disponibles` - Buscar vuelos disponibles

### Reservas
- `POST /api/reservas` - Crear reserva
- `GET /api/reservas/:id` - Obtener reserva
- `DELETE /api/reservas/:id` - Cancelar reserva

### Órdenes
- `GET /api/ordenes/usuario/:id` - Obtener órdenes de un usuario
- `PUT /api/ordenes/:id/tipo-entrega` - Actualizar tipo de entrega

### Pagos
- `POST /api/pagos/iniciar` - Iniciar pago individual
- `POST /api/pagos/verificar` - Verificar código y confirmar pago
- `POST /api/pagos/iniciar-multiple` - Iniciar pago múltiple
- `POST /api/pagos/verificar-multiple` - Verificar pago múltiple

### Tarjetas
- `GET /api/tarjetas/usuario/:id` - Obtener tarjetas de un usuario
- `POST /api/tarjetas` - Agregar tarjeta
- `DELETE /api/tarjetas/:id` - Eliminar tarjeta

### Billetes
- `GET /api/billetes/usuario/:id` - Obtener billetes de un usuario

## 🚀 Despliegue en Railway

### 1. Crear cuenta en Railway
Visita [railway.app](https://railway.app) y crea una cuenta con GitHub.

### 2. Crear nuevo proyecto
- Click en "New Project"
- Selecciona "Deploy from GitHub repo"
- Selecciona `aerolineaback`

### 3. Agregar PostgreSQL
- Railway detectará automáticamente que necesitas PostgreSQL
- Click en "Add PostgreSQL"

### 4. Configurar variables de entorno
En el dashboard de Railway, agrega:
- `DATABASE_URL` - (Railway la genera automáticamente)
- `PORT` - `3000`
- `NODE_ENV` - `production`
- `EMAIL_USER` - (Opcional) Tu email de Gmail
- `EMAIL_PASSWORD` - (Opcional) Tu contraseña de aplicación

### 5. Deploy
Railway ejecutará automáticamente:
```bash
npm install
npx prisma migrate deploy
npm start
```

Tu API estará disponible en: `https://tu-proyecto.railway.app`

## 📧 Configuración de Email (Opcional)

Para habilitar el envío de códigos de verificación por email:

1. Consulta `CONFIG_EMAIL.md` para instrucciones detalladas
2. Configura `EMAIL_USER` y `EMAIL_PASSWORD` en `.env`
3. Para Gmail, genera una "Contraseña de Aplicación"

Si no configuras email, los códigos se mostrarán solo en consola (válido para desarrollo).

## 🧪 Datos de Prueba

El proyecto incluye un seeder con datos de prueba:

```bash
npx ts-node prisma/seed.ts
```

Esto crea:
- 2 usuarios de prueba (kevin.armijos@example.com / password123)
- 8 ciudades de Ecuador
- 2 aerolíneas
- Múltiples vuelos con diferentes categorías
- Datos relacionados (tarjetas, órdenes, etc.)

## 🛡️ Seguridad

- ✅ Validación de datos en todos los endpoints
- ✅ Tipo de pasajero calculado automáticamente según edad
- ✅ Verificación de disponibilidad de asientos
- ✅ Sistema 2FA para pagos (código por email)
- ✅ CORS configurado para origen específico

## 📝 Scripts Disponibles

```bash
npm run dev          # Inicia servidor en modo desarrollo
npm run build        # Compila TypeScript a JavaScript
npm start            # Inicia servidor en modo producción
npm run seed         # Pobla la BD con datos de prueba
```

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL
Verifica que PostgreSQL esté corriendo y que `DATABASE_URL` sea correcta.

### Migraciones fallan
```bash
npx prisma migrate reset  # ⚠️ ELIMINA TODOS LOS DATOS
npx prisma migrate deploy
```

### Puerto en uso
Cambia el `PORT` en `.env` a otro disponible (ej: 3001).

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## 👥 Autor

Desarrollado como proyecto académico de Sistema de Reserva de Vuelos.

---

Para más información, consulta los archivos:
- `CONFIG_EMAIL.md` - Configuración de correo electrónico
- `SEEDER_README.md` - Información sobre datos de prueba

