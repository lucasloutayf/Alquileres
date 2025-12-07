import React, { useRef, useState } from 'react';
import { Download, Copy, Share2, Printer, Clock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import { logger } from '../../utils/logger';

const ReceiptGenerator = ({ payment, tenant, onClose }) => {
  const receiptRef = useRef();
  const [isSharing, setIsSharing] = useState(false);
  
  const generateCanvas = async () => {
    const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
    const element = receiptRef.current;
    
    const fixedWidth = 600;
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: fixedWidth,
      windowWidth: fixedWidth,
    });
    
    return canvas;
  };

  const handleDownloadImage = async () => {
    try {
      const canvas = await generateCanvas();
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `recibo-${tenant.name}-${payment.date}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      logger.error('Error al descargar:', error);
      toast.error('Error al generar la imagen');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyImage = async () => {
    try {
      const canvas = await generateCanvas();
      
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('¡Imagen copiada! Pegá en WhatsApp Web con Ctrl+V');
        } catch {
          toast.error('No se pudo copiar. Usá "Descargar" en su lugar.');
        }
      }, 'image/png', 1.0);
      
    } catch {
      toast.error('Error al copiar la imagen');
    }
  };

  const handleShareWhatsApp = async () => {
    if (!navigator.share) {
      toast.error('Tu navegador no soporta compartir. Usá "Descargar" o "Copiar".');
      return;
    }

    setIsSharing(true);

    try {
      const canvas = await generateCanvas();

      canvas.toBlob(async (blob) => {
          const timestamp = Date.now();
          const filename = `recibo_${tenant.name.replace(/\s+/g, '_')}_${timestamp}.png`;

          try {
            if (!blob) {
              throw new Error('No se pudo generar la imagen');
            }

            const file = new File([blob], filename, { 
              type: 'image/png',
              lastModified: timestamp
            });

            await navigator.share({
              files: [file],
              title: 'Recibo de Pago',
              text: `Recibo - ${tenant.name} - $${payment.amount.toLocaleString('es-AR')}`
            });

            console.log('Compartido exitosamente');

          } catch (shareError) {
            if (shareError.name === 'AbortError') {
              console.log('Usuario canceló');
            } else {
              logger.error('Error al compartir:', shareError);
              const link = document.createElement('a');
              link.download = filename;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
            toast.error('No se pudo compartir. La imagen se descargó.');
          }
        } finally {
          setIsSharing(false);
        }
      }, 'image/png', 1.0);

    } catch (error) {
      logger.error('Error general:', error);
      toast.error('Error al generar el recibo.');
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Recibo visual */}
      <div 
        ref={receiptRef} 
        className="bg-white rounded-lg border-2 border-gray-300 print:border-black" 
        style={{ width: '600px', padding: '2rem', margin: '0 auto' }}
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">RECIBO DE PAGO</h2>
          <p className="text-gray-600 mt-2">Comprobante de alquiler</p>
        </div>
        
        <div className="border-t-2 border-b-2 border-gray-300 py-4 my-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Inquilino</p>
            <p className="font-bold text-2xl text-gray-900">{tenant.name}</p>
          </div>
        </div>

        {/* Desglose si hay ajustes */}
        {payment.adjustmentType && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Monto base:</span>
              <span className="font-semibold text-gray-900">
                ${payment.baseAmount.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className={payment.adjustmentType === 'surcharge' ? 'text-red-600' : 'text-green-600'}>
                {payment.adjustmentType === 'surcharge' ? 'Multa/Cargo:' : 'Descuento:'}
              </span>
              <span className={payment.adjustmentType === 'surcharge' ? 'text-red-600' : 'text-green-600'}>
                {payment.adjustmentType === 'surcharge' ? '+' : '-'}${payment.adjustment.toLocaleString('es-AR')}
              </span>
            </div>
            {payment.adjustmentReason && (
              <p className="text-xs text-gray-600 italic mt-2">Motivo: {payment.adjustmentReason}</p>
            )}
          </div>
        )}

        <div className="my-6 text-center bg-green-50 p-6 rounded-lg">
          <p className="text-gray-600 mb-2">Total Pagado</p>
          <p className="text-4xl md:text-5xl font-bold text-green-600 px-2">
            ${payment.amount.toLocaleString('es-AR')}
          </p>
        </div>

        <div className="mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Fecha de Pago</p>
            <p className="font-bold text-lg text-gray-800">
              {new Date(payment.date).toLocaleDateString('es-AR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-yellow-800 font-medium mb-1">FECHA DE VENCIMIENTO</p>
            <p className="text-2xl font-bold text-yellow-900">
              {payment.dueDate
                ? new Date(payment.dueDate).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : '—'}
            </p>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 pt-4 text-center text-sm text-gray-600">
          <p>Este recibo certifica el pago del alquiler</p>
        </div>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        <Button 
          onClick={handleDownloadImage}
          className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 shadow-none"
          icon={<Download className="w-5 h-5" />}
        >
          <span className="hidden sm:inline">Descargar</span>
        </Button>
        
        <Button 
          onClick={handleCopyImage}
          className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700 shadow-none"
          icon={<Copy className="w-5 h-5" />}
        >
          <span className="hidden sm:inline">Copiar</span>
        </Button>
        
        <Button 
          onClick={handleShareWhatsApp}
          disabled={isSharing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-none"
          icon={isSharing ? <Clock className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
        >
          <span className="hidden sm:inline">{isSharing ? 'Generando...' : 'Compartir'}</span>
        </Button>
        
        <Button 
          onClick={handlePrint}
          className="bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-600 dark:hover:bg-gray-700 shadow-none"
          icon={<Printer className="w-5 h-5" />}
        >
          <span className="hidden sm:inline">Imprimir</span>
        </Button>
      </div>

      <Button 
        onClick={onClose}
        variant="outline"
        className="w-full print:hidden"
        icon={<ArrowLeft className="w-4 h-4" />}
      >
        Volver
      </Button>
    </div>
  );
};

export default ReceiptGenerator;
