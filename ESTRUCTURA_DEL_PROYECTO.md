# 📋 Estructura del Proyecto - Boletera Templo

## 🎯 Descripción General

**Boletera Templo** es un sistema completo de venta y gestión de boletos de transporte. El proyecto está dividido en dos partes principales:

1. **Frontend** - Aplicación web construida con React + Vite
2. **Backend** - API REST construida con Node.js + Express + MySQL

---

## 📂 Estructura de Directorios

```
boletera-templo/
├── src/                          # Frontend (React)
│   ├── pages/                    # Páginas de la aplicación
│   │   ├── Home.jsx             # Página principal de búsqueda
│   │   ├── Results.jsx          # Resultados de búsqueda de viajes
│   │   ├── Ticket.jsx           # Página de creación de reserva
│   │   └── admin/               # Páginas administrativas
│   │       ├── AdminDashboard.jsx  # Panel de administración
│   │       └── Scanner.jsx         # Escáner de códigos QR
│   ├── components/              # Componentes reutilizables
│   │   └── AdminGuard.jsx       # Protección de rutas admin
│   ├── services/                # Servicios de API
│   │   └── apiService.js        # Funciones para consumir la API
│   ├── assets/                  # Recursos estáticos
│   ├── App.jsx                  # Configuración de rutas
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Estilos globales
├── server/                       # Backend (Node.js)
│   ├── config/                  # Configuraciones
│   │   └── database.js          # Configuración de MySQL
│   ├── index.js                 # Servidor principal con todas las rutas
│   ├── .env                     # Variables de entorno
│   └── package.json             # Dependencias del backend
├── public/                       # Assets públicos
├── Documentation/                # Documentación adicional
└── package.json                 # Dependencias del frontend
```

---

## 🎨 FRONTEND - Aplicación React

### Tecnologías Utilizadas

- **React 19.2.0** - Framework principal
- **React Router DOM 7.13.0** - Navegación entre páginas
- **Vite 7.2.4** - Bundler y servidor de desarrollo
- **Tailwind CSS 4.1.18** - Framework de estilos
- **Lucide React** - Librería de iconos
- **React QR Code** - Generación de códigos QR
- **@yudiel/react-qr-scanner** - Escaneo de códigos QR
- **date-fns** - Manipulación de fechas

### 📄 Páginas y Funcionalidades

#### 1. **Home.jsx** (`/`)
**Función:** Página principal donde los usuarios buscan viajes disponibles.

**Características:**
- 🔍 **Búsqueda de viajes** por destino
- 📅 **Selector de fechas** con calendario visual
- 🗓️ **Vista de días disponibles** - Muestra qué días tienen viajes operando
- 🚌 **Listado de rutas** disponibles según la búsqueda
- ⏰ **Información de horarios** y paradas intermedias
- 💰 **Precios dinámicos** según el punto de abordaje
- 📱 **Diseño responsive** adaptado a móviles

**Flujo de usuario:**
1. Usuario selecciona un destino
2. Elige una fecha del calendario
3. Ve las rutas disponibles para ese día
4. Selecciona una ruta y continúa a `/resultados`

**Estados principales:**
- `destino`: Búsqueda del usuario
- `selectedDate`: Fecha seleccionada
- `rutas`: Lista de rutas disponibles
- `rutasDisponibles`: Rutas filtradas por fecha y destino
- `availableDays`: Días que tienen viajes operando

---

#### 2. **Results.jsx** (`/resultados`)
**Función:** Muestra los viajes disponibles para la búsqueda realizada en Home.

**Características:**
- 🎫 **Listado de viajes** con horarios y precios
- 🗺️ **Información detallada** de origen, destino y paradas
- 👥 **Disponibilidad de asientos** en tiempo real
- 🕐 **Duración estimada** del viaje
- 💵 **Precio por persona**
- ✅ **Botón de reserva** para cada viaje
- 📍 **Paradas intermedias** con precios específicos

**Flujo de usuario:**
1. Usuario ve lista de viajes disponibles
2. Revisa horarios, precios y disponibilidad
3. Selecciona el viaje que le interesa
4. Hace clic en "Reservar" y continúa a `/boleto`

**Parámetros de URL:**
- `origen`: Punto de partida (puede ser parada intermedia)
- `destino`: Punto de llegada
- `fecha`: Fecha del viaje
- `rutaId`: ID de la ruta seleccionada

---

#### 3. **Ticket.jsx** (`/boleto`)
**Función:** Formulario de reserva y confirmación de boleto.

