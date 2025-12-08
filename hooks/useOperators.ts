import { useState, useEffect } from 'react';
import { Operator } from '../types';
import { generateId } from '../utils';

const STORAGE_KEY_OPERATORS = 'daftar_hesab_operators';

const initialOperators: Operator[] = [
  { id: '1', name: 'اپراتور شماره 1' },
  { id: '2', name: 'اپراتور شماره 2' },
];

export const useOperators = () => {
  const [operators, setOperators] = useState<Operator[]>(initialOperators);

  useEffect(() => {
    const loadedOperators = localStorage.getItem(STORAGE_KEY_OPERATORS);
    if (loadedOperators) {
      setOperators(JSON.parse(loadedOperators));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPERATORS, JSON.stringify(operators));
  }, [operators]);

  const addOperator = (name: string) => {
    const newOp: Operator = { id: generateId(), name: name.trim() };
    setOperators([...operators, newOp]);
  };

  const removeOperator = (id: string) => {
    setOperators(operators.filter(op => op.id !== id));
  };

  return {
    operators,
    setOperators, // Exposing raw setter for full list updates if needed by manager
    addOperator,
    removeOperator
  };
};
