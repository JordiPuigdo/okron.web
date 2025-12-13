'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useTimeTracking } from 'app/hooks/useTimeTracking';
import { SvgSpinner } from 'app/icons/icons';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';
import { X } from 'lucide-react';

interface CreateTimeTrackingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTimeTrackingModal = ({
  onClose,
  onSuccess,
}: CreateTimeTrackingModalProps) => {
  const { createTimeTracking, isLoading } = useTimeTracking();
  const { operators } = useOperatorHook();

  const [operatorId, setOperatorId] = useState<string>('');
  const [startDateTime, setStartDateTime] = useState<Date>(new Date());
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [comments, setComments] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!operatorId) {
      alert('Selecciona un operario');
      return;
    }

    const result = await createTimeTracking({
      operatorId,
      startDateTime,
      endDateTime: endDateTime || undefined,
      comments: comments || undefined,
    });

    if (result) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Crear Fichaje Manual
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Operario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operario <span className="text-red-500">*</span>
            </label>
            <select
              value={operatorId}
              onChange={e => setOperatorId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un operario</option>
              {operators?.map(op => (
                <option key={op.id} value={op.id}>
                  {op.code} - {op.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora de Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora de Entrada <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={startDateTime}
              onChange={date => setStartDateTime(date || new Date())}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              locale={ca}
              maxDate={new Date()}
              maxTime={new Date()}
              minTime={new Date(new Date().setHours(0, 0, 0, 0))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              wrapperClassName="w-full"
            />
          </div>

          {/* Fecha y Hora de Salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora de Salida (Opcional)
            </label>
            <DatePicker
              selected={endDateTime}
              onChange={date => setEndDateTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              locale={ca}
              maxDate={new Date()}
              minDate={startDateTime}
              placeholderText="Dejar vacío si está abierto"
              isClearable
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              wrapperClassName="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si se deja vacío, el fichaje quedará abierto
            </p>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios (Opcional)
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={3}
              placeholder="Añade notas o comentarios sobre este fichaje..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="secondary" disabled={isLoading}>
              Cancelar
            </Button>
            <Button isSubmit disabled={isLoading}>
              {isLoading ? (
                <>
                  <SvgSpinner className="h-4 w-4 mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Fichaje'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