**Características:**
- 📝 **Formulario de datos del pasajero:**
  - Nombre completo
  - Correo electrónico
  - Teléfono (opcional)
- 📊 **Resumen del viaje:**
  - Origen y destino
  - Fecha y hora
  - Precio total
  - Parada de abordaje
- ✅ **Confirmación de reserva**
- 📧 **Envío automático de correo** con el boleto
- 🎫 **Código QR único** para validación
- 🖨️ **Opción de imprimir** el boleto
- 💳 **Estado de la reserva** (confirmada, con código único)

**Flujo de usuario:**
1. Usuario completa el formulario con sus datos
2. Revisa el resumen del viaje
3. Confirma la reserva
4. Recibe confirmación con código QR
5. Puede imprimir o guardar el boleto

**Salidas:**
- **Código visual único** (formato: `RES-XXXXXX`)
- **Email de confirmación** con todos los detalles
- **Código QR firmado** para validación segura

---

#### 4. **AdminDashboard.jsx** (`/admin`)
**Función:** Panel de administración completo para gestionar rutas, viajes y reservas.

**🔐 Protegido con AdminGuard** - Requiere autenticación

**Secciones principales:**

##### A) **Gestión de Rutas**
- ➕ **Crear rutas nuevas** con:
  - Nombre de la ruta
  - Origen y destino
  - Precio base
  - Capacidad de pasajeros
  - Horarios (salida y llegada)
  - Duración en minutos
  - Días de operación
  - Paradas intermedias con:
    - Nombre de la parada
    - Hora de paso
    - Precio desde esa parada
- ✏️ **Editar rutas existentes**
- 🗑️ **Eliminar rutas**
- 🔄 **Activar/desactivar rutas**

##### B) **Gestión de Viajes**
- 📋 **Ver viajes programados** por ruta
- 👥 **Ver pasajeros** de cada viaje
- 📊 **Estadísticas** de ocupación
- ❌ **Cancelar viajes** con notificación automática a pasajeros vía email
- 📱 **Contactar pasajeros** por WhatsApp

##### C) **Estadísticas del Dashboard**
- 🚌 Total de rutas activas
- 🎫 Total de reservas
- 💰 Ingresos totales
- 📊 Gráficos de ocupación

**Características técnicas:**
- **Formularios dinámicos** para añadir/quitar paradas
- **Selector de días** de operación (Lun-Dom)
- **Validación de datos** en tiempo real
- **Confirmaciones** para acciones destructivas
- **Cálculo automático** de precios desde paradas

---

#### 5. **Scanner.jsx** (`/admin/scanner`)
**Función:** Escanear códigos QR de los boletos para validar la entrada de pasajeros.

**🔐 Protegido con AdminGuard** - Requiere autenticación

**Características:**
- 📷 **Escaneo de código QR** usando la cámara
- ✅ **Validación en tiempo real** contra la base de datos
- 🔐 **Verificación de firma de seguridad** (anti-fraude)
- 📋 **Información del pasajero:**
  - Nombre
  - Código de reserva
  - Origen y destino
  - Fecha y hora del viaje
  - Estado de validación
- ⚠️ **Alertas de seguridad:**
  - Boleto ya validado
  - Boleto no encontrado
  - Código QR inválido
- 🔄 **Botón de reset** para escanear siguiente boleto

**Flujo de uso:**
1. Conductor/Admin abre el scanner
2. Escanea el código QR del pasajero
3. Sistema verifica la validez del boleto
4. Muestra estado: ✅ Válido, ⚠️ Ya validado, ❌ Inválido
5. Marca el boleto como usado en la BD
6. Reset para siguiente pasajero

---

### 🛡️ Componentes de Seguridad

#### **AdminGuard.jsx**
**Función:** Proteger rutas administrativas.

**Características:**
- 🔑 **Verificación de autenticación**
- 🚫 **Redirección** si no está autenticado
- 💾 **Persistencia de sesión** con localStorage/sessionStorage
- ⏱️ **Timeout de sesión**

---

### 🔌 Servicios de API

#### **apiService.js**
Centraliza todas las llamadas al backend:

**Rutas:**
- `obtenerRutas()` - GET todas las rutas
- `crearRuta(data)` - POST nueva ruta
- `actualizarRuta(id, data)` - PUT actualizar ruta
- `eliminarRuta(id)` - DELETE ruta

**Viajes:**
- `obtenerViajes(params)` - GET viajes con filtros
- `cancelarViaje(id, motivo)` - PUT cancelar viaje

