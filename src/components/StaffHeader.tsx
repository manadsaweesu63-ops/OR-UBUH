import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function StaffHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isStaff');
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/login');
  };

  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าหลักเจ้าหน้าที่</span>
          </button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold text-sm">ระบบเจ้าหน้าที่</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all text-sm font-bold border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
}
