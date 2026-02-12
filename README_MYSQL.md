# 🚀 Boletera Templo - Migración a MySQL

## 📋 Resumen

Este proyecto ha sido migrado de **Supabase (PostgreSQL)** a **MySQL** para tener control total sobre los datos en tu propio servidor.

### Stack Tecnológico

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de Datos**: MySQL 8.0+
- **Emails**: Resend API

---

## 📦 Instalación y Configuración

### 1. Instalar MySQL

**Windows:**
1. Descarga MySQL Community Server: https://dev.mysql.com/downloads/mysql/
2. Durante la instalación, anota la contraseña de `root`
3. Deja el puerto por defecto: `3306`

**Verificar instalación:**
```powershell
mysql --version
```

### 2. Crear la Base de Datos

**Opción A - Desde la terminal:**
```powershell
# Conectar a MySQL
mysql -u root -p
# Ingresa tu contraseña cuando te lo pida

# Copiar y pegar el contenido de server/database/schema.sql
```

**Opción B - Desde archivo:**
```powershell
mysql -u root -p < server/database/schema.sql
```

Esto creará:
- Base de datos `boletera_templo`
- Tablas: `rutas`, `viajes`, `reservas`, `usuarios`
- Una ruta de ejemplo
- Un usuario admin (email: admin@templo.com, password: admin123)

### 3. Configurar Variables de Entorno del Backend

Edita `server/.env` y configura:

```env
# Puerto del servidor
PORT=3001

# Resend API Key (obtén una gratis en resend.com)
RESEND_API_KEY=tu_api_key_aqui

# CORS
ALLOWED_ORIGIN=http://localhost:5173

# ==================== MySQL ====================
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_MYSQL_AQUI    # <-- IMPORTANTE: Cambia esto
DB_NAME=boletera_templo
DB_PORT=3306

# JWT (para futuras features)
JWT_SECRET=cambia_esto_en_produccion
```

### 4. Instalar Dependencias

**Backend:**
```powershell
cd server
npm install
```

**Frontend (si no lo has hecho):**
```powershell
cd ..
npm install
```

### 5. Iniciar la Aplicación

Necesitas **2 terminales** abiertas:

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
```

Deberías ver:
```
✅ Conexión a MySQL establecida correctamente
🚀 Servidor corriendo en puerto 3001
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

Deberías ver:
```
VITE v7.3.1  ready in 426 ms
➜  Local:   http://localhost:5173/
```

### 6. Verificar que Funciona

Abre tu navegador en: `http://localhost:3001/api/health`

Deberías ver:
```json
{
  "status": "ok",
  "database": "connected",
  "message": "Backend y MySQL funcionando correctamente"
}
```

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `rutas`
```sql
- id (PK)
- nombre
- origen
- destino
- paradas (JSON)
- dias_operacion (JSON)
- precio
- duracion_minutos
- activa
```

### Tabla: `viajes`
```sql
- id (PK)
- ruta_id (FK -> rutas)
- fecha_salida
- hora_salida
- asientos_totales
- asientos_ocupados
- precio
- estado (programado|en_curso|completado|cancelado)
```

### Tabla: `reservas`
```sql
- id (PK)
- viaje_id (FK -> viajes)
- codigo_visual (UNIQUE)
- cliente_nombre
- cliente_email
- cliente_telefono
- precio_pagado
- validado (boolean)
- firma_seguridad
- validado_por
- validado_en
```

### Tabla: `usuarios`
```sql
- id (PK)
- nombre
- email (UNIQUE)
- password_hash
- rol (admin|chofer|scanner)
- activo
```

---

## 🔌 API Endpoints

### Salud del Sistema
```
GET /api/health
```

### Rutas
```
GET    /api/rutas              # Obtener todas las rutas activas
GET    /api/rutas/:id          # Obtener ruta específica
POST   /api/rutas              # Crear nueva ruta
PUT    /api/rutas/:id          # Actualizar ruta
DELETE /api/rutas/:id          # Eliminar ruta
```

### Viajes
```
GET    /api/viajes?origen=X&destino=Y&fecha=Z    # Buscar viajes
GET    /api/viajes/:id                           # Obtener viaje específico
POST   /api/viajes                               # Crear viaje
DELETE /api/viajes/:id                           # Eliminar viaje
PUT    /api/viajes/:id/cancelar                  # Cancelar viaje y notificar
```

### Reservas
```
POST   /api/reservas                          # Crear reserva
GET    /api/reservas/viaje/:viaje_id          # Obtener reservas de un viaje
GET    /api/reservas/codigo/:codigo           # Buscar por código
PUT    /api/reservas/:id/validar              # Validar reserva (escanear QR)
```

### Emails
```
POST   /api/send-confirmation     # Enviar email de confirmación
POST   /api/send-cancellation     # Enviar email de cancelación
```

---

## 🧪 Testing

### 1. Crear una reserva desde el frontend

1. Ve a `http://localhost:5173`
2. Busca viajes disponibles
3. Completa el formulario de reserva
4. Verifica que llegue el email (si configuraste Resend)

### 2. Verificar en MySQL

```sql
USE boletera_templo;

-- Ver todos los viajes
SELECT * FROM viajes;

-- Ver todas las reservas
SELECT * FROM reservas;

-- Ver detalles completos de reservas
SELECT 
  r.codigo_visual,
  r.cliente_nombre,
  r.cliente_email,
  v.fecha_salida,
  v.hora_salida,
  ruta.origen,
  ruta.destino
FROM reservas r
JOIN viajes v ON r.viaje_id = v.id
JOIN rutas ruta ON v.ruta_id = ruta.id;
```

---

## 🔐 Seguridad

### Importante para Producción:

1. **Cambiar `JWT_SECRET`** en `.env` a algo más seguro
2. **Usar HTTPS** (SSL/TLS)
3. **Validar inputs** en el backend
4. **Rate limiting** para evitar spam
5. **Backups automáticos** de MySQL

---

## 🚨 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"
- Verifica que la contraseña en `server/.env` sea correcta
- Prueba conectarte manualmente: `mysql -u root -p`

### Error: "Unknown database 'boletera_templo'"
- Ejecuta el archivo `server/database/schema.sql`

### Error: "ECONNREFUSED 127.0.0.1:3306"
- MySQL no está corriendo
- Inicia el servicio MySQL

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en puerto 3001
- Verifica CORS en `server/.env`

---

## 📚 Próximos Pasos (Preparación para Servidor Personal)

Una vez que todo funcione localmente:

1. **Configurar Nginx** como reverse proxy
2. **Obtener certificado SSL** (Let's Encrypt)
3. **Configurar PM2** para mantener el backend corriendo
4. **Crear scripts de backup** automático de MySQL
5. **Configurar firewall** del servidor
6. **Optimizar MySQL** para producción

---

## 📞 Soporte

Si tienes problemas, verifica:
1. MySQL está corriendo
2. Las credenciales en `server/.env` son correctas
3. Los puertos 3001 (backend) y 5173 (frontend) están libres
4. Node.js versión 18+ instalado

¡Listo! Ahora tienes control total de tus datos. 🎉
