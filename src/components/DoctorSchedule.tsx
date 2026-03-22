import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  User,
  Clock,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  getDay,
  setYear,
  setMonth
} from 'date-fns';
import { th } from 'date-fns/locale';
import { subscribeToDoctorSchedules, DoctorSchedule as DoctorScheduleType } from '../services/doctorService';

// Clinic configurations with pastel colors
const CLINICS = {
  'ศัลยกรรมตกแต่ง': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  'ศัลยกรรมทั่วไป': { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  'ศัลยกรรมกระดูกและข้อ': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'ศัลยกรรมระบบทางเดินปัสสาวะ': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'โสต ศอ นาสิก': { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  'จักษุ': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
};

const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

export default function DoctorSchedule() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClinic, setSelectedClinic] = useState('ทั้งหมด');
  const [selectedDoctor, setSelectedDoctor] = useState('ทั้งหมด');
  const [doctors, setDoctors] = useState<DoctorScheduleType[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToDoctorSchedules((data) => {
      setDoctors(data);
    });
    return () => unsubscribe();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const clinicMatch = selectedClinic === 'ทั้งหมด' || doc.clinic === selectedClinic;
      const doctorMatch = selectedDoctor === 'ทั้งหมด' || doc.name === selectedDoctor;
      return clinicMatch && doctorMatch;
    });
  }, [selectedClinic, selectedDoctor, doctors]);

  const getDayEvents = (day: Date) => {
    const dayOfWeek = getDay(day);
    const dateString = format(day, 'yyyy-MM-dd');
    
    return filteredDoctors
      .filter(doc => !(doc.exclusions?.includes(dateString)))
      .flatMap(doc => {
        // Recurring weekly events
        const weeklyEvents = doc.schedule
          .filter(s => s.day === dayOfWeek)
          .map(s => ({ ...doc, time: s.time }));
        
        // Specific date events
        const specificEvents = (doc.specificDates || [])
          .filter(sd => sd.date === dateString)
          .map(sd => ({ ...doc, time: sd.time }));
          
        return [...weeklyEvents, ...specificEvents];
      });
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(setMonth(currentDate, parseInt(e.target.value)));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(setYear(currentDate, parseInt(e.target.value)));
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            กลับหน้าหลัก
          </button>
        </div>

        {/* Persistent Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">เดือน</label>
            <select 
              value={currentDate.getMonth()} 
              onChange={handleMonthChange}
              className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">ปี</label>
            <select 
              value={currentDate.getFullYear()} 
              onChange={handleYearChange}
              className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              {YEARS.map(y => <option key={y} value={y}>{y + 543}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">คลินิก</label>
            <select 
              value={selectedClinic} 
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              {Object.keys(CLINICS)
                .sort((a, b) => a.localeCompare(b, 'th'))
                .map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">ศัลยแพทย์</label>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              {[...doctors]
                .sort((a, b) => a.name.localeCompare(b.name, 'th'))
                .map(d => <option key={d.name} value={d.name}>{d.name}</option>)
              }
            </select>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          {/* Calendar Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {format(currentDate, 'MMMM', { locale: th })} {currentDate.getFullYear() + 543}
                </h2>
                <p className="text-sm text-slate-500">ตารางออกตรวจศัลยแพทย์</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              >
                วันนี้
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day) => (
              <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-r border-slate-50 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const events = getDayEvents(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx} 
                  className={cn(
                    "min-h-[140px] p-2 border-r border-b border-slate-50 last:border-r-0 flex flex-col gap-1 transition-colors",
                    !isCurrentMonth && "bg-slate-50/50",
                    isToday && "bg-indigo-50/30"
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      !isCurrentMonth ? "text-slate-300" : "text-slate-600",
                      isToday && "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                    {events.map((event, eIdx) => {
                      const clinicStyle = CLINICS[event.clinic as keyof typeof CLINICS] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                      return (
                        <motion.div 
                          key={eIdx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "text-[10px] p-1.5 rounded-lg border leading-tight shadow-sm",
                            clinicStyle.bg,
                            clinicStyle.text,
                            clinicStyle.border
                          )}
                        >
                          <div className="font-bold truncate">{event.name}</div>
                          <div className="text-[9px] opacity-90 font-medium truncate">{event.clinic}</div>
                          <div className="opacity-80 truncate">{event.time}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Data Notice */}
          {doctors.length === 0 && (
            <div className="p-12 text-center bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">ยังไม่มีข้อมูลตารางตรวจ</h3>
              <p className="text-slate-500 text-sm">กรุณาลงข้อมูลตารางตรวจแพทย์ในระบบเจ้าหน้าที่</p>
            </div>
          )}
        </motion.div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          {Object.entries(CLINICS).map(([name, style]) => (
            <div key={name} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", style.bg, "border", style.border)} />
              <span className="text-xs font-medium text-slate-500">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
