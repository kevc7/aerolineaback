# 🚀 Pasos para Configurar Supabase

## ✅ Archivos Actualizados

- ✅ `prisma/schema.prisma` - Agregado `directUrl` y modificado `res_subtotal`
- ✅ `supabase-setup.sql` - Script SQL para ejecutar después

---

## 📝 Paso 1: Actualizar tu .env

Asegúrate de que tu `backend/.env` tenga estas variables:

```env
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.sqsljimrctwwaqhedopg:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.sqsljimrctwwaqhedopg:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

PORT=3000
NODE_ENV=development
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
```

⚠️ **Reemplaza `[YOUR-PASSWORD]` con tu contraseña real de Supabase**

---

## 📝 Paso 2: Resetear la Base de Datos en Supabase (OPCIONAL)

Si Supabase tiene tablas existentes que quieres eliminar:

1. Ve a Supabase → SQL Editor
2. Ejecuta este SQL:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

## 📝 Paso 3: Aplicar el Schema con Prisma

```bash
cd backend

# Opción A: Push directo (más rápido)
npx prisma db push --accept-data-loss

# O Opción B: Con migraciones
npx prisma migrate dev --name init
```

Deberías ver:
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client
```

---

## 📝 Paso 4: Ejecutar el Script SQL en Supabase

1. Ve a Supabase → **SQL Editor**
2. Abre el archivo `supabase-setup.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Click en **RUN** o presiona `Ctrl + Enter`

Deberías ver mensajes como:
```
✅ Configuración de Supabase completada exitosamente
✅ Columna calculada: res_subtotal
✅ Triggers: validación y devolución de asientos
```

---

## 📝 Paso 5: Poblar con Datos de Prueba

```bash
npx ts-node prisma/seed.ts
```

Deberías ver:
```
✅ Países creados: 1
✅ Provincias creadas: 24
✅ Ciudades creadas: 8
✅ Aerolíneas creadas: 2
✅ Usuarios creados: 2
✅ Vuelos creados
✅ Categorías de vuelo creadas
...
🎉 ¡Seeding completado exitosamente!
```

---

## 📝 Paso 6: Verificar en Supabase

1. Ve a Supabase → **Table Editor**
2. Deberías ver todas las tablas:
   - usuario
   - pais, provincia, ciudad
   - aerolinea
   - vuelo, vuelo_categoria
   - categoria_asiento
   - orden_compra
   - reserva
   - pasajero
   - tarjeta_credito
   - pago
   - factura
   - billete

3. Click en cada tabla y verifica que tengan datos

---

## 🧪 Paso 7: Probar la Conexión

```bash
# Abrir Prisma Studio para ver los datos
npx prisma studio

# Se abrirá http://localhost:5555
```

---

## ✅ Verificación Final

### Test desde tu aplicación local:

```bash
# Iniciar el backend
npm run dev

# En otra terminal, probar el endpoint:
curl http://localhost:3000/api/vuelos
```

Deberías recibir un JSON con la lista de vuelos.

---

## 🐛 Solución de Problemas

### "P2021: The table does not exist"
```bash
npx prisma db push --force-reset
npx ts-node prisma/seed.ts
```

### "Trigger already exists"
En Supabase SQL Editor:
```sql
DROP TRIGGER IF EXISTS trg_validar_disponibilidad ON reserva;
DROP TRIGGER IF EXISTS trg_devolver_asientos ON reserva;
```
Luego ejecuta `supabase-setup.sql` nuevamente.

### "Connection refused"
Verifica que las URLs en `.env` sean correctas y que la contraseña esté sin `[` `]`.

---

## 🎯 Checklist

- [ ] `.env` actualizado con DATABASE_URL y DIRECT_URL
- [ ] `npx prisma db push` ejecutado exitosamente
- [ ] `supabase-setup.sql` ejecutado en Supabase
- [ ] `npx ts-node prisma/seed.ts` completado
- [ ] Tablas visibles en Supabase Table Editor
- [ ] Datos de prueba cargados correctamente
- [ ] `npx prisma studio` muestra los datos
- [ ] Backend conecta exitosamente a Supabase

---

**¡Una vez completados todos los pasos, tu base de datos en Supabase estará lista!** 🎉

