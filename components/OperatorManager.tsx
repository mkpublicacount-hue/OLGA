import React, { useState } from 'react';
import { Operator } from '../types';
import { generateId } from '../utils';
import { Plus, X } from 'lucide-react';

interface OperatorManagerProps {
  operators: Operator[];
  setOperators: (ops: Operator[]) => void;
  onClose: () => void;
}

const OperatorManager: React.FC<OperatorManagerProps> = ({ operators, setOperators, onClose }) => {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newOp: Operator = { id: generateId(), name: newName.trim() };
    setOperators([...operators, newOp]);
    setNewName('');
  };

  const handleRemove = (id: string) => {
    setOperators(operators.filter(op => op.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">مدیریت لیست اپراتورها</h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="نام اپراتور جدید..."
              className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 bg-white"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button 
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus size={18} />
              افزودن
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg divide-y bg-white">
            {operators.length === 0 && (
              <p className="p-4 text-center text-gray-500 text-sm">لیست خالی است.</p>
            )}
            {operators.map(op => (
              <div key={op.id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span className="text-gray-900 font-medium">{op.name}</span>
                <button 
                  onClick={() => handleRemove(op.id)}
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 text-right border-t">
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 font-medium text-sm"
          >
            بازگشت به فرم اصلی
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperatorManager;