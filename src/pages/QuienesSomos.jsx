import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Heart, Award } from 'lucide-react';

export function QuienesSomos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 mb-6 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-4">Quiénes Somos</h1>
          <p className="text-blue-100 text-lg">
            Conoce nuestra misión y compromiso con la comunidad
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Misión */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Target className="text-blue-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Nuestra Misión</h2>
              <p className="text-gray-600 leading-relaxed">
                Boletera Templo nació con el propósito de facilitar el acceso de los fieles 
                al Templo CDMX, ofreciendo un servicio de transporte seguro, cómodo y accesible. 
                Creemos que todos merecen la oportunidad de participar en las actividades del 
                templo sin que la distancia o el costo del transporte sea una barrera.
              </p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Heart className="text-blue-600" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Nuestros Valores</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Servicio</h3>
              <p className="text-gray-600">
                Nos dedicamos a servir con amor y dedicación a cada pasajero.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Seguridad</h3>
              <p className="text-gray-600">
                Tu seguridad es nuestra prioridad en cada viaje.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Accesibilidad</h3>
              <p className="text-gray-600">
                Precios justos y opciones de donación para quienes lo necesiten.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Comunidad</h3>
              <p className="text-gray-600">
                Construimos puentes entre los fieles y el templo.
              </p>
            </div>
          </div>
        </div>

        {/* Historia */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Award className="text-blue-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Nuestra Historia</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Fundada por miembros de la comunidad que identificaron la necesidad de un 
                servicio de transporte confiable hacia el templo, Boletera Templo comenzó 
                como un esfuerzo voluntario y ha crecido hasta convertirse en un servicio 
                establecido que beneficia a cientos de familias.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Cada viaje es una oportunidad para servir, y cada pasajero es parte de 
                nuestra familia extendida. Continuamos creciendo y mejorando para servir 
                mejor a nuestra comunidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
