'use client';

import { useState } from 'react';
import { SvgDelete, SvgPlus } from 'app/icons/icons';
import { InvoiceItemCreationDto, InvoiceItemType, InvoiceRateDto, OperatorType } from 'app/interfaces/InvoiceInterfaces';
import WorkOrder from 'app/interfaces/workOrder';
import { Button } from 'designSystem/Button/Buttons';

interface InvoiceItemsFormProps {
  items: InvoiceItemCreationDto[];
  onItemsChange: (items: InvoiceItemCreationDto[]) => void;
  selectedWorkOrders: WorkOrder[];
  customRates: InvoiceRateDto[];
}

const InvoiceItemsForm: React.FC<InvoiceItemsFormProps> = ({
                                                             items,
                                                             onItemsChange,
                                                             selectedWorkOrders
                                                           }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const createEmptyItem = (): InvoiceItemCreationDto => ({
    type: InvoiceItemType.Labor,
    description: '',
    quantity: 1,
    unitPrice: 0,
    discountPercentage: 0,
    discountAmount: 0,
    workOrderId: selectedWorkOrders.length > 0 ? selectedWorkOrders[0].id : undefined,
    sparePartId: undefined,
    operatorId: undefined,
    operatorType: OperatorType.Maintenance
  });

  const handleAddItem = () => {
    const newItem = createEmptyItem();
    onItemsChange([...items, newItem]);
    setEditingIndex(items.length);
  };

  const handleUpdateItem = (index: number, updatedItem: InvoiceItemCreationDto) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    onItemsChange(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const calculateLineTotal = (item: InvoiceItemCreationDto): number => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const totalDiscount = item.discountAmount + (lineSubtotal * item.discountPercentage / 100);
    return Math.max(0, lineSubtotal - totalDiscount);
  };

  const getItemTypeOptions = () => [
    { value: InvoiceItemType.Labor, label: 'Mà d\'Obra' },
    { value: InvoiceItemType.SparePart, label: 'Recanvi' },
    { value: InvoiceItemType.Other, label: 'Altres' }
  ];

  return (
    <div className="space-y-4">
      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipus
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripció
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantitat
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preu Unit.
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Desc. %
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Desc. €
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Accions
            </th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={index} className={editingIndex === index ? 'bg-blue-50' : ''}>
              <td className="px-4 py-4 whitespace-nowrap">
                {editingIndex === index ? (
                  <select
                    value={item.type}
                    onChange={(e) => handleUpdateItem(index, {
                      ...item,
                      type: e.target.value as InvoiceItemType
                    })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    {getItemTypeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm">
                      {getItemTypeOptions().find(opt => opt.value === item.type)?.label}
                    </span>
                )}
              </td>
              <td className="px-4 py-4">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(index, {
                      ...item,
                      description: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Descripció de l'item"
                  />
                ) : (
                  <span className="text-sm">{item.description}</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {editingIndex === index ? (
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, {
                      ...item,
                      quantity: parseFloat(e.target.value) || 0
                    })}
                    className="w-20 p-2 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <span className="text-sm">{item.quantity}</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {editingIndex === index ? (
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateItem(index, {
                      ...item,
                      unitPrice: parseFloat(e.target.value) || 0
                    })}
                    className="w-24 p-2 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <span className="text-sm">{item.unitPrice.toFixed(2)}€</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {editingIndex === index ? (
                  <input
                    type="number"
                    value={item.discountPercentage}
                    onChange={(e) => handleUpdateItem(index, {
                      ...item,
                      discountPercentage: parseFloat(e.target.value) || 0
                    })}
                    className="w-20 p-2 border border-gray-300 rounded text-sm"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                ) : (
                  <span className="text-sm">{item.discountPercentage}%</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {editingIndex === index ? (
                  <input
                    type="number"
                    value={item.discountAmount}
                    onChange={(e) => handleUpdateItem(index, {
                      ...item,
                      discountAmount: parseFloat(e.target.value) || 0
                    })}
                    className="w-20 p-2 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <span className="text-sm">{item.discountAmount.toFixed(2)}€</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium">
                    {calculateLineTotal(item).toFixed(2)}€
                  </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {editingIndex === index ? (
                    <Button
                      type={"none"}
                      onClick={() => setEditingIndex(null)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Guardar
                    </Button>
                  ) : (
                    <Button
                      type={"none"}
                      onClick={() => setEditingIndex(index)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Editar
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <SvgDelete className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Button */}
      <Button
        type={"none"}
        onClick={handleAddItem}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        <SvgPlus className="w-4 h-4" />
        Afegir Item
      </Button>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hi ha items a la factura. Feu clic a "Afegir Item" per començar.
        </div>
      )}
    </div>
  );
};

export default InvoiceItemsForm;