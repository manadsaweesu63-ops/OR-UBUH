import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowLeft, AlertCircle, ShieldCheck, ClipboardList, Stethoscope, User, Loader2, LogOut, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isStaff') === 'true');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simple mock password for demo
    if (password === 'or1234') {
      localStorage.setItem('isStaff', 'true');
      setIsLoggedIn(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-16 text-center relative"
      >
        <button 
          onClick={() => {
            if (isLoggedIn) {
              localStorage.removeItem('isStaff');
              setIsLoggedIn(false);
            }
            navigate('/');
          }}
          className="absolute top-8 left-8 p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 text-slate-400 font-medium"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-sm">กลับหน้าหลัก</span>
        </button>

        {!isLoggedIn ? (
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">เข้าสู่ระบบเจ้าหน้าที่</h1>
            <p className="text-slate-500 mb-8">กรุณากรอกรหัสผ่านเพื่อเข้าถึงระบบ</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน"
                  className={`w-full px-6 py-4 bg-slate-50 rounded-2xl border ${error ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center text-xl tracking-widest`}
                  autoFocus
                />
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-0 right-0 text-rose-500 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>รหัสผ่านไม่ถูกต้อง</span>
                  </motion.div>
                )}
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
                ยืนยันตัวตน
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-2">ยินดีต้อนรับเจ้าหน้าที่</h1>
            <p className="text-slate-500 mb-12">กรุณาเลือกเมนูที่ต้องการใช้งาน</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <button 
                onClick={() => navigate('/surgery-entry')}
                className="flex flex-col items-center text-center gap-4 p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 hover:bg-emerald-100 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">ลงข้อมูลผู้ป่วยผ่าตัด</div>
                  <div className="text-sm text-slate-500 font-bold">เพิ่มรายการผ่าตัดใหม่</div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/doctor-entry')}
                className="flex flex-col items-center text-center gap-4 p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 hover:bg-indigo-100 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">จัดการตารางออกตรวจ</div>
                  <div className="text-sm text-slate-500 font-bold">เพิ่ม/แก้ไข ตารางแพทย์</div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/doctor-management')}
                className="flex flex-col items-center text-center gap-4 p-8 bg-blue-50 rounded-[2rem] border border-blue-100 hover:bg-blue-100 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">จัดการรายชื่อแพทย์</div>
                  <div className="text-sm text-slate-500 font-bold">เพิ่ม/ลบ รายชื่อแพทย์</div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/schedule')}
                className="flex flex-col items-center text-center gap-4 p-8 bg-amber-50 rounded-[2rem] border border-amber-100 hover:bg-amber-100 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">ตารางวันผ่าตัด</div>
                  <div className="text-sm text-slate-500 font-bold">ดูรายการผ่าตัดรายวัน</div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/status')}
                className="flex flex-col items-center text-center gap-4 p-8 bg-rose-50 rounded-[2rem] border border-rose-100 hover:bg-rose-100 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">สถานะห้องผ่าตัด</div>
                  <div className="text-sm text-slate-500 font-bold">ดูสถานะห้องผ่าตัด Real-time</div>
                </div>
              </button>
            </div>

            <div className="max-w-xs mx-auto">
              <button 
                onClick={() => {
                  localStorage.removeItem('isStaff');
                  setIsLoggedIn(false);
                  navigate('/');
                }}
                className="w-full py-4 bg-rose-50 text-rose-600 font-black rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100"
              >
                <LogOut className="w-5 h-5" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            หากลืมรหัสผ่าน กรุณาติดต่อภาควิชาไอที <br />
            หรือหัวหน้าตึกห้องผ่าตัด
          </p>
        </div>
      </motion.div>
    </div>
  );
}
