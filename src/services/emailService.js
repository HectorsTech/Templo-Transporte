// URL del backend (ajusta según tu entorno)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Enviar email de confirmación de compra de boleto
 */
export const enviarConfirmacionCompra = async (data) => {
    const { nombre, email, origen, destino, fecha, hora, codigo, precio } = data;

    try {
        const response = await fetch(`${API_URL}/send-confirmation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                email,
                origen,
                destino,
                fecha,
                hora,
                codigo,
                precio
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al enviar email');
        }

        const result = await response.json();
        console.log('✅ Email de confirmación enviado:', result.emailId);
        return { success: true, emailId: result.emailId };

    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email de cancelación
 */
export const enviarNotificacionCancelacion = async (data) => {
    const { to_email, to_name, route_name, trip_date, message } = data;

    try {
        const response = await fetch(`${API_URL}/send-cancellation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to_email,
                to_name,
                route_name,
                trip_date,
                message
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al enviar email');
        }

        const result = await response.json();
        console.log('✅ Email de cancelación enviado:', result.emailId);
        return { success: true, emailId: result.emailId };

    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return { success: false, error: error.message };
    }
};
