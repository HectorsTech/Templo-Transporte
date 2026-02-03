import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { Ticket } from './pages/Ticket';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Scanner } from './pages/admin/Scanner';
import { AdminGuard } from './components/AdminGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resultados" element={<Results />} />
        <Route path="/boleto" element={<Ticket />} />
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
    </BrowserRouter>
  );
}

export default App;