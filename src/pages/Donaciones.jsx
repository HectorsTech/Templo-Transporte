import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users, DollarSign, CreditCard, Building, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function Donaciones() {
  const [copiado, setCopiado] = useState(false);
  
  const numeroCuenta = "1234 5678 9012 3456";
  const clabe = "012345678901234567";

  const copiarAlPortapapeles = (texto, tipo) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(false), 2000);
  };

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
          <div className="flex items-center gap-4 mb-4">
            <Heart size={40} fill="currentColor" />
            <h1 className="text-4xl font-bold">Programa de Donaciones</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Ayuda a que más personas puedan viajar al Templo
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Propósito */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            ¿Para qué se utilizan las donaciones?
          </h2>
          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed">
              Las donaciones recibidas se destinan a <strong>subsidiar boletos de transporte</strong> 
              para personas que desean asistir al Templo CDMX pero que enfrentan dificultades 
              económicas para costear el viaje completo.
            </p>
            <p className="leading-relaxed">
              Creemos que todos merecen la oportunidad de participar en las actividades del 
              templo, sin que la distancia o el costo del transporte sea un obstáculo.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
              <p className="text-blue-800 font-semibold mb-2">
                💡 ¿Cómo funciona?
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-700">
                <li>Recibimos donaciones de la comunidad</li>
                <li>Se crea un fondo para subsidios de viaje</li>
                <li>Personas necesitadas pueden solicitar ayuda</li>
                <li>Se les otorga un boleto gratuito o con descuento</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Impacto */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-gray-800 mb-2">150+</h3>
            <p className="text-gray-600">Personas beneficiadas</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-green-600" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-gray-800 mb-2">$45,000</h3>
            <p className="text-gray-600">En subsidios otorgados</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-purple-600" size={32} fill="currentColor" />
            </div>
            <h3 className="font-bold text-2xl text-gray-800 mb-2">50+</h3>
            <p className="text-gray-600">Donadores activos</p>
          </div>
        </div>

        {/* Información de Donación */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CreditCard size={32} />
            Información para Donar
          </h2>
          
          <div className="space-y-6">
            {/* Transferencia Bancaria */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building size={24} />
                <h3 className="text-xl font-semibold">Transferencia Bancaria</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Banco</p>
                  <p className="font-mono text-lg">Banorte</p>
                </div>
                
                <div>
                  <p className="text-blue-100 text-sm mb-1">Beneficiario</p>
                  <p className="font-mono text-lg">Fondo Solidario Boletera Templo A.C.</p>
                </div>
                
                <div>
                  <p className="text-blue-100 text-sm mb-1">Número de Cuenta</p>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-lg">{numeroCuenta}</p>
                    <button
                      onClick={() => copiarAlPortapapeles(numeroCuenta, 'cuenta')}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                      title="Copiar número de cuenta"
                    >
                      {copiado === 'cuenta' ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Copy size={20} />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-blue-100 text-sm mb-1">CLABE Interbancaria</p>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-lg">{clabe}</p>
                    <button
                      onClick={() => copiarAlPortapapeles(clabe, 'clabe')}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                      title="Copiar CLABE"
                    >
                      {copiado === 'clabe' ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Copy size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Concepto */}
            <div className="bg-yellow-50 text-gray-800 rounded-lg p-4">
              <p className="font-semibold mb-2">📝 Importante:</p>
              <p className="text-sm">
                Por favor incluye en el concepto: <strong>"DONACIÓN TEMPLO"</strong> 
                {' '}seguido de tu nombre para poder enviarte un comprobante.
              </p>
            </div>
          </div>
        </div>

        {/* Transparencia */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            💎 Compromiso de Transparencia
          </h2>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Todas las donaciones son registradas y documentadas</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Los fondos se administran por un comité de la comunidad</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Publicamos reportes trimestrales de ingresos y gastos</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>100% de las donaciones se destinan a subsidios de viaje</span>
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white text-center">
          <Heart size={48} className="mx-auto mb-4" fill="currentColor" />
          <h3 className="text-2xl font-bold mb-2">
            Gracias por tu generosidad
          </h3>
          <p className="text-purple-100 mb-4">
            Cada donación hace posible que más personas puedan asistir al templo.
            Juntos construimos una comunidad más unida.
          </p>
          <p className="text-sm text-purple-200">
            "El que da con alegría, da dos veces"
          </p>
        </div>
      </div>
    </div>
  );
}
