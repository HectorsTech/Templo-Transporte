import { Link } from 'react-router-dom';
import { Home, HelpCircle, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-700 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Columna 1: Logo y Descripción */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">🚌 Boletera Templo</h3>
            <p className="text-blue-100 text-sm">
              Servicio de transporte seguro y confiable hacia el Templo CDMX.
              Viaja cómodo, llega a tiempo.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-blue-100 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Home size={16} />
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/quienes-somos" 
                  className="text-blue-100 hover:text-white flex items-center gap-2 transition-colors"
                >
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link 
                  to="/donaciones" 
                  className="text-blue-100 hover:text-white flex items-center gap-2 transition-colors"
                >
                  💝 Donaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Soporte */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/ayuda" 
                  className="text-blue-100 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <HelpCircle size={16} />
                  Ayuda
                </Link>
              </li>
              <li>
                <Link 
                  to="/contacto" 
                  className="text-blue-100 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Mail size={16} />
                  Contáctanos
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Redes Sociales */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-800 p-3 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-800 p-3 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-800 p-3 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisora */}
        <div className="border-t border-blue-600 mt-8 pt-8 text-center">
          <p className="text-blue-100 text-sm">
            © {new Date().getFullYear()} Boletera Templo. Todos los derechos reservados.
          </p>
          <p className="text-blue-200 text-xs mt-2">
            Diseñado con ❤️ para servir a la comunidad
          </p>
        </div>
      </div>
    </footer>
  );
}
