import { useState, useEffect } from 'react';
import { Bus, MapPin, Loader2, Clock, ArrowRight, Users, ChevronRight, Search, Heart, Shield, Calendar } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerRutas, obtenerViajes } from '../services/apiService';

const DAYS_OF_WEEK_SHORT = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const DAYS_OF_WEEK_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function Home() {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Estados para datos dinámicos
  const [availableOrigins, setAvailableOrigins] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]); // Todos los destinos posibles
  const [activeRoutes, setActiveRoutes] = useState([]); // Guardar rutas activas
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para días disponibles
  const [availableDays, setAvailableDays] = useState([]);
  const [loadingDays, setLoadingDays] = useState(false);

  // Estado para el modal
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await obtenerRutas();

          if (data) {
          const routes = data.filter(r => r.activa);
          setActiveRoutes(routes); // Guardar para uso posterior
          
          // Extraer orígenes incluyendo paradas
          const allOrigins = new Set();
          const allDests = new Set();
          
          routes.forEach(r => {
            allOrigins.add(r.origen);
            allDests.add(r.destino);
            
            // Agregar paradas como orígenes posibles si no es solo destino final
            if (r.paradas && Array.isArray(r.paradas)) {
              r.paradas.forEach(p => {
                if (p.name) allOrigins.add(p.name);
              });
            }
          });
          
          setAvailableOrigins([...allOrigins].sort());
          setAllDestinations([...allDests].sort()); // Guardar todos los destinos
          setAvailableDestinations([...allDests].sort()); // Por defecto, mostrar todos
          setPopularRoutes(routes.slice(0, 3));
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filtrar destinos basados en el origen seleccionado
  useEffect(() => {
    if (!origin) {
      // Si no hay origen seleccionado, mostrar todos los destinos
      setAvailableDestinations(allDestinations);
      setDestination(''); // Limpiar destino seleccionado
      return;
    }

    // Filtrar rutas que tengan el origen seleccionado (directo o parada)
    const filteredRoutes = activeRoutes.filter(r => {
      const origenDirecto = r.origen.toLowerCase() === origin.toLowerCase();
      const paradaMatch = r.paradas && Array.isArray(r.paradas) && r.paradas.some(p => 
        p.name && p.name.toLowerCase() === origin.toLowerCase()
      );
      return origenDirecto || paradaMatch;
    });

    // Extraer destinos únicos de las rutas filtradas
    const destinosDisponibles = new Set();
    filteredRoutes.forEach(r => {
      destinosDisponibles.add(r.destino);
    });

    const sortedDestinos = [...destinosDisponibles].sort();
    setAvailableDestinations(sortedDestinos);
    
    // Si el destino seleccionado ya no está disponible, limpiarlo
    if (destination && !sortedDestinos.includes(destination)) {
      setDestination('');
    }
  }, [origin, activeRoutes, allDestinations, destination]);

  // Cargar días disponibles cuando se seleccionen origen y destino
  useEffect(() => {
    async function fetchAvailableDays() {
      if (!origin || !destination) {
        setAvailableDays([]);
        return;
      }

      try {
        setLoadingDays(true);
        setSelectedDate(null); // Reset selection

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Buscar rutas que coincidan (directas o desde paradas)
        const allRoutes = await obtenerRutas();
        const routes = allRoutes.filter(r => {
            if (!r.activa) return false;
            
            // Checar destino
            const destinoMatch = r.destino.toLowerCase().includes(destination.toLowerCase());
            if (!destinoMatch) return false;

            // Checar origen (directo o parada)
            const origenDirecto = r.origen.toLowerCase().includes(origin.toLowerCase());
            const paradaMatch = r.paradas && Array.isArray(r.paradas) && r.paradas.some(p => 
                p.name && p.name.toLowerCase().includes(origin.toLowerCase())
            );

            return origenDirecto || paradaMatch;
        });

        if (!routes || routes.length === 0) {
          setAvailableDays([]);
          return;
        }

        // 2. Obtener viajes existentes para checar ocupación (pasamos origin para que el backend filtre/genere virtuales)
        const futureTrips = await obtenerViajes({ origen: origin, destino: destination });
        
        console.log('🚌 Viajes obtenidos del backend:', futureTrips.map(t => ({
          id: t.id,
          ruta_id: t.ruta_id,
          fecha_salida: t.fecha_salida,
          hora_salida: t.hora_salida,
          asientos_disponibles: t.asientos_disponibles,
          asientos_totales: t.asientos_totales
        })));

        // 3. Generar próximos días basados en días operativos
        const daysToShow = [];
        const daysToGenerate = 30; // Mostrar próximos 30 días

        for (let i = 0; i < daysToGenerate; i++) {
          const currentDate = new Date();
          currentDate.setDate(today.getDate() + i);
          const dayOfWeek = DAYS_OF_WEEK_SHORT[currentDate.getDay()];

          // Buscar rutas que operen ese día
          const routesForDay = routes.filter(route => {
            const dias = route.dias_operacion || route.dias_operativos;
            return dias && dias.includes(dayOfWeek);
          });

          if (routesForDay.length > 0) {
            // Para cada ruta, calcular disponibilidad
            for (const route of routesForDay) {
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');
              const day = String(currentDate.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              
              // Calcular hora y precio ajustados si el origen es una parada intermedia
              let adjustedTime = route.hora_salida;
              let adjustedPrice = route.precio;
              let originName = route.origen;

              // Si el origen buscado no coincide con el origen de la ruta, buscar en paradas
              if (origin && route.origen.toLowerCase() !== origin.toLowerCase() && route.paradas) {
                  const stop = route.paradas.find(p => p.name && p.name.toLowerCase().includes(origin.toLowerCase()));
                  if (stop) {
                      originName = stop.name;
                      
                      // Ajustar hora
                      if (stop.time) {
                          // Si es hora absoluta, calcular diff para saber si es el mismo viaje
                          // Pero para mostrar, usamos la hora de la parada
                           adjustedTime = stop.time;
                      } else if (stop.timeOffset) {
                          // Calcular hora basada en offset
                          const [h, m] = route.hora_salida.split(':').map(Number);
                          const totalMin = h * 60 + m + stop.timeOffset;
                          const newH = Math.floor(totalMin / 60) % 24;
                          const newM = totalMin % 60;
                          adjustedTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:00`; // Asegurar formato HH:mm:ss
                      }

                      // Ajustar precio
                      if (stop.precio_desde_aqui) {
                          adjustedPrice = stop.precio_desde_aqui;
                      } else {
                          // Calcular proporcional si no hay precio fijo
                          // (Simple fallback, idealmente el backend decide esto)
                          // Si no hay precio explícito, mostramos "Desde $X" o el base
                      }
                  }
              }

              // Formatear hora para comparación (asegurar HH:mm:ss)
              const formatTime = (t) => {
                  if (!t) return '00:00:00';
                  const parts = t.split(':');
                  return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:00`;
              };
              
              const targetTime = formatTime(adjustedTime);

              // Buscar si existe un viaje específico para esta ruta y fecha
              const tripInstance = futureTrips.find(t => {
                // Extraer solo la parte de fecha (YYYY-MM-DD) del timestamp ISO
                const tripDate = t.fecha_salida?.split('T')[0];
                const tripTime = formatTime(t.hora_salida);
                
                // Coincidir ruta, fecha y HORA (la hora del viaje virtual debe coincidir con la calculada)
                return t.ruta_id === route.id && 
                       tripDate === dateStr &&
                       tripTime === targetTime;
              });

              // Si existe un viaje, usar su disponibilidad real; si no, usar capacidad de la ruta
              const disponibles = tripInstance 
                ? tripInstance.asientos_disponibles 
                : route.capacidad;

              // console.log('📅 Fecha:', dateStr, 'Ruta:', route.nombre, {
              //   tripFound: !!tripInstance,
              //   tripId: tripInstance?.id,
              //   asientos_disponibles: tripInstance?.asientos_disponibles,
              //   route_capacidad: route.capacidad,
              //   disponibles_final: disponibles,
              //   adjustedTime,
              //   targetTime
              // });

              if (disponibles > 0) {
                daysToShow.push({
                  routeId: route.id,
                  uniqueId: `${route.id}-${dateStr}-${adjustedTime}`, // ID único para key
                  fecha: dateStr,
                  dia_semana: DAYS_OF_WEEK_FULL[currentDate.getDay()],
                  dia_numero: currentDate.getDate(),
                  mes: MONTHS[currentDate.getMonth()],
                  hora_salida: adjustedTime.substring(0, 5), // Mostrar solo HH:mm
                  asientos_disponibles: disponibles,
                  precio: tripInstance ? tripInstance.precio : adjustedPrice, // Usar precio del viaje si existe (que ya viene ajustado del backend)
                  origen: originName,
                  destino: route.destino
                });
              }
            }
          }
        }

        // Ordenar por fecha
        daysToShow.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setAvailableDays(daysToShow.slice(0, 10)); // Mostrar solo los primeros 10

      } catch (error) {
        console.error('Error al cargar días disponibles:', error);
      } finally {
        setLoadingDays(false);
      }
    }

    fetchAvailableDays();
  }, [origin, destination]);

  const handleSelectDay = (day) => {
    setSelectedDate(day);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (origin && destination && selectedDate) {
      navigate(`/resultados?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(selectedDate.fecha)}`);
    }
  };

  const handleSelectRoute = () => {
    if (selectedRoute) {
      setOrigin(selectedRoute.origen);
      setDestination(selectedRoute.destino);
      setSelectedRoute(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canShowDays = origin && destination && !loadingDays;
  const canSubmit = origin && destination && selectedDate;

  return (
    <div className="min-h-screen relative bg-gray-50">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={loading || (origin && availableDestinations.length === 0)}
                  >
                    <option value="">
                      {!origin 
                        ? 'Selecciona tu destino' 
                        : availableDestinations.length === 0 
                          ? 'No hay destinos disponibles desde este origen'
                          : 'Selecciona tu destino'
                      }
                    </option>
                    {availableDestinations.map((dest) => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Available Days Section */}
              {(origin && destination) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona día de viaje
                  </label>
                  
                  {loadingDays ? (
                    <div className="flex justify-center items-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                      <span className="text-gray-600">Buscando viajes disponibles...</span>
                    </div>
                  ) : availableDays.length === 0 ? (
                    <div className="py-8 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                      <p className="text-yellow-800 font-medium">No hay viajes disponibles para esta ruta</p>
                      <p className="text-yellow-600 text-sm mt-1">Intenta con otro origen o destino</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {availableDays.map((day, index) => (
                        <button
                          key={`${day.routeId}-${day.fecha}-${index}`}
                          type="button"
                          onClick={() => handleSelectDay(day)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                            selectedDate?.fecha === day.fecha && selectedDate?.routeId === day.routeId
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 capitalize">{day.dia_semana}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-600">{day.dia_numero} de {day.mes}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {day.hora_salida}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {day.asientos_disponibles} disponibles
                                </span>
                              </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 transition-all ${
                              selectedDate?.fecha === day.fecha ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Search Button */}
              <button
                type="submit"
                className={`w-full py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg ${
                  canSubmit
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canSubmit}
              >
                <Search className="w-5 h-5" />
                {canSubmit ? 'Ver Horarios' : 'Selecciona origen, destino y fecha'}
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
                  onClick={() => setSelectedRoute(route)}
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
                        ${route.precio}
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

      {/* Blog / About Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Conoce más sobre nosotros
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conectando a las familias con los lugares sagrados, un viaje a la vez
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Article 1 - Quiénes Somos */}
            <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1628880536991-8729fcd571a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRFMlMjB0ZW1wbGUlMjBtb3Jtb24lMjBjaHVyY2h8ZW58MXx8fHwxNzcwODU2OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Templo SUD"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">
                    Nuestra Misión
                  </h4>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Facilitar el acceso a los templos de la Iglesia de Jesucristo de los Santos de los Últimos Días, 
                  brindando un servicio de transporte cómodo, seguro y accesible para todas las familias.
                </p>
                <button className="flex items-center gap-1 text-blue-600 font-medium hover:gap-2 transition-all">
                  Leer más
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </article>

            {/* Article 2 - Por Qué Elegirnos */}
            <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1640522337094-8c71d9c1d6f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB0cmF2ZWxpbmclMjB0b2dldGhlciUyMHZhbnxlbnwxfHx8fDE3NzA4NTY5MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Viajando juntos"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">
                    Por Qué Elegirnos
                  </h4>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Con más de 10 años de experiencia, conocemos las necesidades de nuestra comunidad. 
                  Conductores capacitados, unidades modernas y salidas puntuales garantizan tu tranquilidad.
                </p>
                <button className="flex items-center gap-1 text-blue-600 font-medium hover:gap-2 transition-all">
                  Leer más
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </article>

            {/* Article 3 - Comunidad */}
            <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1722252799088-4781aabc3d0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBjb21tdW5pdHklMjBnYXRoZXJpbmd8ZW58MXx8fHwxNzcwODU2OTI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Comunidad"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">
                    Nuestra Comunidad
                  </h4>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Formamos parte de una gran familia. Miles de miembros confían en nosotros cada mes 
                  para sus visitas al templo, sellando ordenanzas y fortaleciendo lazos familiares.
                </p>
                <button className="flex items-center gap-1 text-blue-600 font-medium hover:gap-2 transition-all">
                  Leer más
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bus className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Unidades Modernas
              </h4>
              <p className="text-sm text-gray-600">
                Vans equipadas con aire acondicionado y asientos cómodos
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Reserva Fácil
              </h4>
              <p className="text-sm text-gray-600">
                Sin registro. Solo elige, reserva y recibe tu código QR
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Salidas Frecuentes
              </h4>
              <p className="text-sm text-gray-600">
                Múltiples horarios durante el día para tu comodidad
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE DETALLES DE RUTA */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
             onClick={() => setSelectedRoute(null)}
           ></div>

           <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden p-6">
              <button 
                 onClick={() => setSelectedRoute(null)} 
                 className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                 <MapPin className="w-5 h-5 text-gray-600" />
              </button>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedRoute.origen} → {selectedRoute.destino}
              </h3>
              
              <p className="text-gray-600 mb-6">
                Haz clic en "Seleccionar" para elegir esta ruta y ver las fechas disponibles.
              </p>

              <button 
                onClick={handleSelectRoute}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Seleccionar Ruta
              </button>
           </div>
        </div>
      )}
    </div>
  );
}