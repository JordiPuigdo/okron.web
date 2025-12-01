import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';

export const EditableCell: React.FC<{
  value: string;
  onUpdate: (newDescription: string) => void;
  canEdit?: boolean;
  type?: 'text' | 'date';
  placeholder?: string;
}> = ({
  value,
  onUpdate,
  canEdit = true,
  type = 'text',
  placeholder = 'Fes clic per editar',
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState<string>(value);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(newDescription);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onUpdate(newDescription);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      onUpdate(dayjs(date).format('YYYY-MM-DD'));
      setIsEditing(false);
    }
  };

  if (!canEdit)
    return (
      <span>{type === 'date' ? dayjs(value).format('DD/MM/YYYY') : value}</span>
    );

  return isEditing ? (
    <>
      {type === 'text' && (
        <input
          type="text"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      )}
      {type === 'date' && (
        <DatePicker
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="rounded-md"
          selected={dayjs(newDescription).toDate()}
          onBlur={handleBlur}
          onClickOutside={() => setIsEditing(false)}
          onChange={date => {
            handleDateChange(date);
          }}
        />
      )}
    </>
  ) : (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer text-blue-500 hover:underline min-h-[1.5rem] inline-block"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </span>
  );
};
