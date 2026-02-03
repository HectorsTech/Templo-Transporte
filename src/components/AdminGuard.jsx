import { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export function AdminGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verificar sesión al montar
    const session = sessionStorage.getItem('admin_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Comparar con variable de entorno (Definida en .env.local)
    // Fallback 'admin123' solo para evitar bloqueo total si no configuran la variable
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
    if (password === validPassword) {
      sessionStorage.setItem('admin_session', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  // Mientras verifica sesión, no mostrar nada (o un spinner si se desea)
  if (checking) return null;

  // Si está autenticado, renderizar la ruta protegida
  if (isAuthenticated) {
    return children;
  }

  // Si no, mostrar pantalla de bloqueo
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header Visual */}
        <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-6 rotate-3">
             <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Acceso Restringido</h1>
          <p className="text-gray-400">Introduce la clave administrativa para continuar.</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-xl">
           <form onSubmit={handleLogin} className="space-y-6">
              <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña Maestra</label>
                 <div className="relative">
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if(error) setError(false);
                      }}
                      className={`w-full bg-gray-900/50 border ${error ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'} text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all pl-11`}
                      placeholder="••••••••"
                      autoFocus
                    />
                    <ShieldCheck className={`absolute left-4 top-3.5 w-5 h-5 ${error ? 'text-red-500' : 'text-gray-500'}`} />
                 </div>
                 
                 {error && (
                   <div className="mt-3 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-left-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Contraseña incorrecta</span>
                   </div>
                 )}
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                <span>Desbloquear Sistema</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
           </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
           Protected by Boletera Templo S.A.
        </p>
      </div>
    </div>
  );
}
