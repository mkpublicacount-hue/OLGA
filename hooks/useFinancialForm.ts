
import { useState, useEffect, useMemo } from 'react';
import { DailyRecord, Operator, DiscrepancyItem } from '../types';
import { getTodayJalali, generateId, generateTrackingCode } from '../utils';

interface UseFinancialFormProps {
  records: DailyRecord[];
  onSave: (record: DailyRecord, isEdit: boolean) => void;
  onNotification: (msg: string, type: 'success' | 'error') => void;
}

export const useFinancialForm = ({ records, onSave, onNotification }: UseFinancialFormProps) => {
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [operatorId, setOperatorId] = useState<string>('');
  
  // Date State
  const [day, setDay] = useState<number>(1);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(1403);

  // Amount State
  const [serviceAmount, setServiceAmount] = useState<number>(0);
  const [posAmount, setPosAmount] = useState<number>(0);
  const [cardToCardAmount, setCardToCardAmount] = useState<number>(0);
  const [cardToCardDest, setCardToCardDest] = useState<string>('');
  const [cardToCardDesc, setCardToCardDesc] = useState<string>('');
  
  // Cash & Currency State
  const [cashDirect, setCashDirect] = useState<number>(0);
  const [hasCurrency, setHasCurrency] = useState(false);
  const [currencyType, setCurrencyType] = useState('USD');
  const [currencyCount, setCurrencyCount] = useState<number>(0);
  const [currencyRate, setCurrencyRate] = useState<number>(0);

  // Discrepancy Usage State
  const [usedDiscrepancyAmount, setUsedDiscrepancyAmount] = useState<number>(0);
  const [usedDiscrepancyCode, setUsedDiscrepancyCode] = useState<string>('');
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);

  // Initialize Date Logic
  useEffect(() => {
    if (records.length > 0 && !editingId) {
      const lastRecord = records[0]; 
      setDay(lastRecord.day);
      setMonth(lastRecord.month);
      setYear(lastRecord.year);
    } else if (!editingId) {
      const today = getTodayJalali();
      setDay(today.jd);
      setMonth(today.jm);
      setYear(today.jy);
    }
  }, [records, editingId]); // Dependency on records ensures it runs after load

  // --- Calculations ---
  const currencyConverted = hasCurrency ? (currencyCount * currencyRate) : 0;
  const totalCash = cashDirect + currencyConverted;
  const rawPaid = posAmount + cardToCardAmount + totalCash; 
  const totalPaid = rawPaid + usedDiscrepancyAmount;
  const difference = serviceAmount - totalPaid; 
  const isBalanced = Math.abs(difference) < 1;

  // --- Discrepancy Logic ---
  const currentShortage = serviceAmount - rawPaid;
  const isTargetingSurplus = currentShortage > 0;

  const availableDiscrepancies: DiscrepancyItem[] = useMemo(() => {
    if (Math.abs(currentShortage) < 1) return [];

    const needSurplus = currentShortage > 0;
    
    // Filter candidates
    const candidates = records.filter(r => {
      if (r.id === editingId) return false;
      const diff = r.discrepancy !== undefined ? r.discrepancy : (r.serviceAmount - (r.posAmount + r.cardToCardAmount + r.cashTotal + (r.usedDiscrepancyAmount || 0)));
      if (!r.trackingCode) return false;
      return needSurplus ? diff < -1 : diff > 1;
    });

    return candidates.map(sourceRecord => {
      const originalDiff = sourceRecord.discrepancy!;
      const originalAmountAbs = Math.abs(originalDiff);
      const isSourceSurplus = originalDiff < 0;

      // Calculate usage
      const usedAmountTotal = records
        .filter(r => r.usedDiscrepancyFromCode === sourceRecord.trackingCode && r.id !== editingId)
        .reduce((sum, r) => sum + Math.abs(r.usedDiscrepancyAmount || 0), 0);

      const remaining = originalAmountAbs - usedAmountTotal;

      return {
        ...sourceRecord,
        remainingAmount: remaining,
        originalAmount: originalAmountAbs,
        type: isSourceSurplus ? 'surplus' : 'debt'
      } as DiscrepancyItem;
    }).filter(item => item.remainingAmount > 1);
  }, [records, currentShortage, editingId]);

  // --- Actions ---
  const resetForm = () => {
    setEditingId(null);
    setOperatorId('');
    setServiceAmount(0);
    setPosAmount(0);
    setCardToCardAmount(0);
    setCardToCardDest('');
    setCardToCardDesc('');
    setCashDirect(0);
    setHasCurrency(false);
    setCurrencyType('USD');
    setCurrencyCount(0);
    setCurrencyRate(0);
    setUsedDiscrepancyAmount(0);
    setUsedDiscrepancyCode('');
  };

  const loadRecordForEdit = (record: DailyRecord) => {
    setEditingId(record.id);
    setDay(record.day);
    setMonth(record.month);
    setYear(record.year);
    setOperatorId(record.operatorId);
    setServiceAmount(record.serviceAmount);
    setPosAmount(record.posAmount);
    setCardToCardAmount(record.cardToCardAmount);
    setCardToCardDest(record.cardToCardDest || '');
    setCardToCardDesc(record.cardToCardDesc || '');
    
    const direct = record.cashDirect !== undefined ? record.cashDirect : record.cashTotal;
    setCashDirect(direct);

    if (record.currencyCount && record.currencyCount > 0) {
      setHasCurrency(true);
      setCurrencyType(record.currencyType || 'USD');
      setCurrencyCount(record.currencyCount || 0);
      setCurrencyRate(record.currencyRate || 0);
    } else {
      setHasCurrency(false);
      setCurrencyCount(0);
      setCurrencyRate(0);
    }

    if (record.usedDiscrepancyAmount) {
      setUsedDiscrepancyAmount(record.usedDiscrepancyAmount);
      setUsedDiscrepancyCode(record.usedDiscrepancyFromCode || '');
    } else {
      setUsedDiscrepancyAmount(0);
      setUsedDiscrepancyCode('');
    }
  };

  const fillPos = () => {
    const remaining = serviceAmount - (cardToCardAmount + totalCash + usedDiscrepancyAmount);
    setPosAmount(Math.max(0, remaining));
  };

  const fillCardToCard = () => {
    const remaining = serviceAmount - (posAmount + totalCash + usedDiscrepancyAmount);
    setCardToCardAmount(Math.max(0, remaining));
  };

  const fillCashDirect = () => {
    const remaining = serviceAmount - (posAmount + cardToCardAmount + currencyConverted + usedDiscrepancyAmount);
    setCashDirect(Math.max(0, remaining));
  };

  const handleSelectDiscrepancy = (item: DiscrepancyItem) => {
    const absShortage = Math.abs(currentShortage);
    const amountToUse = Math.min(absShortage, item.remainingAmount);
    const signedAmount = isTargetingSurplus ? amountToUse : -amountToUse;

    setUsedDiscrepancyAmount(signedAmount);
    setUsedDiscrepancyCode(item.trackingCode || 'Unknown');
    setShowDiscrepancyModal(false);
  };

  const submitForm = (operators: Operator[]) => {
    if (!operatorId) {
      onNotification('لطفا نام اپراتور را انتخاب کنید', 'error');
      return;
    }
    if (serviceAmount === 0) {
      onNotification('مبلغ خدمات نمی‌تواند صفر باشد', 'error');
      return;
    }

    const selectedOperator = operators.find(op => op.id === operatorId);
    
    // Determine Tracking Code
    let currentTrackingCode = undefined;
    if (!isBalanced) {
      const existingRecord = records.find(r => r.id === editingId);
      if (existingRecord?.trackingCode) {
        currentTrackingCode = existingRecord.trackingCode;
      } else {
        currentTrackingCode = generateTrackingCode();
      }
    }

    const recordData: DailyRecord = {
      id: editingId || generateId(),
      day, month, year,
      operatorId,
      operatorName: selectedOperator?.name || 'ناشناس',
      serviceAmount,
      posAmount,
      cardToCardAmount,
      cardToCardDest: cardToCardAmount > 0 ? cardToCardDest : undefined,
      cardToCardDesc: cardToCardAmount > 0 ? cardToCardDesc : undefined,
      cashTotal: totalCash,
      cashDirect: cashDirect,
      currencyType: hasCurrency ? currencyType : undefined,
      currencyCount: hasCurrency ? currencyCount : undefined,
      currencyRate: hasCurrency ? currencyRate : undefined,
      currencyConverted: hasCurrency ? currencyConverted : undefined,
      discrepancy: difference,
      trackingCode: currentTrackingCode,
      usedDiscrepancyAmount: usedDiscrepancyAmount !== 0 ? usedDiscrepancyAmount : undefined,
      usedDiscrepancyFromCode: usedDiscrepancyAmount !== 0 ? usedDiscrepancyCode : undefined,
      createdAt: Date.now()
    };

    onSave(recordData, !!editingId);
    if (!editingId) {
        // Only reset completely on new add.
        resetForm();
    } else {
        resetForm();
    }
  };

  return {
    // State
    editingId, setEditingId,
    operatorId, setOperatorId,
    day, setDay,
    month, setMonth,
    year, setYear,
    serviceAmount, setServiceAmount,
    posAmount, setPosAmount,
    cardToCardAmount, setCardToCardAmount,
    cardToCardDest, setCardToCardDest,
    cardToCardDesc, setCardToCardDesc,
    cashDirect, setCashDirect,
    hasCurrency, setHasCurrency,
    currencyType, setCurrencyType,
    currencyCount, setCurrencyCount,
    currencyRate, setCurrencyRate,
    usedDiscrepancyAmount, setUsedDiscrepancyAmount,
    usedDiscrepancyCode, setUsedDiscrepancyCode,
    showDiscrepancyModal, setShowDiscrepancyModal,
    
    // Calculated
    currencyConverted,
    totalCash,
    difference,
    isBalanced,
    currentShortage,
    isTargetingSurplus,
    availableDiscrepancies,

    // Actions
    resetForm,
    loadRecordForEdit,
    fillPos,
    fillCardToCard,
    fillCashDirect,
    handleSelectDiscrepancy,
    submitForm
  };
};
