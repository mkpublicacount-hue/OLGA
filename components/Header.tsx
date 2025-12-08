
import React from 'react';
import { LayoutDashboard, PieChart, Download } from 'lucide-react';

interface HeaderProps {
  onShowReport: () => void;
  onExport: () => void;
  disableExport: boolean;
}

const Header: React.FC<HeaderProps> = ({ onShowReport, onExport, disableExport }) => {
  return (
    <header className="bg-slate-800 text-white py-3 px-4 shadow-sm">
      <div className="container mx-auto max-w-5xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={24} className="text-blue-400" />
          <div>
            <h1 className="text-lg font-bold leading-none">مدیریت حساب روزانه</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onShowReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-all shadow-sm border border-blue-500"
          >
            <PieChart size={14} />
            <span className="hidden sm:inline">گزارش</span>
          </button>
          <button 
            onClick={onExport}
            disabled={disableExport}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-all shadow-sm border border-emerald-500"
          >
            <Download size={14} />
            <span className="hidden sm:inline">اکسل</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
