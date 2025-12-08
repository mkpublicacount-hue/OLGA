
import React from 'react';
import { DailyRecord } from '../types';
import { formatNumber } from '../utils';
import { History, Edit, Trash2 } from 'lucide-react';

interface RecordsListProps {
  records: DailyRecord[];
  onEdit: (record: DailyRecord) => void;
  onDelete: (record: DailyRecord) => void;
}

const RecordsList: React.FC<RecordsListProps> = ({ records, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-700 flex items-center gap-2"><History size={20} className="text-blue-600" />تاریخچه ثبت‌ها</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-100 text-gray-600 font-medium">
            <tr>
              <th className="p-4 whitespace-nowrap">تاریخ</th>
              <th className="p-4 whitespace-nowrap">اپراتور</th>
              <th className="p-4 whitespace-nowrap">مبلغ خدمات</th>
              <th className="p-4 whitespace-nowrap">کل دریافتی</th>
              <th className="p-4 whitespace-nowrap text-center">وضعیت</th>
              <th className="p-4 whitespace-nowrap text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">هنوز هیچ داده‌ای ثبت نشده است.</td></tr>
            ) : (
              records.map((record) => {
                const diff = record.discrepancy !== undefined ? record.discrepancy : (record.serviceAmount - (record.posAmount + record.cardToCardAmount + record.cashTotal + (record.usedDiscrepancyAmount || 0)));
                const isRecBalanced = Math.abs(diff) < 1;
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-600">{record.year}/{record.month < 10 ? '0'+record.month : record.month}/{record.day < 10 ? '0'+record.day : record.day}</td>
                    <td className="p-4 font-medium text-gray-800">{record.operatorName}</td>
                    <td className="p-4 font-mono text-blue-600">{formatNumber(record.serviceAmount)}</td>
                    <td className="p-4 font-mono text-gray-700">{formatNumber(record.posAmount + record.cardToCardAmount + record.cashTotal + (record.usedDiscrepancyAmount || 0))}</td>
                    <td className="p-4 text-center">
                      {isRecBalanced ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">تراز</span> : 
                      <div className="flex flex-col items-center gap-1"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${diff > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{diff > 0 ? 'کسری' : 'اضافه بار'}</span><span className="text-[10px] font-mono text-gray-500">{record.trackingCode}</span></div>}
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => onEdit(record)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ویرایش"><Edit size={16} /></button>
                      <button onClick={() => onDelete(record)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsList;
