import { useState, useEffect, useRef } from 'react';
import { Bus, MapPin, Calendar, Search, Loader2, X, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

export function Home() {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  
  // Estados para datos dinámicos
  const [availableOrigins, setAvailableOrigins] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el modal
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('rutas')
          .select('*')
          .eq('activa', true);

        if (error) throw error;

        if (data) {
          const origins = [...new Set(data.map(r => r.origen))].sort();
          const destinations = [...new Set(data.map(r => r.destino))].sort();
          
          setAvailableOrigins(origins);
          setAvailableDestinations(destinations);
          setPopularRoutes(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (origin && destination && date) {
      navigate(`/resultados?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`);
    }
  };

  const handleSelectRoute = () => {
    if (selectedRoute) {
      setOrigin(selectedRoute.origen);
      setDestination(selectedRoute.destino);
      setSelectedRoute(null); // Cerrar modal
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Focus a Fecha (sin validación visual)
      setTimeout(() => {
        if (dateInputRef.current) {
          dateInputRef.current.showPicker?.(); // Intenta abrir el picker nativo
          dateInputRef.current.focus();
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-8 h-8 text-blue-600" />
            <h1 className="font-bold text-xl">Boletera Templo</h1>
          </div>
          <Link
            to="/admin"
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Viaja seguro, llega rápido
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Reserva tu lugar en minutos. Sin filas, sin complicaciones.
          </p>
        </div>

        {/* Search Widget */}
        <div className="container mx-auto max-w-2xl">
          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
            <div className="space-y-4">
              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    required
                    disabled={loading}
                  >
                    <option value="">Selecciona tu origen</option>
                    {availableOrigins.map((org) => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    required
                    disabled={loading}
                  >
                    <option value="">Selecciona tu destino</option>
                    {availableDestinations.map((dest) => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de viaje
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={dateInputRef} // Referencia para focus automático
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Cargando rutas...' : 'Buscar Horarios'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Rutas Disponibles
          </h3>
          {loading ? (
             <div className="flex justify-center p-8">
               <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             </div>
          ) : popularRoutes.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {popularRoutes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)} // Abre el modal
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 group relative overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition">
                     <div className="bg-blue-50 text-blue-600 p-1 rounded-full">
                       <ArrowRight className="w-4 h-4" />
                     </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      {route.origen}
                    </div>
                    <div className="pl-2 border-l-2 border-dashed border-gray-200 ml-2.5 py-1"></div>
                    <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full ring-2 ring-gray-300 bg-white"></div>
                      </div>
                      {route.destino}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {route.hora_salida || 'Por definir'}
                      </span>
                      <span className="font-bold text-blue-600">
                        ${route.precio_base}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-gray-500 text-center">No hay rutas activas disponibles.</p>
          )}
        </div>
      </section>

      {/* MODAL DE DETALLES DE RUTA */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
           {/* Backdrop con blur */}
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
             onClick={() => setSelectedRoute(null)}
           ></div>

           {/* Contenido Modal */}
           <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header Modal */}
              <div className="bg-blue-600 p-6 text-white relative">
                 <button 
                    onClick={() => setSelectedRoute(null)} 
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                 >
                    <X className="w-5 h-5 text-white" />
                 </button>
                 
                 <h3 className="text-sm font-medium text-blue-100 mb-1">Detalles del Viaje</h3>
                 <div className="flex items-center gap-3 text-2xl font-bold">
                    <span>{selectedRoute.origen}</span>
                    <ArrowRight className="w-6 h-6 text-blue-200" />
                    <span>{selectedRoute.destino}</span>
                 </div>
                 <div className="mt-4 inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md border border-white/20">
                    <DollarSign className="w-4 h-4 text-green-300" />
                    <span className="font-bold text-xl">${selectedRoute.precio_base} MXN</span>
                 </div>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-6">
                 
                 {/* Días Operativos */}
                 <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Días de Salida</h4>
                    <div className="flex flex-wrap gap-2">
                       {DAYS_OF_WEEK.map(day => {
                         const isActive = selectedRoute.dias_operativos?.includes(day);
                         return (
                           <div 
                             key={day}
                             className={`px-3 py-1 text-sm rounded-lg font-medium border ${
                               isActive 
                                 ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                 : 'bg-gray-50 text-gray-300 border-gray-100'
                             }`}
                           >
                             {day}
                           </div>
                         )
                       })}
                    </div>
                 </div>

                 {/* Horarios */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <p className="text-xs text-gray-400 mb-1">Hora Salida</p>
                       <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                         <Clock className="w-4 h-4 text-blue-500" /> {selectedRoute.hora_salida}
                       </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <p className="text-xs text-gray-400 mb-1">Hora Llegada (Est.)</p>
                       <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                         <Clock className="w-4 h-4 text-gray-400" /> {selectedRoute.hora_llegada}
                       </p>
                    </div>
                 </div>

                 {/* Paradas */}
                 {selectedRoute.paradas && selectedRoute.paradas.length > 0 && (
                    <div>
                       <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Paradas Intermedias</h4>
                       <ul className="space-y-2">
                          {selectedRoute.paradas.map((stop, i) => (
                             <li key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50 p-2 rounded transition">
                                <div className="flex items-center gap-2 text-gray-700">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                   {stop.name}
                                </div>
                                <div className="text-right">
                                   <span className="block text-gray-900 font-medium">{stop.time}</span>
                                   {stop.precio > 0 && (
                                      <span className="text-xs text-gray-500">${stop.precio}</span>
                                   )}
                                </div>
                             </li>
                          ))}
                       </ul>
                    </div>
                 )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                 <button 
                   onClick={handleSelectRoute}
                   className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 group"
                 >
                    <Calendar className="w-5 h-5 group-hover:scale-110 transition" />
                    Seleccionar Fecha y Reservar
                 </button>
                 <p className="text-center text-xs text-gray-400 mt-3">
                    Al hacer clic, completaremos el formulario por ti
                 </p>
              </div>

           </div>
        </div>
      )}
    </div>
  );
}