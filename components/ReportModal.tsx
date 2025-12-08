
import React, { useState, useMemo } from 'react';
import { DailyRecord } from '../types';
import DatePicker from './DatePicker';
import { formatNumber, dateToInteger, getTodayJalali } from '../utils';
import { X, Calendar, Wallet, CreditCard, Banknote, Coins, ArrowRightLeft, PieChart } from 'lucide-react';

interface ReportModalProps {
  records: DailyRecord[];
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ records, onClose }) => {
  const today = getTodayJalali();
  
  // Default: Start of current month to Today
  const [startDay, setStartDay] = useState(1);
  const [startMonth, setStartMonth] = useState(today.jm);
  const [startYear, setStartYear] = useState(today.jy);

  const [endDay, setEndDay] = useState(today.jd);
  const [endMonth, setEndMonth] = useState(today.jm);
  const [endYear, setEndYear] = useState(today.jy);

  const stats = useMemo(() => {
    const startInt = dateToInteger(startYear, startMonth, startDay);
    const endInt = dateToInteger(endYear, endMonth, endDay);

    const filtered = records.filter(r => {
      const rDate = dateToInteger(r.year, r.month, r.day);
      return rDate >= startInt && rDate <= endInt;
    });

    return filtered.reduce((acc, curr) => {
      acc.service += curr.serviceAmount || 0;
      acc.pos += curr.posAmount || 0;
      acc.cardToCard += curr.cardToCardAmount || 0;
      acc.cashDirect += curr.cashDirect || 0; // Pure cash
      acc.currencyConverted += curr.currencyConverted || 0; // Currency converted
      
      // Calculate Discrepancy (Net)
      // If discrepancy exists in record, use it. Otherwise calculate.
      const diff = curr.discrepancy !== undefined 
        ? curr.discrepancy 
        : (curr.serviceAmount - (curr.posAmount + curr.cardToCardAmount + curr.cashTotal + (curr.usedDiscrepancyAmount || 0)));
      
      acc.discrepancy += diff;

      return acc;
    }, {
      service: 0,
      pos: 0,
      cardToCard: 0,
      cashDirect: 0,
      currencyConverted: 0,
      discrepancy: 0
    });
  }, [records, startDay, startMonth, startYear, endDay, endMonth, endYear]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <PieChart size={24} className="text-blue-200" />
            <h3 className="font-bold text-xl">گزارش مالی پیشرفته</h3>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600"/>
                از تاریخ:
              </label>
              <DatePicker 
                day={startDay} 
                month={startMonth} 
                year={startYear} 
                onChange={(d, m, y) => { setStartDay(d); setStartMonth(m); setStartYear(y); }} 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600"/>
                تا تاریخ:
              </label>
              <DatePicker 
                day={endDay} 
                month={endMonth} 
                year={endYear} 
                onChange={(d, m, y) => { setEndDay(d); setEndMonth(m); setEndYear(y); }} 
              />
            </div>
          </div>

          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Service Total */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-slate-700 to-slate-800 text-white p-5 rounded-xl shadow-md">
              <div className="flex items-center gap-2 opacity-80 mb-2">
                <Wallet size={20} />
                <span className="text-sm font-medium">جمع کل مبلغ خدمات</span>
              </div>
              <div className="text-3xl font-bold font-mono dir-ltr tracking-tight">
                {formatNumber(stats.service)} <span className="text-base font-sans font-normal opacity-70">تومان</span>
              </div>
            </div>

            {/* POS */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <CreditCard size={18} className="text-blue-500" />
                <span className="text-xs font-bold">کارتخوان (POS)</span>
              </div>
              <div className="text-xl font-bold text-gray-800 font-mono dir-ltr">
                {formatNumber(stats.pos)}
              </div>
            </div>

            {/* Card to Card */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <ArrowRightLeft size={18} className="text-orange-500" />
                <span className="text-xs font-bold">کارت به کارت</span>
              </div>
              <div className="text-xl font-bold text-gray-800 font-mono dir-ltr">
                {formatNumber(stats.cardToCard)}
              </div>
            </div>

            {/* Cash Direct */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Banknote size={18} className="text-green-600" />
                <span className="text-xs font-bold">نقد ریالی</span>
              </div>
              <div className="text-xl font-bold text-gray-800 font-mono dir-ltr">
                {formatNumber(stats.cashDirect)}
              </div>
            </div>

            {/* Currency Converted */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Coins size={18} className="text-indigo-500" />
                <span className="text-xs font-bold">نقد ارزی (معادل)</span>
              </div>
              <div className="text-xl font-bold text-gray-800 font-mono dir-ltr">
                {formatNumber(stats.currencyConverted)}
              </div>
            </div>

            {/* Total Cash (Sum) */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Banknote size={18} className="text-gray-600" />
                <span className="text-xs font-bold">مجموع نقد (ریال + ارز)</span>
              </div>
              <div className="text-xl font-bold text-gray-700 font-mono dir-ltr">
                {formatNumber(stats.cashDirect + stats.currencyConverted)}
              </div>
            </div>

            {/* Discrepancy (Net) */}
            <div className={`p-4 rounded-xl shadow-sm border ${stats.discrepancy === 0 ? 'bg-green-50 border-green-200' : stats.discrepancy > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <PieChart size={18} className={stats.discrepancy === 0 ? 'text-green-600' : stats.discrepancy > 0 ? 'text-red-600' : 'text-emerald-600'} />
                <span className="text-xs font-bold">
                   مغایرت خالص بازه
                   <span className="block text-[10px] font-normal opacity-80 mt-0.5">(تفاوت دریافتی و خدمات)</span>
                </span>
              </div>
              <div className={`text-xl font-bold font-mono dir-ltr ${stats.discrepancy === 0 ? 'text-green-700' : stats.discrepancy > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {stats.discrepancy > 0 ? '-' : stats.discrepancy < 0 ? '+' : ''}{formatNumber(Math.abs(stats.discrepancy))}
              </div>
              <div className="text-xs mt-1 font-medium opacity-80">
                {stats.discrepancy === 0 ? 'حساب‌ها تراز است' : stats.discrepancy > 0 ? 'کسری (بدهی) در این بازه' : 'اضافه بار (مازاد) در این بازه'}
              </div>
            </div>

          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t flex justify-end">
           <button 
             onClick={() => window.print()}
             className="mr-auto text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors hidden sm:block"
           >
             چاپ صفحه (Ctrl+P)
           </button>
           <button 
             onClick={onClose}
             className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
           >
             بستن
           </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
