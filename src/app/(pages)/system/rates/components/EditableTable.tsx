import { useState } from 'react';
import { Checkbox, ListItemText, MenuItem, Select } from '@mui/material';
import { DayOfWeek, Rate } from 'app/interfaces/Rate';

// Ensure the keys match the actual values of DayOfWeek
// Use the actual DayOfWeek enum/union values as keys
const dayOfWeekLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: 'Dilluns',
  [DayOfWeek.Tuesday]: 'Dimarts',
  [DayOfWeek.Wednesday]: 'Dimecres',
  [DayOfWeek.Thursday]: 'Dijous',
  [DayOfWeek.Friday]: 'Divendres',
  [DayOfWeek.Saturday]: 'Dissabte',
  [DayOfWeek.Sunday]: 'Diumenge',
};

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode) | string;
  editable?: boolean; // si la columna es editable inline
  inputType?: string; // "text", "number", etc. para input
  width?: string;
};

export function EditableTable<T extends { id: string }>({
  columns,
  data,
  onUpdate,
  onDelete,
  loading,
}: {
  columns: Column<T>[];
  data: T[];
  onUpdate: (id: string, newData: Partial<T>) => Promise<void>;
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<T>>({});

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // evitar que se envíe un form o algo no deseado
      handleSave();
    }
  };

  // Abrir edición: carga datos al formulario local
  const startEditing = (row: T) => {
    setEditingId(row.id);
    setEditForm(row);
  };

  // Cambiar input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!editingId) return;
    await onUpdate(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };
  const editFormTyped = editForm as Partial<Rate>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            {columns.map((col, idx) => (
              <th key={idx} className={`p-3 ${col.width || ''}`}>
                {col.header}
              </th>
            ))}
            <th className="p-3 text-right">Accions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            {
              row.id;
            }
            const isEditing = editingId === row.id;

            return (
              <tr key={row.id} className="border-t">
                {columns.map((col, idx) => {
                  const value =
                    typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : row[col.accessor as keyof T];

                  if (isEditing && col.editable) {
                    if (col.inputType === 'daysOfWeek') {
                      const value = editFormTyped.daysOfWeek ?? [];

                      return (
                        <td key={idx} className="p-3">
                          <Select
                            multiple
                            value={value}
                            onChange={e =>
                              setEditForm(prev => ({
                                ...prev,
                                daysOfWeek: e.target.value as DayOfWeek[],
                              }))
                            }
                            renderValue={selected =>
                              ([...selected] as DayOfWeek[])
                                .sort((a, b) => a - b) // ordena también para el texto
                                .map(v => dayOfWeekLabels[v])
                                .join(', ')
                            }
                            fullWidth
                          >
                            {Object.entries(dayOfWeekLabels).map(
                              ([key, label]) => {
                                const numericKey = Number(key) as DayOfWeek;
                                return (
                                  <MenuItem
                                    key={numericKey}
                                    value={numericKey}
                                    className={`${
                                      value.includes(numericKey)
                                        ? 'bg-blue-900'
                                        : 'bg-gray-200'
                                    } rounded-md`}
                                  >
                                    <Checkbox
                                      checked={value.includes(numericKey)}
                                    />
                                    <ListItemText primary={label} />
                                  </MenuItem>
                                );
                              }
                            )}
                          </Select>
                        </td>
                      );
                    }
                    if (col.inputType === 'checkbox') {
                      return (
                        <td
                          key={idx}
                          className="flex p-6 items-center justify-center "
                        >
                          <input
                            type="checkbox"
                            name={
                              typeof col.accessor === 'string'
                                ? col.accessor
                                : ''
                            }
                            checked={
                              editForm[col.accessor as keyof T] ? true : false
                            }
                            onChange={e => {
                              const value = e.target.checked;
                              setEditForm(prev => ({
                                ...prev,
                                [col.accessor as keyof T]: value,
                              }));
                            }}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={idx} className="p-3">
                        <input
                          type={col.inputType || 'text'}
                          name={
                            typeof col.accessor === 'string' ? col.accessor : ''
                          }
                          value={
                            editForm[col.accessor as keyof T] !== undefined &&
                            editForm[col.accessor as keyof T] !== null
                              ? String(editForm[col.accessor as keyof T])
                              : ''
                          }
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                    );
                  }
                  if (col.inputType === 'checkbox') {
                    return (
                      <td key={idx} className="p-3">
                        <input
                          type="checkbox"
                          name={
                            typeof col.accessor === 'string' ? col.accessor : ''
                          }
                          checked={row[col.accessor as keyof T] ? true : false}
                          disabled={true}
                        />
                      </td>
                    );
                  }
                  return (
                    <td key={idx} className="p-3">
                      {value}
                    </td>
                  );
                })}
                <td className="p-3 text-right space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleSave}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(row)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => onDelete(row.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
