import { useState, useEffect } from 'react';
import { DailyRecord } from '../types';
import { generateTrackingCode } from '../utils';

const STORAGE_KEY_RECORDS = 'daftar_hesab_records';

export const useRecords = () => {
  const [records, setRecords] = useState<DailyRecord[]>([]);

  useEffect(() => {
    const loadedRecordsStr = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (loadedRecordsStr) {
      let loadedRecords: DailyRecord[] = JSON.parse(loadedRecordsStr);
      
      // MIGRATION: Auto-assign tracking codes to legacy records with discrepancies
      let hasChanges = false;
      loadedRecords = loadedRecords.map(r => {
        const calcDiff = r.serviceAmount - (r.posAmount + r.cardToCardAmount + r.cashTotal + (r.usedDiscrepancyAmount || 0));
        
        if (Math.abs(calcDiff) > 1 && !r.trackingCode) {
          hasChanges = true;
          return {
            ...r,
            discrepancy: calcDiff,
            trackingCode: generateTrackingCode()
          };
        }
        if (Math.abs(calcDiff) > 1 && r.discrepancy === undefined) {
           hasChanges = true;
           return { ...r, discrepancy: calcDiff };
        }
        return r;
      });

      setRecords(loadedRecords);
      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(loadedRecords));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }, [records]);

  const addRecord = (record: DailyRecord) => {
    setRecords([record, ...records]);
  };

  const updateRecord = (updatedRecord: DailyRecord) => {
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const getLastRecord = (): DailyRecord | undefined => {
    return records.length > 0 ? records[0] : undefined;
  };

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    getLastRecord
  };
};