**Reservas:**
- `crearReserva(data)` - POST nueva reserva
- `buscarReservaPorCodigo(codigo)` - GET buscar por código
- `obtenerReservasPorViaje(viaje_id)` - GET reservas de un viaje
- `validarReserva(id, validador)` - PUT marcar como validado

---

## 🔧 BACKEND - API REST (Node.js + Express)

### Tecnologías Utilizadas

- **Express 4.18.2** - Framework web
- **MySQL2 3.6.5** - Base de datos relacional
- **Resend** - Envío de emails transaccionales
- **bcryptjs 2.4.3** - Hash de contraseñas
- **jsonwebtoken 9.0.2** - Autenticación JWT
- **dotenv** - Variables de entorno
- **CORS** - Manejo de peticiones cross-origin

### 📊 Base de Datos MySQL

#### Tablas principales:

1. **`rutas`**
   - `id` - ID único
   - `nombre` - Nombre de la ruta
   - `origen` - Ciudad/lugar de origen
   - `destino` - Ciudad/lugar de destino
   - `paradas` - JSON con paradas intermedias
   - `dias_operacion` - JSON con días que opera (Lun-Dom)
   - `precio` - Precio base
   - `duracion_minutos` - Duración estimada
   - `capacidad` - Número de asientos
   - `hora_salida` - Hora de salida
   - `hora_llegada` - Hora de llegada
   - `activa` - Boolean si está activa

2. **`viajes`**
   - `id` - ID único
   - `ruta_id` - FK a rutas
   - `fecha_salida` - Fecha del viaje
   - `hora_salida` - Hora de salida
   - `precio` - Precio para este viaje
   - `asientos_totales` - Capacidad
   - `asientos_disponibles` - Asientos libres
   - `estado` - programado/en_curso/completado/cancelado

3. **`reservas`**
   - `id` - ID único
   - `viaje_id` - FK a viajes
   - `codigo_visual` - Código único (RES-XXXXXX)
   - `cliente_nombre` - Nombre del pasajero
   - `cliente_email` - Email del pasajero
   - `cliente_telefono` - Teléfono opcional
   - `precio_pagado` - Precio que pagó
   - `firma_seguridad` - Hash HMAC para QR
   - `validado` - Boolean si ya abordó
   - `validado_por` - Quién validó
   - `validado_en` - Timestamp de validación
   - `parada_abordaje` - Dónde abordará
   - `hora_abordaje` - A qué hora

---

### 🛣️ Endpoints de la API

#### **Health Check**

```
GET /api/health
```
Verifica que el servidor y la base de datos estén funcionando.

**Respuesta:**
```json
{
  "status": "ok",
  "database": "connected",
  "message": "Backend y MySQL funcionando correctamente",
  "timestamp": "2026-02-11T18:37:09.000Z"
}
```

---

#### **RUTAS** (`/api/rutas`)

