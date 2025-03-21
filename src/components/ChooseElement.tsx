import React, { useEffect, useState } from 'react';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';

interface ChooseElementProps<T> {
  elements: T[];
  selectedElements: string[] | string;
  onElementSelected: (id: string) => void;
  onDeleteElementSelected: (id: string) => void;
  placeholder: string;
  mapElement: (element: T) => { id: string; description: string };
  labelText?: string;
  disabled?: boolean;
  className?: string;
}

const ChooseElement = <T,>({
  elements,
  selectedElements,
  onElementSelected,
  onDeleteElementSelected,
  placeholder,
  mapElement,
  labelText = '',
  disabled = false,
  className = '',
}: ChooseElementProps<T>) => {
  const [selectedItems, setSelectedItems] = useState<ElementList[]>([]);
  const [filteredElements, setFilteredElements] = useState<ElementList[]>([]);

  useEffect(() => {
    const selectedItems = elements
      .filter(element => selectedElements.includes(mapElement(element).id))
      .map(mapElement);
    setSelectedItems(selectedItems);

    const filteredElements = elements
      .filter(
        element =>
          !selectedElements.includes(mapElement(element).id) &&
          mapElement(element).description.toLowerCase()
      )
      .map(mapElement);
    setFilteredElements(filteredElements);
  }, [elements, selectedElements]);

  const handleElementSelected = (id: string) => {
    const selectedItem = elements.find(
      element => mapElement(element).id === id
    );
    if (selectedItem) {
      setSelectedItems(prevSelected => [
        ...prevSelected,
        mapElement(selectedItem),
      ]);
      onElementSelected(id);
    }
  };

  const handleDeleteElementSelected = (id: string) => {
    setSelectedItems(prevSelected =>
      prevSelected.filter(item => item.id !== id)
    );
    onDeleteElementSelected(id);
  };

  return (
    <div className="flex flex-row gap-8 w-full">
      <div className="w-full">
        {labelText !== '' && (
          <label className="block text-gray-700 font-bold mb-2 text-lg">
            {labelText}
          </label>
        )}
        <AutocompleteSearchBar
          elements={filteredElements}
          setCurrentId={handleElementSelected}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
        <div className="p-2">
          {selectedItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between mb-2 border-b-2 border-gray-800 p-2"
            >
              <span className="text-gray-600 font-medium">
                {item.description}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleDeleteElementSelected(item.id)}
                  className="bg-okron-btDelete hover:bg-okron-btDeleteHover text-white rounded-xl py-2 px-4 text-sm"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseElement;
