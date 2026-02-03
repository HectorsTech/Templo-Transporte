import { useState, useEffect } from 'react';
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { X, CheckCircle, AlertTriangle, XCircle, ArrowLeft, RefreshCw, Camera } from 'lucide-react';

export function Scanner() {
  const [scanResult, setScanResult] = useState(null); // null | 'success' | 'used' | 'error'
  const [scannedData, setScannedData] = useState(null); // Datos de la reserva
  const [isScanning, setIsScanning] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (detectedCodes) => {
    // Si ya estamos procesando o pausados, ignorar
    if (!isScanning || processing || !detectedCodes || detectedCodes.length === 0) return;

    const rawValue = detectedCodes[0].rawValue;
    if (!rawValue) return;

    setProcessing(true);
    setIsScanning(false); // Pausar escáner visualmente

    try {
      // ---------------------------------------------------------
      // 🛠️ CORRECCIÓN: Detectar si es Código Corto o UUID
      // ---------------------------------------------------------
      const isShortCode = rawValue.startsWith('RES-');
      const searchColumn = isShortCode ? 'codigo_visual' : 'id'; 
      
      // Nota: Si tu columna en Supabase se llama diferente a "codigo", 
      // cambia 'codigo' por el nombre real (ej: 'booking_code').

      // 2. Consultar Supabase
      const { data: reserva, error } = await supabase
        .from('reservas')
        .select(`
          *,
          viajes (
            rutas (
              origen,
              destino
            ),
            fecha_salida
          )
        `)
        .eq(searchColumn, rawValue) // <--- Busca en la columna correcta dinámicamente
        .single();

      if (error || !reserva) {
        setScanResult('error');
        setScannedData(null);
        return;
      }

      // 3. Verificar estado
      if (reserva.validado) {
        setScanResult('used');
        setScannedData(reserva);
      } else {
        // 4. Validar el boleto (Check-in)
        const { error: updateError } = await supabase
          .from('reservas')
          .update({ validado: true })
          .eq('id', reserva.id) // Usamos el ID real que ya encontramos
          .select()
          .single();

        if (updateError) throw updateError;

        setScanResult('success');
        setScannedData(reserva);
      }

    } catch (err) {
      console.error(err);
      setScanResult('error');
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setScannedData(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Botón Salir */}
      <Link to="/admin" className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20">
        <ArrowLeft className="w-6 h-6" />
      </Link>

      {/* TITULO */}
      <div className="absolute top-4 w-full text-center z-40 pointer-events-none">
        <h1 className="text-white font-bold text-lg drop-shadow-md">Escáner de Boletos</h1>
      </div>

      {/* AREA DE ESCANEO */}
      {!scanResult && (
        <div className="w-full h-full absolute inset-0">
          <QrScanner
            onScan={handleScan}
            formats={['qr_code']}
            components={{
              audio: false,
              onOff: false,
              torch: true,
              zoom: false,
              finder: true,
            }}
            styles={{
              container: { width: '100%', height: '100%' },
              video: { objectFit: 'cover' }
            }}
          />
          {processing && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                <RefreshCw className="w-12 h-12 text-white animate-spin" />
             </div>
          )}
        </div>
      )}

      {/* RESULTADO: ÉXITO (VERDE) */}
      {scanResult === 'success' && scannedData && (
        <div className="absolute inset-0 z-50 bg-green-500 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
           <div className="bg-white p-4 rounded-full mb-6 shadow-lg">
             <CheckCircle className="w-16 h-16 text-green-500" />
           </div>
           <h2 className="text-4xl font-bold text-white mb-2">¡PASAJERO VÁLIDO!</h2>
           <p className="text-green-100 text-xl font-medium mb-8">Boleto registrado correctamente.</p>
           
           <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm text-left border border-white/20 shadow-xl">
              <div className="mb-4">
                 <p className="text-green-100 text-sm uppercase font-semibold">Pasajero</p>
                 <p className="text-white text-2xl font-bold">{scannedData.cliente_nombre}</p>
                 <p className="text-green-50 text-sm">{scannedData.cliente_email}</p>
              </div>
              <div className="border-t border-white/20 pt-4">
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-green-100 text-xs uppercase">Ruta</p>
                       <p className="text-white font-medium">
                         {scannedData.viajes?.rutas?.origen} → {scannedData.viajes?.rutas?.destino}
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-green-100 text-xs uppercase">Código</p>
                       <p className="text-white font-mono text-xl">{scannedData.codigo}</p>
                    </div>
                 </div>
              </div>
           </div>

           <button onClick={resetScanner} className="mt-12 bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition flex items-center gap-2">
              <Camera className="w-5 h-5" /> Escanear Siguiente
           </button>
        </div>
      )}

      {/* RESULTADO: YA USADO (AMARILLO) */}
      {scanResult === 'used' && scannedData && (
        <div className="absolute inset-0 z-50 bg-yellow-500 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
           <div className="bg-white p-4 rounded-full mb-6 shadow-lg">
             <AlertTriangle className="w-16 h-16 text-yellow-500" />
           </div>
           <h2 className="text-3xl font-bold text-white mb-2">BOLETO YA USADO</h2>
           <p className="text-yellow-100 text-lg mb-8">Este código ya fue validado anteriormente.</p>
           
           <div className="bg-black/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm text-left border border-black/5 shadow-xl">
              <div className="mb-2">
                 <p className="text-yellow-900/60 text-sm uppercase font-semibold">Pertenece a</p>
                 <p className="text-white text-2xl font-bold">{scannedData.cliente_nombre}</p>
              </div>
              <p className="text-sm text-white/80 mt-2 bg-black/20 p-2 rounded inline-block">
                 ⚠️ Atención: No permitir el acceso si ya ingresó.
              </p>
           </div>

           <button onClick={resetScanner} className="mt-12 bg-white text-yellow-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition flex items-center gap-2">
              <Camera className="w-5 h-5" /> Escanear Siguiente
           </button>
        </div>
      )}

      {/* RESULTADO: ERROR (ROJO) */}
      {scanResult === 'error' && (
        <div className="absolute inset-0 z-50 bg-red-600 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
           <div className="bg-white p-4 rounded-full mb-6 shadow-lg">
             <XCircle className="w-16 h-16 text-red-600" />
           </div>
           <h2 className="text-4xl font-bold text-white mb-2">CÓDIGO INVÁLIDO</h2>
           <p className="text-red-100 text-lg mb-8">No se encontró ninguna reserva con este QR.</p>
           
           <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm border border-white/20 shadow-xl">
              <p className="text-white font-medium">Posibles causas:</p>
              <ul className="text-red-100 text-sm mt-2 text-left list-disc list-inside space-y-1">
                 <li>El boleto es falso o de otra fecha.</li>
                 <li>El código no se leyó correctamente.</li>
                 <li>La reserva fue cancelada en el sistema.</li>
              </ul>
           </div>

           <button onClick={resetScanner} className="mt-12 bg-white text-red-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition flex items-center gap-2">
              <Camera className="w-5 h-5" /> Intentar de Nuevo
           </button>
        </div>
      )}

    </div>
  );
}