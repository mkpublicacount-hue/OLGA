
import React from 'react';
import { Edit, Users, Save, CheckCircle2, TrendingUp, TrendingDown, ListPlus, Scale, X, Coins, CreditCard, ArrowRightLeft, Banknote } from 'lucide-react';
import { Operator } from '../types';
import { formatNumber } from '../utils';
import NumberInput from './NumberInput';
import DatePicker from './DatePicker';

const CURRENCIES = [
  { code: 'USD', name: 'دلار آمریکا' },
  { code: 'EUR', name: 'یورو' },
  { code: 'AED', name: 'درهم امارات' },
  { code: 'GBP', name: 'پوند انگلیس' },
  { code: 'TRY', name: 'لیر ترکیه' },
  { code: 'IQD', name: 'دینار عراق' },
];

interface FinancialEntryFormProps {
  form: any;
  operators: Operator[];
  onOpenOperatorManager: () => void;
}

const FinancialEntryForm: React.FC<FinancialEntryFormProps> = ({ form, operators, onOpenOperatorManager }) => {
  return (
    <>
      {/* --- Discrepancy Selector Modal --- */}
      {form.showDiscrepancyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
             <div className={`p-3 flex justify-between items-center text-white shrink-0 ${form.isTargetingSurplus ? 'bg-green-700' : 'bg-orange-700'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Scale size={18} />
                {form.isTargetingSurplus ? 'انتخاب اضافه بار (جبران کسری)' : 'انتخاب بدهی (پرداخت از مازاد)'}
              </h3>
              <button onClick={() => form.setShowDiscrepancyModal(false)} className="hover:bg-white/20 p-1 rounded"><X size={18} /></button>
            </div>
            
            <div className="p-3 overflow-y-auto text-sm">
              <p className={`font-medium mb-3 p-2 rounded border ${form.isTargetingSurplus ? 'bg-green-50 border-green-100 text-green-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                {form.isTargetingSurplus 
                  ? 'کسری دارید؟ از اضافه بارهای زیر استفاده کنید:' 
                  : 'پول اضافه دارید؟ بدهی‌های زیر را صاف کنید:'}
              </p>
              
              <div className="space-y-2">
                {form.availableDiscrepancies.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded border border-dashed border-gray-300">
                    <p className="text-gray-900 font-bold">مورد مناسبی یافت نشد.</p>
                  </div>
                ) : (
                  form.availableDiscrepancies.map((rec: any) => (
                      <div key={rec.id} className={`border rounded p-2 hover:bg-gray-50 transition-colors flex justify-between items-center bg-white shadow-sm cursor-pointer ${rec.type === 'surplus' ? 'border-green-200' : 'border-red-200'}`} onClick={() => form.handleSelectDiscrepancy(rec)}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${rec.type === 'surplus' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                              {rec.trackingCode}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">{rec.year}/{rec.month}/{rec.day}</span>
                          </div>
                          <div className="text-xs text-gray-900 font-medium">اپراتور: {rec.operatorName}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-right">
                             <span className="font-bold text-gray-800 font-mono dir-ltr text-sm">
                               {formatNumber(rec.remainingAmount)} <span className="text-[10px] font-sans">ت</span>
                             </span>
                          </div>
                          <button type="button" className={`text-white text-[10px] px-3 py-1 rounded transition-colors shadow-sm ${form.isTargetingSurplus ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                            انتخاب
                          </button>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Form --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center h-10">
          <h2 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
            <Edit size={16} className="text-blue-600" />
            {form.editingId ? 'ویرایش رکورد' : 'ثبت رکورد جدید'}
          </h2>
          {form.editingId && (
            <button onClick={form.resetForm} className="text-xs text-red-500 hover:underline font-medium">انصراف</button>
          )}
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); form.submitForm(operators); }} className="p-3 space-y-3">
          
          {/* Row 1: Date | Operator | Service Amount */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3 z-20">
              <DatePicker 
                day={form.day} month={form.month} year={form.year} 
                onChange={(d, m, y) => { form.setDay(d); form.setMonth(m); form.setYear(y); }} 
              />
            </div>
            <div className="md:col-span-4">
              <div className="flex items-end gap-1">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 mb-1 block">اپراتور</label>
                  <select 
                    value={form.operatorId} 
                    onChange={e => form.setOperatorId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-300 bg-white text-gray-900 text-sm h-[42px]"
                  >
                    <option value="" className="text-gray-500">انتخاب...</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id} className="text-gray-900">{op.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="button"
                  onClick={onOpenOperatorManager}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-[42px] h-[42px] rounded-lg border border-gray-300 flex items-center justify-center transition-colors"
                  title="مدیریت اپراتورها"
                >
                  <Users size={18} />
                </button>
              </div>
            </div>
            <div className="md:col-span-5">
              <NumberInput 
                label="مبلغ کل خدمات (تومان)" 
                value={form.serviceAmount} 
                onChange={form.setServiceAmount}
                className="w-full"
              />
            </div>
          </div>

          {/* Row 2: Payment Methods (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* 1. POS (Blue) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2 text-blue-800 font-bold border-b border-blue-200 pb-1.5">
                  <CreditCard size={16} />
                  <span className="text-xs">کارتخوان</span>
                </div>
                <NumberInput 
                  label="" 
                  value={form.posAmount} onChange={form.setPosAmount} onFillRequest={form.fillPos} hint="Space"
                  className="bg-white"
                />
            </div>

            {/* 2. Card to Card (Orange) */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 shadow-sm flex flex-col">
                <div className="flex items-center gap-1.5 mb-2 text-orange-800 font-bold border-b border-orange-200 pb-1.5">
                    <ArrowRightLeft size={16} />
                    <span className="text-xs">کارت به کارت</span>
                </div>
                <NumberInput 
                  label="" 
                  value={form.cardToCardAmount} onChange={form.setCardToCardAmount} onFillRequest={form.fillCardToCard} hint="Space"
                  className="bg-white mb-2"
                />
                
                {form.cardToCardAmount > 0 && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                      <input 
                      type="text" value={form.cardToCardDest} onChange={e => form.setCardToCardDest(e.target.value)}
                      placeholder="مقصد" className="p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-200 outline-none text-gray-900 bg-white"
                      />
                      <input 
                      type="text" value={form.cardToCardDesc} onChange={e => form.setCardToCardDesc(e.target.value)}
                      placeholder="شرح" className="p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-200 outline-none text-gray-900 bg-white"
                      />
                  </div>
                )}
            </div>

            {/* 3. Cash (Green) */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-emerald-200 pb-1.5">
                <span className="text-emerald-800 font-bold flex items-center gap-1.5 text-xs">
                  <Banknote size={16} />
                  نقد (ریال + ارز)
                </span>
                <span className="text-[10px] text-emerald-700 font-mono bg-white px-1 rounded border border-emerald-100">{formatNumber(form.totalCash)}</span>
              </div>
              
              <NumberInput 
                label="" value={form.cashDirect} onChange={form.setCashDirect} onFillRequest={form.fillCashDirect} hint="Space"
                className="bg-white mb-2"
              />

              {!form.hasCurrency ? (
                <button
                  type="button"
                  onClick={() => form.setHasCurrency(true)}
                  className="w-full py-1 border border-dashed border-emerald-400 text-emerald-700 rounded text-xs hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 bg-white/50 h-[30px]"
                >
                  <Coins size={14} />
                  ارز خارجی
                </button>
              ) : (
                <div className="p-2 bg-white rounded border border-emerald-200 animate-in fade-in shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-indigo-800 flex items-center gap-1">ارز</span>
                    <button type="button" onClick={() => {form.setHasCurrency(false); form.setCurrencyCount(0); form.setCurrencyRate(0);}} className="text-[10px] text-red-500 hover:text-red-700">حذف</button>
                  </div>
                  <div className="flex gap-1 mb-1">
                    <select value={form.currencyType} onChange={e => form.setCurrencyType(e.target.value)} className="w-1/3 p-1 border border-gray-200 rounded text-xs bg-white text-gray-900 h-[28px]"><option value="USD">USD</option><option value="EUR">EUR</option></select>
                    <input type="number" placeholder="تعداد" value={form.currencyCount || ''} onChange={e => form.setCurrencyCount(Number(e.target.value))} className="w-1/3 p-1 border border-gray-200 rounded text-xs h-[28px]" />
                    <input type="number" placeholder="نرخ" value={form.currencyRate || ''} onChange={e => form.setCurrencyRate(Number(e.target.value))} className="w-1/3 p-1 border border-gray-200 rounded text-xs h-[28px]" />
                  </div>
                  <div className="text-[10px] text-emerald-700 text-left font-mono">{formatNumber(form.currencyConverted)} ت</div>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Footer (Status + Discrepancy + Submit) */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:h-14 mt-2">
            
            {/* Status Box */}
            <div className={`flex-1 rounded-lg px-3 py-1 flex justify-between items-center border ${form.isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {form.isBalanced ? <CheckCircle2 size={20} className="text-green-600"/> : form.difference > 0 ? <TrendingDown size={20} className="text-red-600"/> : <TrendingUp size={20} className="text-red-600"/>}
                <div className="flex flex-col">
                   <span className={`text-xs font-bold ${form.isBalanced ? 'text-green-800' : 'text-red-800'}`}>
                     {form.isBalanced ? 'تراز' : form.difference > 0 ? 'کسری' : 'اضافه'}
                   </span>
                   {!form.isBalanced && <span className="text-[10px] opacity-75 text-red-800">اختلاف</span>}
                </div>
              </div>
              {!form.isBalanced && (
                <span className="text-lg font-mono font-bold dir-ltr text-red-700">
                  {formatNumber(Math.abs(form.difference))}
                </span>
              )}
            </div>

            {/* Discrepancy Control */}
            <div className="flex-1">
              {!form.usedDiscrepancyAmount ? (
                <button
                  type="button"
                  onClick={() => form.setShowDiscrepancyModal(true)}
                  className={`w-full h-full border border-dashed rounded-lg text-xs transition-colors flex items-center justify-center gap-2 font-medium ${Math.abs(form.currentShortage) > 1 ? 'border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100' : 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50'}`}
                  disabled={Math.abs(form.currentShortage) < 1}
                >
                  <ListPlus size={16} />
                  {form.currentShortage > 0 ? 'استفاده از اضافه بار' : form.currentShortage < 0 ? 'پرداخت بدهی' : '---'}
                </button>
              ) : (
                <div className={`h-full px-3 rounded-lg border flex justify-between items-center ${form.usedDiscrepancyAmount > 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                   <div className="flex flex-col">
                      <span className={`text-[10px] font-bold ${form.usedDiscrepancyAmount > 0 ? 'text-green-800' : 'text-orange-800'}`}>
                        {form.usedDiscrepancyAmount > 0 ? 'جبران کسری' : 'تسویه بدهی'}
                      </span>
                      <span className="text-[10px] font-mono opacity-75">{form.usedDiscrepancyCode}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="font-bold font-mono text-sm">{formatNumber(Math.abs(form.usedDiscrepancyAmount))}</span>
                     <button type="button" onClick={() => {form.setUsedDiscrepancyAmount(0); form.setUsedDiscrepancyCode('');}} className="text-red-500 hover:text-red-700 bg-white rounded-full p-0.5"><X size={14} /></button>
                   </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-200 transition-all flex justify-center items-center gap-2 text-sm">
              <Save size={18} />{form.editingId ? 'ذخیره' : 'ثبت'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default FinancialEntryForm;
