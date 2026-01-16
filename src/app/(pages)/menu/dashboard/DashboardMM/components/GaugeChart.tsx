import { useEffect, useRef } from 'react';

interface GaugeChartProps {
  percentage: number; // 0-100, porcentaje de correctivo
  title: string;
  size?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  percentage,
  title,
  size = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Limitar el porcentaje entre 0 y 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Determinar el estado basado en el porcentaje
  const getStatus = () => {
    if (clampedPercentage <= 20)
      return { label: 'Excel·lent', color: '#0CA678' };
    if (clampedPercentage <= 40) return { label: 'Molt bé', color: '#37B24D' };
    if (clampedPercentage <= 60)
      return { label: 'Acceptable', color: '#F59F00' };
    if (clampedPercentage <= 80)
      return { label: 'Millorable', color: '#F76707' };
    return { label: 'Crític', color: '#E03131' };
  };

  const status = getStatus();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración del canvas para alta resolución
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * 0.65 * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.65}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size * 0.55;
    const radius = size * 0.4;
    const lineWidth = size * 0.12;

    // Limpiar canvas
    ctx.clearRect(0, 0, size, size);

    // Ángulos: de 180° (izquierda) a 0° (derecha) - semicírculo superior
    const startAngle = Math.PI; // 180°
    const endAngle = 0; // 0°

    // Dibujar el arco de fondo con degradado
    const gradient = ctx.createLinearGradient(0, centerY, size, centerY);
    gradient.addColorStop(0, '#0CA678'); // Verde - excelente
    gradient.addColorStop(0.25, '#37B24D'); // Verde claro
    gradient.addColorStop(0.5, '#F59F00'); // Amarillo - medio
    gradient.addColorStop(0.75, '#F76707'); // Naranja
    gradient.addColorStop(1, '#E03131'); // Rojo - crítico

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Dibujar la aguja
    const needleAngle = Math.PI - (clampedPercentage / 100) * Math.PI;
    const needleLength = radius - lineWidth / 2 - 5;
    const needleX = centerX + needleLength * Math.cos(needleAngle);
    const needleY = centerY - needleLength * Math.sin(needleAngle);

    // Sombra de la aguja
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    // Aguja
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.strokeStyle = '#020D29';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();

    // Círculo central (pivote de la aguja)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#020D29';
    ctx.fill();

    // Círculo interior del pivote
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#647296';
    ctx.fill();
  }, [clampedPercentage, size]);

  return (
    <div className="flex flex-col items-center">
      {/* Título */}
      <p className="text-sm font-medium text-grey-70 mb-2">{title}</p>

      {/* Canvas del gauge */}
      <div className="relative">
        <canvas ref={canvasRef} />

        {/* Porcentaje debajo */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-center">
          <span className="text-3xl font-bold" style={{ color: status.color }}>
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      </div>

      {/* Estado */}
      <div
        className="mt-6 px-4 py-1.5 rounded-full text-sm font-medium"
        style={{
          backgroundColor: `${status.color}15`,
          color: status.color,
        }}
      >
        {status.label}
      </div>
    </div>
  );
};

export default GaugeChart;
