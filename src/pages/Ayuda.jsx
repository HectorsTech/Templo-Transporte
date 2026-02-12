import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Phone, Mail } from 'lucide-react';

export function Ayuda() {
  const faqs = [
    {
      pregunta: "¿Cómo puedo reservar un boleto?",
      respuesta: "Ingresa a la página de inicio, selecciona tu origen, destino y fecha. Te mostraremos los viajes disponibles y podrás reservar en línea."
    },
    {
      pregunta: "¿Dónde puedo ver mi boleto?",
      respuesta: "Tu boleto se enviará automáticamente a tu correo electrónico después de la compra. También puedes descargarlo como PDF con el código QR."
    },
    {
      pregunta: "¿Puedo cancelar mi reserva?",
      respuesta: "Sí, contáctanos con al menos 24 horas de anticipación para procesar tu cancelación y reembolso."
    },
    {
      pregunta: "¿Qué pasa si pierdo mi boleto?",
      respuesta: "No te preocupes, puedes buscarlo en tu correo electrónico o contactarnos con tu código de reserva y te lo reenviaremos."
    },
    {
      pregunta: "¿Los precios incluyen todas las paradas?",
      respuesta: "El precio depende de dónde abordes. Si subes en una parada intermedia, pagarás menos que el precio completo desde el origen."
    },
    {
      pregunta: "¿Cómo funcionan las donaciones?",
      respuesta: "Las donaciones ayudan a subsidiar boletos para personas que no pueden costear el viaje completo. Visita nuestra página de donaciones para más información."
    }
  ];

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
          <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
          <p className="text-blue-100 text-lg">
            Encuentra respuestas a las preguntas más frecuentes
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Contacto Rápido */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Phone className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-lg">Teléfono</h3>
            </div>
            <p className="text-gray-600">+52 55 1234 5678</p>
            <p className="text-sm text-gray-500 mt-1">Lun - Sáb: 8:00 AM - 8:00 PM</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-lg">Email</h3>
            </div>
            <p className="text-gray-600">ayuda@boleteratemplo.com</p>
            <p className="text-sm text-gray-500 mt-1">Respuesta en 24 horas</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <HelpCircle className="text-blue-600" size={32} />
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {faq.pregunta}
                </h3>
                <p className="text-gray-600">
                  {faq.respuesta}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Aún tienes dudas */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <h3 className="font-bold text-xl text-gray-800 mb-2">
            ¿Aún tienes dudas?
          </h3>
          <p className="text-gray-600 mb-4">
            Estamos aquí para ayudarte. Contáctanos directamente.
          </p>
          <Link
            to="/contacto"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Ir a Contacto
          </Link>
        </div>
      </div>
    </div>
  );
}
