
import React, { useState } from 'react';
import { DailyRecord } from './types';
import OperatorManager from './components/OperatorManager';
import ReportModal from './components/ReportModal';
import ConfirmModal from './components/ConfirmModal';
import Header from './components/Header';
import FinancialEntryForm from './components/FinancialEntryForm';
import RecordsList from './components/RecordsList';

// Hooks
import { useRecords } from './hooks/useRecords';
import { useOperators } from './hooks/useOperators';
import { useFinancialForm } from './hooks/useFinancialForm';

import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // --- Architecture: Global State & Hooks ---
  const [showOperatorManager, setShowOperatorManager] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<DailyRecord | null>(null);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const { operators, setOperators } = useOperators();
  const { records, addRecord, updateRecord, deleteRecord } = useRecords();

  const showNotif = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const form = useFinancialForm({
    records,
    onNotification: showNotif,
    onSave: (data, isEdit) => {
      if (isEdit) {
        updateRecord(data);
        showNotif('رکورد با موفقیت ویرایش شد', 'success');
      } else {
        addRecord(data);
        const isBal = Math.abs(data.discrepancy || 0) < 1;
        showNotif(isBal ? 'رکورد جدید با موفقیت ثبت شد' : `رکورد با مغایرت ثبت شد. کد رهگیری: ${data.trackingCode}`, 'success');
      }
    }
  });

  const handleEdit = (record: DailyRecord) => {
    form.loadRecordForEdit(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requestDelete = (record: DailyRecord) => {
    setDeleteCandidate(record);
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      deleteRecord(deleteCandidate.id);
      if (form.editingId === deleteCandidate.id) form.resetForm();
      showNotif('رکورد با موفقیت حذف شد', 'success');
      setDeleteCandidate(null);
    }
  };

  const handleExportExcel = () => {
    if (records.length === 0) return;

    // Define table headers
    const headers = [
      'تاریخ', 'اپراتور', 'مبلغ خدمات', 'کارتخوان', 'کارت به کارت', 'مقصد کارت', 'شرح کارت', 
      'نقد ریالی', 'نقد ارزی (معادل)', 'نوع ارز', 'تعداد ارز', 'نرخ ارز', 
      'مغایرت استفاده شده', 'کد مغایرت استفاده شده', 'کل دریافتی', 'مبلغ مغایرت', 'کد رهگیری مغایرت'
    ];

    // Construct HTML Table for Excel
    // This creates a file that Excel interprets as a native worksheet with styling and RTL support
    let table = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>گزارش مالی</x:Name>
              <x:WorksheetOptions>
                <x:DisplayRightToLeft/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; direction: rtl; font-family: Tahoma, sans-serif; }
          th, td { border: 1px solid #000000; padding: 8px; text-align: center; vertical-align: middle; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .num { mso-number-format:"\#\,\#\#0"; }
          .text { mso-number-format:"\@"; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    records.forEach(r => {
      const diff = r.discrepancy !== undefined ? r.discrepancy : (r.serviceAmount - (r.posAmount + r.cardToCardAmount + r.cashTotal + (r.usedDiscrepancyAmount || 0)));
      const totalP = r.posAmount + r.cardToCardAmount + r.cashTotal + (r.usedDiscrepancyAmount || 0);
      const dateStr = `${r.year}/${r.month}/${r.day}`;
      
      table += `
        <tr>
          <td>${dateStr}</td>
          <td>${r.operatorName}</td>
          <td class="num">${r.serviceAmount}</td>
          <td class="num">${r.posAmount}</td>
          <td class="num">${r.cardToCardAmount}</td>
          <td class="text">${r.cardToCardDest || '-'}</td>
          <td class="text">${r.cardToCardDesc || '-'}</td>
          <td class="num">${r.cashDirect || 0}</td>
          <td class="num">${r.currencyConverted || 0}</td>
          <td>${r.currencyType || '-'}</td>
          <td class="num">${r.currencyCount || 0}</td>
          <td class="num">${r.currencyRate || 0}</td>
          <td class="num">${r.usedDiscrepancyAmount || 0}</td>
          <td class="text">${r.usedDiscrepancyFromCode || '-'}</td>
          <td class="num">${totalP}</td>
          <td class="num" style="background-color: ${diff === 0 ? '#e6fffa' : diff > 0 ? '#fff5f5' : '#f0fdf4'}; color: ${diff === 0 ? '#000' : diff > 0 ? '#c53030' : '#22543d'};">${diff}</td>
          <td class="text">${r.trackingCode || '-'}</td>
        </tr>
      `;
    });

    table += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      {/* --- Global Notification --- */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-white animate-bounce ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* --- Modals --- */}
      {showOperatorManager && (
        <OperatorManager 
          operators={operators} 
          setOperators={setOperators} 
          onClose={() => setShowOperatorManager(false)} 
        />
      )}

      {showReportModal && (
        <ReportModal records={records} onClose={() => setShowReportModal(false)} />
      )}
      
      <ConfirmModal
        isOpen={!!deleteCandidate}
        title="حذف رکورد"
        message={`آیا مطمئن هستید که می‌خواهید رکورد مربوط به تاریخ ${deleteCandidate?.year}/${deleteCandidate?.month}/${deleteCandidate?.day} را حذف کنید؟ این عملیات غیرقابل بازگشت است.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />

      {/* --- Main UI --- */}
      <Header 
        onShowReport={() => setShowReportModal(true)} 
        onExport={handleExportExcel} 
        disableExport={records.length === 0}
      />

      <main className="container mx-auto max-w-4xl p-4 space-y-8">
        <FinancialEntryForm 
          form={form} 
          operators={operators} 
          onOpenOperatorManager={() => setShowOperatorManager(true)} 
        />
        
        <RecordsList 
          records={records} 
          onEdit={handleEdit} 
          onDelete={requestDelete} 
        />
      </main>
    </div>
  );
}
