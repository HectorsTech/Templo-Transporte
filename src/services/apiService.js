const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Helper to safely parse JSON if it comes as string
const safeParseJSON = (data) => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }
    return data;
};

// ==================== RUTAS ====================

export const obtenerRutas = async () => {
    const response = await fetch(`${API_URL}/api/rutas`);
    if (!response.ok) throw new Error('Error obteniendo rutas');
    const rutas = await response.json();
    return rutas.map(r => ({
        ...r,
        paradas: safeParseJSON(r.paradas),
        dias_operacion: safeParseJSON(r.dias_operacion) || safeParseJSON(r.dias_operativos)
    }));
};

export const obtenerRuta = async (id) => {
    const response = await fetch(`${API_URL}/api/rutas/${id}`);
    if (!response.ok) throw new Error('Ruta no encontrada');
    return response.json();
};

export const crearRuta = async (datos) => {
    // Asegurar que dias_operacion se envíe si está presente (para MySQL)
    const body = { ...datos };
    if (datos.dias_operativos && !datos.dias_operacion) {
        body.dias_operacion = datos.dias_operativos;
    }

    const response = await fetch(`${API_URL}/api/rutas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error creando ruta');
    return result;
};

export const actualizarRuta = async (id, datos) => {
    const body = { ...datos };
    if (datos.dias_operativos && !datos.dias_operacion) {
        body.dias_operacion = datos.dias_operativos;
    }

    const response = await fetch(`${API_URL}/api/rutas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error actualizando ruta');
    return result;
};

export const eliminarRuta = async (id) => {
    const response = await fetch(`${API_URL}/api/rutas/${id}`, {
        method: 'DELETE'
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error eliminando ruta');
    return result;
};

// ==================== VIAJES ====================

export const obtenerViajes = async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.origen) params.append('origen', filtros.origen);
    if (filtros.destino) params.append('destino', filtros.destino);
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.ruta_id) params.append('ruta_id', filtros.ruta_id);

    const url = params.toString()
        ? `${API_URL}/api/viajes?${params}`
        : `${API_URL}/api/viajes`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error obteniendo viajes');
    const viajes = await response.json();
    return viajes.map(v => ({
        ...v,
        paradas: safeParseJSON(v.paradas)
    }));
};

export const obtenerViaje = async (id) => {
    const response = await fetch(`${API_URL}/api/viajes/${id}`);
    if (!response.ok) throw new Error('Viaje no encontrado');
    return response.json();
};

export const crearViaje = async (datos) => {
    const response = await fetch(`${API_URL}/api/viajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error creando viaje');
    return result;
};

// ==================== RESERVAS ====================

export const crearReserva = async (datos) => {
    // Mapear campos nombre -> cliente_nombre para compatibilidad con backend
    const body = {
        ...datos,
        cliente_nombre: datos.nombre || datos.cliente_nombre,
        cliente_email: datos.email || datos.cliente_email,
        cliente_telefono: datos.telefono || datos.cliente_telefono
    };

    const response = await fetch(`${API_URL}/api/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error creando reserva');
    }

    return result;
};

export const obtenerReservasPorViaje = async (viaje_id) => {
    const response = await fetch(`${API_URL}/api/reservas/viaje/${viaje_id}`);
    if (!response.ok) throw new Error('Error obteniendo reservas');
    return response.json();
};

export const buscarReservaPorCodigo = async (codigo) => {
    const response = await fetch(`${API_URL}/api/reservas/codigo/${codigo}`);
    if (!response.ok) throw new Error('Reserva no encontrada');
    return response.json();
};

export const cancelarViaje = async (viaje_id, motivo) => {
    const response = await fetch(`${API_URL}/api/viajes/${viaje_id}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error cancelando viaje');
    }


    return result;
};


export const validarReserva = async (reservaId, validadoPor = null) => {
    const response = await fetch(`${API_URL}/api/reservas/${reservaId}/validar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validado_por: validadoPor })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error validando reserva');
    }

    return response.json();
};

// ==================== HEALTH CHECK ====================

export const verificarSalud = async () => {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) throw new Error('Backend no disponible');
    return response.json();
};

// ==================== CONTACTO ====================

export const enviarMensajeContacto = async (datos) => {
    const response = await fetch(`${API_URL}/api/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error enviando mensaje');
    }

    return result;
};