##### GET `/api/rutas`
Obtiene todas las rutas activas.

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Guadalajara - San Juan",
    "origen": "Guadalajara",
    "destino": "San Juan de los Lagos",
    "paradas": [
      {
        "name": "Zapopan",
        "time": "08:30:00",
        "precio_desde_aqui": 150
      }
    ],
    "dias_operacion": ["Lun", "Mar", "Mie"],
    "precio": 250,
    "duracion_minutos": 120,
    "capacidad": 14,
    "hora_salida": "08:00:00",
    "hora_llegada": "10:00:00",
    "activa": true
  }
]
```

##### GET `/api/rutas/:id`
Obtiene una ruta específica.

##### POST `/api/rutas`
Crea una nueva ruta (admin).

**Body:**
```json
{
  "nombre": "Nueva Ruta",
  "origen": "Ciudad A",
  "destino": "Ciudad B",
  "paradas": [],
  "dias_operacion": ["Lun", "Vie"],
  "precio": 200,
  "duracion_minutos": 90,
  "capacidad": 14,
  "hora_salida": "09:00:00",
  "hora_llegada": "10:30:00"
}
```

##### PUT `/api/rutas/:id`
Actualiza una ruta existente.

##### DELETE `/api/rutas/:id`
Elimina una ruta.

---

#### **VIAJES** (`/api/viajes`)

##### GET `/api/viajes?origen=X&destino=Y&fecha=YYYY-MM-DD`
Obtiene viajes disponibles con filtros.

**Lógica especial:**
- Si no existe un viaje real en la BD, crea uno **virtual** basado en las rutas activas
- Genera viajes desde el **origen principal** y desde **cada parada intermedia**
- Calcula **precios proporcionales** según el punto de abordaje
- Verifica **días de operación** de cada ruta
- Filtra viajes pasados

**Respuesta:**
```json
[
  {
    "id": "virtual-1",
    "ruta_id": 1,
    "origen": "Guadalajara",
    "destino": "San Juan de los Lagos",
    "fecha_salida": "2026-02-15",
    "hora_salida": "08:00:00",
    "hora_llegada": "10:00:00",
    "precio": 250,
    "asientos_totales": 14,
    "asientos_disponibles": 14,
    "parada_abordaje": "Guadalajara",
    "es_parada_intermedia": false,
    "duracion_minutos": 120
  },
  {
    "id": "virtual-1-Zapopan",
    "ruta_id": 1,
    "origen": "Zapopan",
    "destino": "San Juan de los Lagos",
    "fecha_salida": "2026-02-15",
    "hora_salida": "08:30:00",
    "hora_llegada": "10:00:00",
    "precio": 150,
    "asientos_totales": 14,
    "asientos_disponibles": 14,
    "parada_abordaje": "Zapopan",
    "es_parada_intermedia": true,
    "duracion_minutos": 90
  }
]
```

##### GET `/api/viajes/:id`
Obtiene un viaje específico.

##### POST `/api/viajes`
Crea un nuevo viaje manualmente (admin).

##### DELETE `/api/viajes/:id`
Elimina un viaje.

##### PUT `/api/viajes/:id/cancelar`
Cancela un viaje y notifica a todos los pasajeros.

**Body:**
```json
{
  "motivo": "Falla mecánica del vehículo"
}
```

**Proceso:**
1. Marca el viaje como `cancelado`
2. Obtiene todas las reservas del viaje
3. Envía email a cada pasajero notificando la cancelación
4. Incluye el motivo en el email

---

#### **RESERVAS** (`/api/reservas`)

##### POST `/api/reservas`
Crea una nueva reserva.

**Body:**
```json
{
  "viaje_id": 1,
  "ruta_id": 1,
  "fecha": "2026-02-15",
  "hora": "08:00:00",
  "cliente_nombre": "Juan Pérez",
  "cliente_email": "juan@example.com",
  "cliente_telefono": "3331234567",
  "precio": 250,
  "parada_abordaje": "Guadalajara",
  "hora_abordaje": "08:00:00"
}
```

**Lógica:**
- **Transacción atómica** (todo o nada)
- Si no existe el viaje en BD, lo **crea automáticamente**
- **Verifica disponibilidad** de asientos
- **Actualiza asientos disponibles** (decrementa en 1)
- Genera **código visual único** (RES-XXXXXX)
- Genera **firma HMAC** para seguridad del QR
- **Envía email** de confirmación con código QR
- **Bloqueo de fila** (FOR UPDATE) para evitar doble venta

**Respuesta:**
```json
{
  "success": true,
  "reserva": {
    "id": 123,
    "codigo_visual": "RES-A3F9K2",
    "viaje_id": 1,
    "cliente_nombre": "Juan Pérez",
    "cliente_email": "juan@example.com",
    "precio_pagado": 250,
    "origen": "Guadalajara",
    "destino": "San Juan de los Lagos",
    "fecha": "2026-02-15",
    "hora_salida": "08:00:00"
  }
}
```

##### GET `/api/reservas/viaje/:viaje_id`
Obtiene todas las reservas de un viaje específico.

##### GET `/api/reservas/codigo/:codigo`
Busca una reserva por su código visual.

**Ejemplo:** `GET /api/reservas/codigo/RES-A3F9K2`

##### PUT `/api/reservas/:id/validar`
Valida una reserva (marca como abordado).

**Body:**
```json
{
  "validado_por": "Conductor Juan"
}
```

**Proceso:**
- Marca `validado = TRUE`
- Guarda quién validó y cuándo
- Solo permite validar una vez

---

### 📧 Sistema de Emails

Usa **Resend** para envío transaccional.

#### Emails automáticos:

1. **Confirmación de reserva**
   - Enviado al crear una reserva
   - Incluye código QR embebido
   - Datos completos del viaje
   - Instrucciones de abordaje

2. **Cancelación de viaje**
   - Enviado al cancelar un viaje
   - Notifica a todos los pasajeros
   - Incluye motivo de cancelación
   - Información de contacto para reembolso

---

### 🔐 Seguridad

#### Generación de Códigos QR:

```javascript
const qrData = JSON.stringify({
  codigo: "RES-A3F9K2",
  viaje_id: 1,
  timestamp: 1707679029000,
  nombre: "Juan Pérez",
  email: "juan@example.com"
});

