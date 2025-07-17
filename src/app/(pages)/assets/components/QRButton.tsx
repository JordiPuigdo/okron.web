import { useRef, useState } from 'react';
import { Button } from 'designSystem/Button/Buttons';
import { QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRButton({ assetId }: { assetId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const qrRef = useRef<HTMLCanvasElement>(null);

  const handleGenerateQR = () => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/assets/detail?id=${assetId}`;
    setQrUrl(fullUrl);
    setIsModalOpen(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrUrl);
    alert('URL copiada!');
  };

  const handleDownload = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${assetId}.png`;
    a.click();
  };

  return (
    <>
      <div
        data-tooltip-id="QR"
        data-tooltip-content="Generar QR"
        className="flex items-center justify-center"
      >
        <Button
          onClick={handleGenerateQR}
          className="rounded-3xl"
          customStyles="flex p-0"
        >
          <QrCode className="text-white" />
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">QR generat</h2>

            <div className="flex justify-center mb-4">
              <QRCodeCanvas
                id="qrCode"
                value={qrUrl}
                size={200}
                level="H"
                includeMargin
                ref={qrRef}
              />
            </div>

            <div className="bg-gray-100 text-sm p-3 rounded break-all mb-4">
              {qrUrl}
            </div>

            <div className="flex justify-end gap-3 flex-wrap">
              <Button
                onClick={handleCopy}
                customStyles="flex px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm "
              >
                Copiar URL
              </Button>
              <Button
                onClick={handleDownload}
                customStyles="flex px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
              >
                Descarregar QR
              </Button>
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm items-center"
              >
                Obrir
              </a>
              <Button
                onClick={() => setIsModalOpen(false)}
                customStyles="flex px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
              >
                Tancar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
