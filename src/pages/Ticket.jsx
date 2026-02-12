import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { crearReserva, obtenerViajes } from '../services/apiService';
import { ArrowLeft, Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Printer, X, Ticket as TicketIcon, Loader2, Phone, Mail } from 'lucide-react';
import QRCode from 'react-qr-code';

export function Ticket() {
  const location = useLocation();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(location.state?.reservation || null);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
     if (location.state?.selectedTrip && !confirmedReservation) {
         setSelectedTrip(location.state.selectedTrip);
     }
  }, [location.state, confirmedReservation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmReservation = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      
      try {
        const reservationPayload = {
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            // Datos extra para saber dónde aborda
            parada_abordaje: selectedTrip.parada_abordaje || selectedTrip.origen,
            hora_abordaje: selectedTrip.hora_salida,
            precio: selectedTrip.precio
        };

        // Si es un ID virtual (o no tiene ID porque es generated), usamos ruta/fecha/hora para crear el viaje on-demand
        if (selectedTrip.id && !selectedTrip.id.toString().startsWith('virtual')) {
            reservationPayload.viaje_id = selectedTrip.id;
        } else {
            reservationPayload.ruta_id = selectedTrip.ruta_id;
            reservationPayload.fecha = selectedTrip.fecha_salida || selectedTrip.fecha; // Asegurar campo correcto
            reservationPayload.hora = selectedTrip.hora_salida;
            reservationPayload.hora_origen = selectedTrip.hora_origen; // Identificador del viaje principal
        }

        const result = await crearReserva(reservationPayload);
        
        if (result.success || result.reserva) {
            setConfirmedReservation(result.reserva || result); // Handle varying response structure if any
            setSelectedTrip(null); 
        } else {
            throw new Error(result.error || 'Error al crear reserva');
        }

      } catch (err) {
          console.error(err);
          setError(err.message || 'Error desconocido al procesar la reserva. Intenta de nuevo.');
      } finally {
          setLoading(false);
      }
  };

  if (!selectedTrip && !confirmedReservation) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
              <div className="text-center">
                  <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900">No hay viaje seleccionado</h2>
                  <p className="text-gray-500 mb-6">Por favor selecciona un viaje desde el inicio.</p>
                  <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                      Ir al Inicio
                  </Link>
              </div>
          </div>
      );
  }

  // VISTA: RESERVA CONFIRMADA (TICKET)
  if (confirmedReservation) {
      const formatDate = (dateStr) => {
          const date = new Date(dateStr + 'T12:00:00');
          return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      };

      return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 print:p-0 print:bg-white">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between print:hidden">
                    <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'numeric', year: '2-digit' })}, {new Date().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    <div className="text-center flex-1">
                        <h1 className="text-lg font-semibold text-gray-900">boletera-templo</h1>
                    </div>
                    <div className="w-24"></div>
                </div>

                <div className="mb-4 flex items-center justify-between print:hidden">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Inicio</span>
                    </Link>
                    <button 
                        onClick={() => window.print()} 
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Guardar</span>
                    </button>
                </div>

                {/* Ticket Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:border print:border-gray-200">
                    {/* Success Message */}
                    <div className="text-center py-8 border-b border-gray-100">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                        <h2 className="text-2xl font-bold text-green-700 mb-1">¡Reserva Exitosa!</h2>
                        <p className="text-gray-600">Tu lugar ha sido asegurado.</p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center py-8 border-b border-gray-100">
                        <div className="p-3 border-2 border-gray-900 rounded-lg">
                            <QRCode value={confirmedReservation.codigo_visual || 'ERROR'} size={180} />
                        </div>
                    </div>

                    {/* Boarding Code */}
                    <div className="text-center py-6 border-b border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Código de Abordaje</p>
                        <p className="text-3xl font-bold text-gray-900 tracking-wider">
                            {confirmedReservation.codigo_visual}
                        </p>
                    </div>

                    {/* Trip Details */}
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h3 className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-4">Detalles del Viaje</h3>
                        
                        {/* Origin and Destination */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Origen</p>
                                <p className="text-lg font-bold text-gray-900">{confirmedReservation.origen || selectedTrip?.origen}</p>
                                <p className="text-blue-600 font-semibold">{(confirmedReservation.hora_salida || selectedTrip?.hora_salida || '').substring(0, 5)}</p>
                            </div>
                            
                            <div className="flex-1 flex justify-center px-4">
                                <div className="border-t-2 border-dashed border-gray-300 w-full relative" style={{ top: '12px' }}></div>
                            </div>
                            
                            <div className="flex-1 text-right">
                                <p className="text-xs text-gray-500 mb-1">Destino</p>
                                <p className="text-lg font-bold text-gray-900">{confirmedReservation.destino || selectedTrip?.destino}</p>
                                <p className="text-blue-600 font-semibold">{(confirmedReservation.hora_llegada || selectedTrip?.hora_llegada || '').substring(0, 5)}</p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDate(confirmedReservation.fecha || selectedTrip?.fecha)}</span>
                        </div>
                    </div>

                    {/* Passenger */}
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h3 className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-3">Pasajero</h3>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                            {confirmedReservation.cliente_nombre || confirmedReservation.nombre}
                        </p>
                        <p className="text-blue-600 text-sm">
                            {confirmedReservation.cliente_email || confirmedReservation.email}
                        </p>
                    </div>

                    {/* Reservation ID */}
                    <div className="px-8 py-4 bg-gray-50">
                        <p className="text-xs text-gray-500 text-center">
                            ID de Reserva: {confirmedReservation.id}
                        </p>
                    </div>
                </div>

                {/* Action Buttons (Print Hidden) */}
                <div className="mt-6 flex gap-3 print:hidden">
                    <button 
                        onClick={() => window.print()} 
                        className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir Boleto
                    </button>
                    <Link 
                        to="/" 
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center"
                    >
                        Nueva Búsqueda
                    </Link>
                </div>
            </div>
        </div>
      );
  }

  // VISTA: FORMULARIO DE RESERVA
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Cancelar y Volver</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
         <div className="grid md:grid-cols-3 gap-8 items-start">
            
            {/* Detalles del Viaje */}
            <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-blue-600" /> Resumen del Viaje
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Ruta</p>
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                           <MapPin className="w-4 h-4 text-gray-400" />
                           {selectedTrip.origen} → {selectedTrip.destino}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Fecha</p>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(selectedTrip.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Hora</p>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {selectedTrip.hora_salida.substring(0,5)}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between items-end">
                            <span className="text-gray-500 text-sm">Total a Pagar</span>
                            <span className="text-2xl font-bold text-blue-600">${selectedTrip.precio}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Completa tus datos</h2>
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleConfirmReservation} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="nombre" 
                                    required 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
                                    placeholder="Como aparece en tu identificación"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required 
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
                                        placeholder="Para enviarte el boleto"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono (Opcional)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="tel" 
                                        name="telefono" 
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
                                        placeholder="Para notificaciones importantes"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                                {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                            </button>
                            <p className="text-xs text-center text-gray-500 mt-4">
                                Al confirmar, aceptas nuestros términos y condiciones de servicio.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
         </div>
      </main>
    </div>
  );
}