const firma = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(qrData)
  .digest('hex');
```

Esta firma se verifica al escanear el QR para evitar falsificaciones.

---

## 🔄 Flujo Completo de Uso

### **Usuario Final:**

1. **Búsqueda** (`/`)
   - Selecciona destino y fecha
   - Ve rutas disponibles

2. **Selección** (`/resultados`)
   - Compare horarios y precios
   - Elige viaje y punto de abordaje

3. **Reserva** (`/boleto`)
   - Llena formulario con datos
   - Confirma reserva
   - Recibe email con código QR

4. **Abordaje** (día del viaje)
   - Muestra código QR al conductor
   - Conductor escanea con `/admin/scanner`
   - Sistema valida y permite abordaje

### **Administrador:**

1. **Gestión de rutas** (`/admin`)
   - Crea rutas nuevas
   - Define horarios, precios y paradas
   - Configura días de operación

2. **Monitoreo** (`/admin`)
   - Ve viajes programados
   - Consulta reservas por viaje
   - Ve estadísticas de ocupación

3. **Validación** (`/admin/scanner`)
   - Escanea códigos QR
   - Valida entrada de pasajeros
   - Detecta boletos duplicados/inválidos

4. **Gestión de emergencias** (`/admin`)
   - Cancela viajes si es necesario
   - Sistema notifica automáticamente a pasajeros

---

## 🚀 Comandos de Desarrollo

### Frontend:
```bash
cd c:\Users\Gothics\proyectos\boletera-templo
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (puerto 5173)
npm run build        # Build de producción
```

### Backend:
```bash
cd c:\Users\Gothics\proyectos\boletera-templo\server
npm install          # Instalar dependencias
npm run dev          # Servidor con hot-reload (puerto 3001)
npm start            # Servidor de producción
```

---

## 🌐 Variables de Entorno

### Frontend (`.env.local`):
```env
VITE_API_URL=http://localhost:3001
```

### Backend (`server/.env`):
```env
PORT=3001
ALLOWED_ORIGIN=http://localhost:5173

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=boletera_templo

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Security
JWT_SECRET=tu_secreto_super_seguro
```

---

## 📊 Características Técnicas Destacadas

### Frontend:
✅ **Lazy loading** de páginas para mejor rendimiento  
✅ **Diseño responsive** con Tailwind CSS  
✅ **Gestión de estado** con React Hooks  
✅ **Navegación declarativa** con React Router  
✅ **Componentes reutilizables**  
✅ **Validación de formularios**  
✅ **Manejo de errores** con try-catch  
✅ **Loading states** y UX mejorada  

### Backend:
✅ **Transacciones SQL** para integridad de datos  
✅ **Bloqueos optimistas** (FOR UPDATE)  
✅ **Viajes virtuales** basados en rutas  
✅ **Cálculo dinámico de precios** por parada  
✅ **Firma HMAC** para seguridad de QR  
✅ **Emails transaccionales** automáticos  
✅ **Logging detallado** para debugging  
✅ **CORS configurado** para seguridad  
✅ **Manejo de errores** robusto  

---

## 📝 Notas Importantes

1. **Viajes Virtuales:** El sistema no requiere que se creen viajes manualmente. Basándose en las rutas activas, genera viajes virtuales automáticamente. Solo se crea el registro en BD cuando alguien hace una reserva.

2. **Paradas Intermedias:** Cada parada puede tener su propio precio configurado (`precio_desde_aqui`). Si no se configura, el sistema calcula proporcionalmente según la distancia restante.

3. **Asientos:** Se controlan en tiempo real con transacciones SQL para evitar sobreventa.

4. **Seguridad QR:** Cada código QR tiene una firma HMAC que se verifica al escanear, imposibilitando falsificaciones.

5. **Notificaciones:** Los emails se envían de forma asíncrona para no bloquear las respuestas HTTP.

---

## 🎯 Próximas Mejoras Potenciales

- [ ] Sistema de pagos en línea
- [ ] Historial de viajes del usuario
- [ ] Reportes y analíticas avanzadas
- [ ] App móvil nativa
- [ ] Sistema de puntos/lealtad
- [ ] Asignación de asientos específicos
- [ ] Integración con WhatsApp Business API
- [ ] Multi-idioma
- [ ] Modo oscuro

---

**Desarrollado con ❤️ para Templo Transporte**  
*Sistema completo de boletería digital*
