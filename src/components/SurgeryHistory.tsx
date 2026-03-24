import React, { useState, useMemo } from 'react';
import { 
  SurgerySchedule, 
  subscribeToSurgerySchedule
} from '../services/surgeryService';
import { getDoctorColor } from '../lib/doctorColors';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  User, 
  MapPin, 
  Stethoscope, 
  Clock,
  ClipboardList,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  parseISO,
  isBefore,
  startOfDay
} from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '../lib/utils';
import StaffHeader from './StaffHeader';

export default function SurgeryHistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [surgeries, setSurgeries] = useState<SurgerySchedule[]>([]);
  const today = startOfDay(new Date());

  React.useEffect(() => {
    const unsubscribe = subscribeToSurgerySchedule(setSurgeries);
    return () => unsubscribe();
  }, []);

  const historySchedule = useMemo(() => {
    return surgeries.filter(s => {
      const surgeryDate = parseISO(s.date);
      
      // Only show past surgeries
      if (!isBefore(startOfDay(surgeryDate), today)) return false;

      const matchesSearch = s.doctor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.patientHN.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }, [searchTerm, surgeries, today]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <StaffHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/schedule')}
              className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">ประวัติการผ่าตัดย้อนหลัง</h1>
              <p className="text-slate-500 font-medium">รายการผ่าตัดที่ดำเนินการเสร็จสิ้นแล้ว</p>
            </div>
          </div>

          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text"
              placeholder="ค้นหาชื่อคนไข้, HN, หรือหัตถการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-[2rem] shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-600"
            />
          </div>
        </motion.div>

        <div className="space-y-4">
          {historySchedule.length > 0 ? (
            historySchedule.map((item, idx) => {
              const doctorColor = getDoctorColor(item.doctor);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4 lg:w-1/4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", doctorColor.bg, doctorColor.text)}>
                        <User className="w-7 h-7" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">คนไข้</div>
                        <h3 className="text-lg font-black text-slate-900 truncate">{item.patientName}</h3>
                        <p className="text-sm font-bold text-emerald-600">HN: {item.patientHN}</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">หัตถการ</div>
                          <p className="text-sm font-bold text-slate-700 leading-snug">{item.procedure}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", doctorColor.bg, doctorColor.text)}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">ศัลยแพทย์</div>
                          <p className="text-sm font-bold text-slate-700">{item.doctor}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">วัน/เวลา</div>
                          <p className="text-sm font-bold text-slate-700">
                            {format(parseISO(item.date), 'd MMM yyyy', { locale: th })}
                          </p>
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {item.time} น.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                <ClipboardList className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">ไม่พบประวัติการผ่าตัด</h3>
              <p className="text-slate-500 font-medium">ลองเปลี่ยนคำค้นหาหรือตรวจสอบข้อมูลอีกครั้ง</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
