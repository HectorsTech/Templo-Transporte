import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import transporter from './config/email.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== MIDDLEWARE ====================

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


// ==================== HEALTH CHECK ====================

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({
      status: 'ok',
      database: 'connected',
      message: 'Backend y MySQL funcionando correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ==================== RUTAS ====================

// GET: Obtener todas las rutas activas
app.get('/api/rutas', async (req, res) => {
  try {
    const [rutas] = await pool.query(
      'SELECT * FROM rutas WHERE activa = TRUE ORDER BY nombre'
    );

    // Parsear campos JSON
    const rutasParseadas = rutas.map(r => ({
      ...r,
      paradas: typeof r.paradas === 'string' ? JSON.parse(r.paradas || '[]') : r.paradas,
      dias_operacion: typeof r.dias_operacion === 'string' ? JSON.parse(r.dias_operacion || '[]') : r.dias_operacion
    }));

    res.json(rutasParseadas);
  } catch (error) {
    console.error('Error obteniendo rutas:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Obtener una ruta específica
app.get('/api/rutas/:id', async (req, res) => {
  try {
    const [rutas] = await pool.query(
      'SELECT * FROM rutas WHERE id = ?',
      [req.params.id]
    );

    if (rutas.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    const r = rutas[0];
    const rutaParseada = {
      ...r,
      paradas: typeof r.paradas === 'string' ? JSON.parse(r.paradas || '[]') : r.paradas,
      dias_operacion: typeof r.dias_operacion === 'string' ? JSON.parse(r.dias_operacion || '[]') : r.dias_operacion
    };

    res.json(rutaParseada);
  } catch (error) {
    console.error('Error obteniendo ruta:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear nueva ruta (solo admin)
app.post('/api/rutas', async (req, res) => {
  try {
    const { nombre, origen, destino, paradas, dias_operacion, precio, duracion_minutos, capacidad, hora_salida, hora_llegada } = req.body;

    const [result] = await pool.query(
      `INSERT INTO rutas (nombre, origen, destino, paradas, dias_operacion, precio, duracion_minutos, capacidad, hora_salida, hora_llegada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, origen, destino, JSON.stringify(paradas), JSON.stringify(dias_operacion), precio, duracion_minutos, capacidad || 14, hora_salida, hora_llegada]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      mensaje: 'Ruta creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando ruta:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Actualizar ruta
app.put('/api/rutas/:id', async (req, res) => {
  try {
    const { nombre, origen, destino, paradas, dias_operacion, precio, duracion_minutos, activa, capacidad, hora_salida, hora_llegada } = req.body;

    await pool.query(
      `UPDATE rutas 
       SET nombre = ?, origen = ?, destino = ?, paradas = ?, dias_operacion = ?, 
           precio = ?, duracion_minutos = ?, activa = ?, capacidad = ?, hora_salida = ?, hora_llegada = ?
       WHERE id = ?`,
      [nombre, origen, destino, JSON.stringify(paradas), JSON.stringify(dias_operacion),
        precio, duracion_minutos, activa, capacidad, hora_salida, hora_llegada, req.params.id]
    );

    res.json({ success: true, mensaje: 'Ruta actualizada' });
  } catch (error) {
    console.error('Error actualizando ruta:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Eliminar ruta
app.delete('/api/rutas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM rutas WHERE id = ?', [req.params.id]);
    res.json({ success: true, mensaje: 'Ruta eliminada' });
  } catch (error) {
    console.error('Error eliminando ruta:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== VIAJES ====================

// GET: Obtener viajes disponibles con filtros
// GET: Obtener viajes disponibles (incluyendo paradas intermedias)
app.get('/api/viajes', async (req, res) => {
  try {
    const { origen, destino, fecha } = req.query;

    // 1. Obtener todas las rutas activas que coincidan con el destino (si se especifica)
    let query = `
      SELECT * FROM rutas 
      WHERE activa = TRUE
    `;

    const params = [];

    if (destino) {
      query += ' AND destino LIKE ?';
      params.push(`%${destino}%`);
    }

    const [rutas] = await pool.query(query, params);

    const viajesDisponibles = [];

    // Función auxiliar para sumar minutos a una hora
    const sumarMinutosAHora = (horaString, minutos) => {
      if (!horaString) return '00:00:00';
      const [horas, mins] = horaString.split(':').map(Number);
      const totalMinutos = (horas * 60) + mins + minutos;
      const nuevasHoras = Math.floor(totalMinutos / 60) % 24;
      const nuevosMinutos = totalMinutos % 60;
      return `${String(nuevasHoras).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}:00`;
    };

    // Función auxiliar para calcular diferencia de minutos entre dos horas
    const calcularDiferenciaMinutos = (horaInicio, horaFin) => {
      if (!horaInicio || !horaFin) return 0;
      const [h1, m1] = horaInicio.split(':').map(Number);
      const [h2, m2] = horaFin.split(':').map(Number);
      let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diff < 0) diff += 24 * 60; // Asumir día siguiente si es menor
      return diff;
    };

    // 2. Para cada ruta, generar viajes (completo + desde paradas)
    for (const ruta of rutas) {

      // Parsear paradas
      let paradas = [];
      try {
        paradas = typeof ruta.paradas === 'string'
          ? JSON.parse(ruta.paradas)
          : (ruta.paradas || []);
      } catch (e) {
        paradas = [];
      }

      // Buscar si existe viaje real en BD para esta ruta/fecha
      let viajeExistente = null;
      if (fecha) {
        const [viajes] = await pool.query(
          'SELECT * FROM viajes WHERE ruta_id = ? AND fecha_salida = ?',
          [ruta.id, fecha]
        );
        viajeExistente = viajes[0] || null;
      }

      // Verificar días de operación
      if (fecha) {
        const dateObj = new Date(fecha);
        // Ajustar zona horaria si es necesario, o usar UTC para el día de la semana
        // Mejor usar el array de días en español que guardamos
        const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        // getDay() devuelve 0 para Domingo
        // Ojo: new Date('2026-02-12') es UTC. new Date('2026-02-12T00:00:00') es local.
        // Aseguramos que la fecha se interprete correctamente (YYYY-MM-DD es UTC en JS)
        // Usaremos una librería o split
        const [y, m, d] = fecha.split('-').map(Number);
        const localDate = new Date(y, m - 1, d); // Mes es 0-indexed

        const dayName = daysMap[localDate.getDay()];
        const shortDayMap = { 'Domingo': 'Dom', 'Lunes': 'Lun', 'Martes': 'Mar', 'Miércoles': 'Mie', 'Jueves': 'Jue', 'Viernes': 'Vie', 'Sábado': 'Sab' };
        const shortDay = shortDayMap[dayName];

        let operates = false;
        try {
          const dias = typeof ruta.dias_operacion === 'string' ? JSON.parse(ruta.dias_operacion) : ruta.dias_operacion;
          if (!dias || dias.length === 0) operates = true; // Si no hay restricción, opera siempre (o nunca? Asumimos siempre por defecto si null)
          else if (dias.includes(shortDay) || dias.includes(dayName)) operates = true;
        } catch (e) {
          operates = true;
        }

        if (!operates) continue;
      }

      // Si no hay viaje existente y la fecha es hoy o futuro, crear virtual
      // Comparar como strings YYYY-MM-DD para evitar problemas de zona horaria
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local

      if (!viajeExistente && fecha && fecha < todayStr) {
        continue;
      }

      const asientosTotales = viajeExistente?.asientos_totales || ruta.capacidad || 14;
      const asientosDisponibles = viajeExistente ? viajeExistente.asientos_disponibles : asientosTotales;

      // 2A. Viaje completo (origen principal → destino)
      const cumpleOrigenCompleto = !origen || ruta.origen.toLowerCase().includes(origen.toLowerCase());

      if (cumpleOrigenCompleto) {
        viajesDisponibles.push({
          id: viajeExistente?.id || `virtual-${ruta.id}`,
          ruta_id: ruta.id,
          origen: ruta.origen,
          destino: ruta.destino,
          fecha_salida: fecha || new Date().toISOString().split('T')[0],
          hora_salida: ruta.hora_salida,
          hora_llegada: ruta.hora_llegada,
          precio: parseFloat(ruta.precio),
          asientos_totales: asientosTotales,
          asientos_disponibles: asientosDisponibles,
          parada_abordaje: ruta.origen,
          es_parada_intermedia: false,
          nombre_ruta: ruta.nombre,
          paradas: paradas,
          duracion_minutos: ruta.duracion_minutos
        });
      }

      // 2B. Viajes desde cada parada intermedia → destino
      if (paradas && paradas.length > 0) {
        paradas.forEach(parada => {
          const cumpleOrigenParada = !origen ||
            (parada.name && parada.name.toLowerCase().includes(origen.toLowerCase()));

          if (cumpleOrigenParada) {

            // Calcular hora de salida desde la parada
            // Si la parada tiene hora específica, usarla. Si no, calcular offset.
            let horaSalidaParada = parada.time;
            let minutosDesdeInicio = 0;

            if (parada.time) {
              minutosDesdeInicio = calcularDiferenciaMinutos(ruta.hora_salida, parada.time);
            } else if (parada.timeOffset) {
              minutosDesdeInicio = parada.timeOffset;
              horaSalidaParada = sumarMinutosAHora(ruta.hora_salida, minsOffset);
            }

            // Calcular precio (usar precio_desde_aqui o calcular proporcionalmente)
            let precioParada = parada.precio_desde_aqui || 0;

            if (!precioParada && ruta.duracion_minutos > 0) {
              // Calcular proporcionalmente: (Total - MinutosRecorridos) / Total * Precio
              const minutosRestantes = Math.max(0, ruta.duracion_minutos - minutosDesdeInicio);
              precioParada = (parseFloat(ruta.precio) * minutosRestantes / ruta.duracion_minutos).toFixed(0);
            }

            viajesDisponibles.push({
              id: viajeExistente?.id || `virtual-${ruta.id}-${parada.name.replace(/\s+/g, '-')}`,
              ruta_id: ruta.id,
              origen: parada.name,
              destino: ruta.destino,
              fecha_salida: fecha || new Date().toISOString().split('T')[0],
              hora_salida: horaSalidaParada,
              hora_llegada: ruta.hora_llegada,
              precio: parseFloat(precioParada || ruta.precio), // Fallback al precio total si falla cálculo
              asientos_totales: asientosTotales,
              asientos_disponibles: asientosDisponibles,
              parada_abordaje: parada.name,
              es_parada_intermedia: true,
              nombre_ruta: `${ruta.nombre} (desde ${parada.name})`,
              paradas: paradas,
              duracion_minutos: Math.max(0, ruta.duracion_minutos - minutosDesdeInicio)
            });
          }
        });
      }
    }

    // Ordenar por hora de salida
    viajesDisponibles.sort((a, b) => {
      if (a.hora_salida < b.hora_salida) return -1;
      if (a.hora_salida > b.hora_salida) return 1;
      return 0;
    });

    res.json(viajesDisponibles);

  } catch (error) {
    console.error('Error obteniendo viajes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Obtener viaje específico
app.get('/api/viajes/:id', async (req, res) => {
  try {
    const [viajes] = await pool.query(
      `SELECT v.*, r.nombre as nombre_ruta, r.paradas, r.origen, r.destino
       FROM viajes v 
       INNER JOIN rutas r ON v.ruta_id = r.id 
       WHERE v.id = ?`,
      [req.params.id]
    );

    if (viajes.length === 0) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    res.json(viajes[0]);
  } catch (error) {
    console.error('Error obteniendo viaje:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear nuevo viaje
app.post('/api/viajes', async (req, res) => {
  try {
    const { ruta_id, fecha_salida, hora_salida, precio, asientos_totales } = req.body;

    const [result] = await pool.query(
      `INSERT INTO viajes (ruta_id, fecha_salida, hora_salida, precio, asientos_totales, asientos_ocupados)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [ruta_id, fecha_salida, hora_salida, precio, asientos_totales || 15]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      mensaje: 'Viaje creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando viaje:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Eliminar viaje
app.delete('/api/viajes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM viajes WHERE id = ?', [req.params.id]);
    res.json({ success: true, mensaje: 'Viaje eliminado' });
  } catch (error) {
    console.error('Error eliminando viaje:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== RESERVAS ====================

// POST: Crear nueva reserva (FLEXIBLE: acepta viaje_id O ruta_id+fecha+hora)
app.post('/api/reservas', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { viaje_id, ruta_id, fecha, hora, cliente_nombre, cliente_email, cliente_telefono, precio } = req.body;

    console.log('📝 Nueva reserva iniciada:', {
      viaje_id,
      ruta_id,
      fecha,
      nombre: cliente_nombre,
      email: cliente_email
    });

    await connection.beginTransaction();

    let viajeId = viaje_id;
    let viaje = null;

    // Validar campos requeridos
    if (!cliente_nombre || !cliente_email) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Faltan campos requeridos: cliente_nombre, cliente_email'
      });
    }

    // Si NO viene viaje_id, crear o buscar viaje basado en ruta + fecha + hora
    if (!viajeId) {
      if (!ruta_id || !fecha || !hora) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Se requiere viaje_id O (ruta_id + fecha + hora)'
        });
      }

      // Buscar viaje existente
      const [viajesExistentes] = await connection.query(
        `SELECT v.*, r.origen, r.destino, r.precio, r.nombre as nombre_ruta
         FROM viajes v
         INNER JOIN rutas r ON v.ruta_id = r.id
         WHERE v.ruta_id = ? 
           AND DATE(v.fecha_salida) = DATE(?)
           AND TIME(v.hora_salida) = TIME(?)
           AND v.estado = 'programado'
         LIMIT 1`,
        [ruta_id, fecha, hora]
      );

      if (viajesExistentes.length > 0) {
        // Viaje ya existe
        viaje = viajesExistentes[0];
        viajeId = viaje.id;
      } else {
        // Crear nuevo viaje
        const [rutaInfo] = await connection.query(
          'SELECT * FROM rutas WHERE id = ?',
          [ruta_id]
        );

        if (rutaInfo.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: 'Ruta no encontrada' });
        }

        const ruta = rutaInfo[0];
        const precioFinal = precio || ruta.precio;

        const capacidadTotal = ruta.capacidad || 14;

        console.log('🆕 Creando nuevo viaje para ruta virtual:', {
          ruta_id,
          capacidad: capacidadTotal,
          fecha,
          hora
        });

        const [nuevoViaje] = await connection.query(
          `INSERT INTO viajes (ruta_id, fecha_salida, hora_salida, precio, asientos_totales, asientos_disponibles, estado)
           VALUES (?, ?, ?, ?, ?, ?, 'programado')`,
          [ruta_id, fecha, hora, precioFinal, capacidadTotal, capacidadTotal]
        );

        viajeId = nuevoViaje.insertId;
        viaje = {
          id: viajeId,
          ruta_id,
          fecha_salida: fecha,
          hora_salida: hora,
          hora_llegada: ruta.hora_llegada,
          precio: precioFinal,
          asientos_totales: capacidadTotal,
          asientos_disponibles: capacidadTotal,
          origen: ruta.origen,
          destino: ruta.destino,
          nombre_ruta: ruta.nombre
        };
      }
    } else {
      // Verificar que el viaje existe y tiene disponibilidad
      const [viajes] = await connection.query(
        `SELECT v.*, r.origen, r.destino, r.hora_llegada, r.capacidad, r.precio as precio_ruta, r.nombre as nombre_ruta
         FROM viajes v
         INNER JOIN rutas r ON v.ruta_id = r.id
         WHERE v.id = ? 
           AND v.asientos_disponibles > 0
           AND v.estado = 'programado'
         FOR UPDATE`,
        [viajeId]
      );

      console.log('🎫 Viaje encontrado:', {
        id: viajeId,
        encontrado: viajes.length > 0,
        asientos_disponibles: viajes[0]?.asientos_disponibles,
        asientos_totales: viajes[0]?.asientos_totales
      });

      if (viajes.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'No hay asientos disponibles para este viaje' });
      }

      viaje = viajes[0];
    }

    // Verificar disponibilidad
    if (!viaje.asientos_disponibles || viaje.asientos_disponibles <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No hay asientos disponibles' });
    }

    // Generar código único de reserva (formato más robusto)
    const codigoAleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codigo_visual = `RES-${codigoAleatorio}`;

    // Generar firma QR más robusta usando HMAC
    const qrData = JSON.stringify({
      codigo: codigo_visual,
      viaje_id: viajeId,
      timestamp: Date.now(),
      nombre: cliente_nombre,
      email: cliente_email
    });

    // Firma HMAC con secret key
    const secret = process.env.JWT_SECRET || 'boletera-secret-key-2025';
    const firma_seguridad = crypto
      .createHmac('sha256', secret)
      .update(qrData)
      .digest('hex');

    console.log('✅ QR Generado:', {
      codigo: codigo_visual,
      qr_signature: firma_seguridad.substring(0, 20) + '...'
    });

    // Crear la reserva
    const { parada_abordaje, hora_abordaje } = req.body;

    // Si no se envía parada, usar el origen del viaje
    const paradaAbordajeReal = parada_abordaje || viaje.origen;
    const horaAbordajeReal = hora_abordaje || viaje.hora_salida;

    const [result] = await connection.query(
      `INSERT INTO reservas 
       (viaje_id, codigo_visual, cliente_nombre, cliente_email, cliente_telefono, precio_pagado, firma_seguridad, parada_abordaje, hora_abordaje)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [viajeId, codigo_visual, cliente_nombre, cliente_email, cliente_telefono || null, precio || viaje.precio, firma_seguridad, paradaAbordajeReal, horaAbordajeReal]
    );

    console.log('✅ Reserva creada en BD:', {
      reserva_id: result.insertId,
      codigo: codigo_visual,
      viaje_id: viajeId,
      cliente: cliente_nombre,
      desde: paradaAbordajeReal
    });

    // Actualizar asientos disponibles del viaje
    const asientosAntes = viaje.asientos_disponibles;

    const [updateResult] = await connection.query(
      `UPDATE viajes 
       SET asientos_disponibles = asientos_disponibles - 1,
           updated_at = NOW()
       WHERE id = ? 
       AND asientos_disponibles > 0`,
      [viajeId]
    );

    console.log('✅ Asientos actualizados:', {
      viaje_id: viajeId,
      rows_affected: updateResult.affectedRows
    });

    // Verificar que se actualizó
    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      throw new Error('No se pudo actualizar asientos - pueden estar agotados');
    }

    // Obtener asientos actuales para logging y respuesta
    const [viajeActualizado] = await connection.query(
      'SELECT asientos_disponibles, asientos_totales FROM viajes WHERE id = ?',
      [viajeId]
    );

    const asientosDespues = viajeActualizado[0]?.asientos_disponibles;

    console.log('📊 Asientos actualizados:', {
      viaje_id: viajeId,
      asientos_antes: asientosAntes,
      asientos_despues: asientosDespues,
      asientos_totales: viajeActualizado[0]?.asientos_totales
    });

    // Commit de la transacción
    await connection.commit();

    // Preparar datos para el email
    const emailData = {
      nombre: cliente_nombre,
      email: cliente_email,
      origen: viaje.origen,
      destino: viaje.destino,
      fecha: new Date(viaje.fecha_salida).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      hora: typeof viaje.hora_salida === 'string' ? viaje.hora_salida.substring(0, 5) : viaje.hora_salida,
      codigo: codigo_visual,
      precio: precio || viaje.precio,
      parada_abordaje: paradaAbordajeReal,
      hora_abordaje: horaAbordajeReal
    };

    // Enviar email de confirmación (asíncrono, no bloquear la respuesta)
    enviarEmailConfirmacion(emailData)
      .then(() => console.log(`✅ Email de confirmación enviado a ${cliente_email}`))
      .catch(err => console.error(`⚠️  Error enviando email:`, err.message));

    // Responder al cliente con todos los detalles
    res.status(201).json({
      success: true,
      reserva: {
        id: result.insertId,
        codigo_visual,
        viaje_id: viajeId,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        precio_pagado: viaje.precio,
        origen: viaje.origen,
        destino: viaje.destino,
        fecha: viaje.fecha_salida,
        hora_salida: viaje.hora_salida,
        hora_llegada: viaje.hora_llegada || null
      },
      mensaje: 'Reserva creada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creando reserva:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// GET: Obtener reservas de un viaje específico
app.get('/api/reservas/viaje/:viaje_id', async (req, res) => {
  try {
    const [reservas] = await pool.query(
      `SELECT 
        r.*,
        v.fecha_salida,
        v.hora_salida,
        ruta.origen,
        ruta.destino
       FROM reservas r
       INNER JOIN viajes v ON r.viaje_id = v.id
       INNER JOIN rutas ruta ON v.ruta_id = ruta.id
       WHERE r.viaje_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.viaje_id]
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar reserva por código
app.get('/api/reservas/codigo/:codigo', async (req, res) => {
  try {
    const codigoBuscado = req.params.codigo;

    console.log('🔍 Buscando reserva por código:', codigoBuscado);

    const [reservas] = await pool.query(
      `SELECT 
        r.*,
        v.fecha_salida,
        v.hora_salida,
        ruta.nombre as nombre_ruta,
        ruta.origen,
        ruta.destino
       FROM reservas r
       INNER JOIN viajes v ON r.viaje_id = v.id
       INNER JOIN rutas ruta ON v.ruta_id = ruta.id
       WHERE r.codigo_visual = ?`,
      [codigoBuscado]
    );

    console.log('📋 Resultados encontrados:', reservas.length);

    if (reservas.length === 0) {
      // Log all existing codes for debugging
      const [allCodes] = await pool.query('SELECT id, codigo_visual FROM reservas ORDER BY created_at DESC LIMIT 5');
      console.log('❌ No encontrado. Últimos códigos en BD:', allCodes);
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    console.log('✅ Reserva encontrada:', reservas[0].id, reservas[0].codigo_visual);
    res.json(reservas[0]);
  } catch (error) {
    console.error('Error buscando reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Validar reserva (escanear QR)
app.put('/api/reservas/:id/validar', async (req, res) => {
  try {
    const { validado_por } = req.body;

    const [result] = await pool.query(
      `UPDATE reservas 
       SET validado = TRUE, validado_por = ?, validado_en = NOW()
       WHERE id = ? AND validado = FALSE`,
      [validado_por || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Reserva ya validada o no encontrada' });
    }

    res.json({ success: true, mensaje: 'Reserva validada exitosamente' });
  } catch (error) {
    console.error('Error validando reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CANCELAR VIAJE ====================

// PUT: Cancelar viaje y notificar a pasajeros
app.put('/api/viajes/:id/cancelar', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const viaje_id = req.params.id;
    const { motivo } = req.body;

    // Obtener información del viaje
    const [viajes] = await connection.query(
      `SELECT v.*, r.nombre as nombre_ruta, r.origen, r.destino
       FROM viajes v 
       INNER JOIN rutas r ON v.ruta_id = r.id 
       WHERE v.id = ?`,
      [viaje_id]
    );

    if (viajes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    const viaje = viajes[0];

    // Obtener todas las reservas del viaje
    const [reservas] = await connection.query(
      'SELECT * FROM reservas WHERE viaje_id = ?',
      [viaje_id]
    );

    // Cancelar el viaje
    await connection.query(
      'UPDATE viajes SET estado = "cancelado" WHERE id = ?',
      [viaje_id]
    );

    await connection.commit();

    // Enviar emails de cancelación (asíncrono)
    const emailPromises = reservas.map(reserva => {
      return enviarEmailCancelacion({
        to_email: reserva.cliente_email,
        to_name: reserva.cliente_nombre,
        route_name: `${viaje.origen} → ${viaje.destino}`,
        trip_date: new Date(viaje.fecha_salida).toLocaleDateString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        message: motivo || 'Por motivos operativos'
      });
    });

    Promise.allSettled(emailPromises)
      .then(results => {
        const exitosos = results.filter(r => r.status === 'fulfilled').length;
        console.log(`✅ ${exitosos}/${reservas.length} emails de cancelación enviados`);
      });

    res.json({
      success: true,
      mensaje: `Viaje cancelado. Se notificará a ${reservas.length} pasajero(s)`,
      reservas_afectadas: reservas.length
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error cancelando viaje:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ==================== FUNCIONES DE EMAIL ====================

// Función para enviar email de confirmación
async function enviarEmailConfirmacion(data) {
  const { nombre, email, origen, destino, fecha, hora, codigo, precio, parada_abordaje, hora_abordaje } = data;

  try {
    const mailOptions = {
      from: `"Boletera Templo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Boleto Confirmado - ${codigo}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .ticket-box { background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .ticket-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .ticket-row:last-child { border-bottom: none; }
            .label { color: #6b7280; font-size: 14px; }
            .value { font-weight: 600; color: #111827; }
            .code-box { background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .code { font-size: 24px; font-weight: 700; color: #92400e; letter-spacing: 3px; font-family: monospace; }
            .alert { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 ¡Boleto Confirmado!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Tu reserva ha sido procesada exitosamente</p>
            </div>
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>Tu boleto para el viaje <strong>${origen}</strong> → <strong>${destino}</strong> ha sido confirmado.</p>
              <div class="ticket-box">
                <h3 style="margin-top: 0; color: #111827;">📍 Detalles del Viaje</h3>
                ${parada_abordaje && parada_abordaje !== origen ? `
                  <div class="ticket-row"><span class="label">🚏 Punto de abordaje</span><span class="value">${parada_abordaje}</span></div>
                  <div class="ticket-row"><span class="label">Hora de abordaje</span><span class="value">${hora_abordaje ? (typeof hora_abordaje === 'string' ? hora_abordaje.substring(0, 5) : hora_abordaje) : hora}</span></div>
                ` : ''}
                <div class="ticket-row"><span class="label">Fecha</span><span class="value">${fecha}</span></div>
                <div class="ticket-row"><span class="label">Hora de salida/abordaje</span><span class="value">${hora}</span></div>
                <div class="ticket-row"><span class="label">Origen</span><span class="value">${origen}</span></div>
                <div class="ticket-row"><span class="label">Destino</span><span class="value">${destino}</span></div>
                <div class="ticket-row"><span class="label">Precio pagado</span><span class="value">$${precio} MXN</span></div>
              </div>
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600;">Tu código de reserva</p>
                <div class="code">${codigo}</div>
                 <div style="margin-top: 20px;">
                  <img src="https://quickchart.io/qr?text=${encodeURIComponent(codigo)}&size=200" 
                       alt="QR ${codigo}" 
                       style="max-width: 200px; border-radius: 8px; border: 3px solid #92400e;"/>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Escanea este QR al abordar</p>
                </div>
              </div>
              <div class="alert">
                <p style="margin: 0;"><strong>📱 Importante:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Presenta este código al abordar</li>
                  <li>Llega 10 minutos antes de la hora de salida</li>
                  <li>Guarda este correo para referencia</li>
                </ul>
              </div>
              <p style="margin-top: 30px; color: #6b7280;">¡Buen viaje! 🚌</p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Boletera Templo © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    throw error;
  }
}

// Función para enviar email de cancelación
async function enviarEmailCancelacion(data) {
  const { to_email, to_name, route_name, trip_date, message } = data;

  try {
    const mailOptions = {
      from: `"Boletera Templo" <${process.env.EMAIL_USER}>`,
      to: to_email,
      subject: `❌ Viaje Cancelado - ${route_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 30px; }
            .info-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>❌ Viaje Cancelado</h1></div>
            <div class="content">
              <p>Hola <strong>${to_name}</strong>,</p>
              <p>Lamentamos informarte que el siguiente viaje ha sido cancelado:</p>
              <div class="info-box">
                <p style="margin: 0;"><strong>Ruta:</strong> ${route_name}</p>
                <p style="margin: 10px 0 0 0;"><strong>Fecha:</strong> ${trip_date}</p>
              </div>
              ${message ? `<p><strong>Motivo:</strong> ${message}</p>` : ''}
              <p>Tu reembolso será procesado en las próximas 24-48 horas.</p>
              <p style="margin-top: 30px;">Disculpa las molestias.</p>
              <p><strong>Equipo Boletera Templo</strong></p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Boletera Templo © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de cancelación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error enviando email de cancelación:', error);
    throw error;
  }
}

// Endpoints directos de email (para compatibilidad con tu código actual)
// Confirmación
app.post('/api/send-confirmation', async (req, res) => {
  try {
    const result = await enviarEmailConfirmacion(req.body);
    res.json({ success: true, emailId: result.messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancelación
app.post('/api/send-cancellation', async (req, res) => {
  try {
    const result = await enviarEmailCancelacion(req.body);
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// ==================== CONTACTO ====================

// POST: Enviar mensaje de contacto
app.post('/api/contacto', async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: nombre, email, asunto y mensaje son obligatorios'
      });
    }

    console.log('📨 Nuevo mensaje de contacto:', {
      nombre,
      email,
      asunto
    });

    // Configurar email para el admin
    const mailOptions = {
      from: `"Boletera Templo" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contacto Web] ${asunto}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px; }
            .info-box { background: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .label { font-weight: 600; color: #6b7280; font-size: 14px; margin-bottom: 5px; }
            .value { color: #111827; font-size: 16px; }
            .message-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📨 Nuevo Mensaje de Contacto</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="label">Nombre</div>
                <div class="value">${nombre}</div>
              </div>
              <div class="info-box">
                <div class="label">Email</div>
                <div class="value">${email}</div>
              </div>
              ${telefono ? `
                <div class="info-box">
                  <div class="label">Teléfono</div>
                  <div class="value">${telefono}</div>
                </div>
              ` : ''}
              <div class="info-box">
                <div class="label">Asunto</div>
                <div class="value">${asunto}</div>
              </div>
              <h3 style="margin-top: 30px; color: #111827;">Mensaje:</h3>
              <div class="message-box">${mensaje}</div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                💡 Puedes responder directamente a este email para contactar a ${nombre}
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Boletera Templo © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de contacto enviado correctamente:', info.messageId);

    // Opcional: Enviar confirmación automática al usuario
    try {
      await transporter.sendMail({
        from: `"Boletera Templo" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Mensaje recibido - Boletera Templo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #059669; text-align: center;">¡Gracias por contactarnos!</h2>
            <p>Hola ${nombre},</p>
            <p>Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y te responderemos lo antes posible.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 14px;"><strong>Tu mensaje:</strong><br>${mensaje}</p>
          </div>
        `
      });
    } catch (autoReplyError) {
      console.warn('⚠️ No se pudo enviar autorespuesta:', autoReplyError.message);
    }

    res.json({
      success: true,
      mensaje: 'Mensaje enviado correctamente. Te responderemos pronto.',
      emailId: info.messageId
    });

  } catch (error) {
    console.error('Error procesando mensaje de contacto:', error);
    res.status(500).json({ error: error.message });
  }
});


// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log('================================');
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📧 Email Service: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
  console.log(`📬 Email Contacto: ${process.env.CONTACT_EMAIL}`);
  console.log(`🗄️  Base de datos: ${process.env.DB_NAME}`);
  console.log(`🌐 CORS habilitado para: ${process.env.ALLOWED_ORIGIN}`);
  console.log('================================');
});

