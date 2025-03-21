import { useState } from 'react';

export const EditableCell: React.FC<{
  value: string;
  onUpdate: (newDescription: string) => void;
  canEdit?: boolean;
}> = ({ value, onUpdate, canEdit = true }) => {
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

  if (!canEdit) return <span>{value}</span>;

  return isEditing ? (
    <input
      type="text"
      value={newDescription}
      onChange={e => setNewDescription(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
    />
  ) : (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer text-blue-500 hover:underline"
    >
      {value}
    </span>
  );
};
