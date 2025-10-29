# 📧 Configuración del Servicio de Email

## 1. Crear/Editar archivo `.env`

En la raíz del directorio `backend`, crea o edita el archivo `.env` y agrega:

```env
# Base de datos (ya deberías tenerla)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reserva_vuelos?schema=public"

# Configuración de Email
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion

# Entorno
NODE_ENV=development
```

## 2. Obtener Contraseña de Aplicación de Gmail

### Opción A: Si tienes verificación en 2 pasos (recomendado)

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a **Seguridad**
3. En "Cómo acceder a Google", selecciona **Verificación en dos pasos**
4. Al final de la página, busca **Contraseñas de aplicaciones**
5. Selecciona "Correo" y "Otro (nombre personalizado)"
6. Escribe "SkyReserva" y haz clic en **Generar**
7. Copia la contraseña de 16 caracteres (sin espacios)
8. Pégala en `EMAIL_PASSWORD` en tu `.env`

### Opción B: Sin verificación en 2 pasos (menos seguro)

1. Ve a https://myaccount.google.com/lesssecureapps
2. Activa "Permitir el acceso de aplicaciones menos seguras"
3. Usa tu contraseña normal de Gmail en `EMAIL_PASSWORD`

**⚠️ Nota:** Google recomienda usar verificación en 2 pasos con contraseñas de aplicación.

## 3. Ejemplo de `.env` completo

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reserva_vuelos?schema=public"
EMAIL_USER=skyreserva@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
NODE_ENV=development
```

## 4. Usando otros proveedores

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=tu_correo@outlook.com
EMAIL_PASSWORD=tu_contraseña
```

### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=tu_correo@yahoo.com
EMAIL_PASSWORD=tu_contraseña
```

### Servidor SMTP personalizado
```env
EMAIL_HOST=smtp.tuservidor.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@tuservidor.com
EMAIL_PASSWORD=tu_contraseña
EMAIL_SECURE=false
```

## 5. Verificar la configuración

Después de configurar, reinicia el servidor backend:
```bash
npm run dev
```

El sistema intentará verificar la conexión al iniciar. Busca en la consola:
```
✅ Configuración de email verificada correctamente
```

Si ves un error, revisa:
- Que el correo y contraseña sean correctos
- Que tengas contraseña de aplicación (Gmail)
- Que el acceso de aplicaciones menos seguras esté activado (si aplica)

## 6. Probar el envío

Una vez configurado, cuando un usuario inicie un pago:
1. Se generará un código de 6 dígitos
2. Se enviará un correo HTML al usuario con el código
3. El usuario ingresará el código para completar el pago

## ¿Problemas?

Si tienes errores, verifica los logs en la consola del backend. El error más común es la autenticación con Gmail.

