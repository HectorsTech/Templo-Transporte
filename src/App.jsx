import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Lazy loading de páginas
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Results = lazy(() => import('./pages/Results').then(module => ({ default: module.Results })));

// Ticket page needs special handling if it's not exported as default
// Assuming export function Ticket() {...}
const Ticket = lazy(() => import('./pages/Ticket').then(module => ({ default: module.Ticket })));

// Admin (Componentes pesados)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const Scanner = lazy(() => import('./pages/admin/Scanner').then(module => ({ default: module.Scanner })));

// Páginas informativas
const QuienesSomos = lazy(() => import('./pages/QuienesSomos').then(module => ({ default: module.QuienesSomos })));
const Ayuda = lazy(() => import('./pages/Ayuda').then(module => ({ default: module.Ayuda })));
const Contacto = lazy(() => import('./pages/Contacto').then(module => ({ default: module.Contacto })));
const Donaciones = lazy(() => import('./pages/Donaciones').then(module => ({ default: module.Donaciones })));

// AdminGuard might be default export or named export. Check file.
// Assuming named export based on previous usage: import { AdminGuard } from ...
const AdminGuard = lazy(() => import('./components/AdminGuard').then(module => ({ default: module.AdminGuard })));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/resultados" element={<Results />} />
              <Route path="/boleto" element={<Ticket />} />
              <Route path="/quienes-somos" element={<QuienesSomos />} />
              <Route path="/ayuda" element={<Ayuda />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/donaciones" element={<Donaciones />} />
              <Route path="/admin" element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              } />
              <Route path="/admin/scanner" element={
                <AdminGuard>
                  <Scanner />
                </AdminGuard>
              } />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;