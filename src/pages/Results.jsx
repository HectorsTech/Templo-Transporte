import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, Users, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { obtenerRutas, obtenerViajes } from '../services/apiService';

export function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchDayLabel, setSearchDayLabel] = useState('');
  const [allRouteMatches, setAllRouteMatches] = useState(false);

  const getDayLabel = (dateString) => {
    if (!dateString) return '';
    const d = new Date(`${dateString}T12:00:00`);
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return days[d.getDay()];
  };

  useEffect(() => {
    async function fetchRoutes() {
      try {
        setLoading(true);
        setError(null);
        setAllRouteMatches(false);
        setTrips([]);

        // Obtener viajes directamente del backend (que ya maneja lógica de paradas y viajes virtuales)
        const availableTrips = await obtenerViajes({ 
            origen: origin, 
            destino: destination, 
            fecha: date 
        });

        if (availableTrips && availableTrips.length > 0) {
            setTrips(availableTrips);
        } else {
            setTrips([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('No se pudieron cargar los viajes. Intenta de nuevo.');
        setLoading(false);
      }
    }

    if (origin && destination && date) {
        fetchRoutes();
    } else {
      setLoading(false);
    }
  }, [origin, destination, date]);

  const handleReserve = (trip) => {
    navigate('/boleto', { state: { selectedTrip: trip } });
  };
    
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
         <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
         <p className="text-gray-600 font-medium">Buscando las mejores rutas para el {searchDayLabel}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Hubo un error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const showSpecificDayEmptyState = trips.length === 0 && allRouteMatches;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a buscar</span>
          </Link>
        </div>
      </header>

      <section className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Resultados de búsqueda
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>
                Origen: <strong className="text-gray-900">{origin || 'Cualquiera'}</strong> → 
                Destino: <strong className="text-gray-900">{destination || 'Cualquiera'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              {date && (
                <span>{new Date(date + 'T12:00:00').toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 px-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          {trips.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              {showSpecificDayEmptyState ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900">Sin salidas para este día</h3>
                  <p className="text-gray-500 max-w-md mx-auto mt-2">
                    Encontramos rutas para tu destino, pero no operan los <strong>{searchDayLabel}</strong>. 
                    Por favor intenta seleccionar otra fecha.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900">No se encontraron viajes</h3>
                  <p className="text-gray-500 mt-2">
                    No tenemos rutas activas que coincidan con tu búsqueda.
                  </p>
                </>
              )}
              <Link to="/" className="inline-block mt-6 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition">
                Cambiar Búsqueda
              </Link>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{trip.nombre}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                          Ruta Directa
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-center">
                        <div>
                             <p className="text-sm text-gray-400">Salida</p>
                             <p className="text-xl font-bold text-gray-900">{(trip.hora_salida || '').substring(0,5)}</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="h-0.5 w-12 bg-gray-300 relative mx-2">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-gray-300"></div>
                            </div>
                        </div>
                         <div>
                             <p className="text-sm text-gray-400">Llegada</p>
                             <p className="text-xl font-bold text-gray-900">{(trip.hora_llegada || '').substring(0,5)}</p>
                        </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ${trip.precio}
                      </div>
                      <div className="text-xs text-gray-500">MXN</div>
                    </div>
                  </div>

                  {trip.paradas && trip.paradas.length > 0 && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Itinerario
                      </h4>
                      <div className="relative">
                        {trip.paradas.map((stop, index) => (
                          <div key={index} className="flex gap-4 relative group">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full border-2 z-10 ${
                                  index === 0 || index === trip.paradas.length - 1
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-blue-400'
                                }`}
                              ></div>
                              {index < trip.paradas.length - 1 && (
                                <div className="w-0.5 h-full bg-blue-200 absolute top-3 bottom-[-12px]"></div>
                              )}
                            </div>

                            <div className={`pb-6 ${index === trip.paradas.length - 1 ? 'pb-0' : ''} flex-1`}>
                              <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-medium text-gray-900 block">
                                    {stop.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {stop.time ? stop.time : `+ ${stop.timeOffset}`}
                                    </span>
                                </div>
                                {stop.precio > 0 && (
                                    <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                        ${stop.precio}
                                    </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                         Capacidad: <span className="font-medium text-gray-900">{trip.asientos_disponibles}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleReserve(trip)}
                      className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <DollarSign className="w-4 h-4" />
                      Reservar Lugar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}