import React, { useState, useMemo } from 'react';
import { 
  getSurgerySchedule, 
  SurgerySchedule, 
  updateSurgerySchedule, 
  deleteSurgerySchedule,
  subscribeToSurgerySchedule
} from '../services/surgeryService';
import { getDoctors, Doctor, subscribeToDoctors } from '../services/doctorListService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Search, 
  User, 
  MapPin, 
  Stethoscope, 
  Clock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  isSameDay,
  parseISO,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  addYears,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  isToday
} from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '../lib/utils';
import StaffHeader from './StaffHeader';

const DEFAULT_COLOR = { 
  bg: 'bg-slate-50', 
  text: 'text-slate-700', 
  border: 'border-slate-200', 
  bar: 'bg-slate-500',
  shadow: 'shadow-slate-100'
};

const PASTEL_COLORS = [
  { bg: 'bg-French lilac-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500', shadow: 'shadow-blue-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', shadow: 'shadow-emerald-100' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500', shadow: 'shadow-amber-100' },
  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500', shadow: 'shadow-rose-100' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', bar: 'bg-indigo-500', shadow: 'shadow-indigo-100' },
  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', bar: 'bg-purple-500', shadow: 'shadow-purple-100' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', bar: 'bg-cyan-500', shadow: 'shadow-cyan-100' },
  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500', shadow: 'shadow-orange-100' },
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', bar: 'bg-teal-500', shadow: 'shadow-teal-100' },
  { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', bar: 'bg-pink-500', shadow: 'shadow-pink-100' },
];

const getDoctorColor = (name: string) => {
  if (!name || name === 'all') return DEFAULT_COLOR;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
};

export default function SurgerySchedulePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [surgeries, setSurgeries] = useState<SurgerySchedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 19)); 
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SurgerySchedule>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const isStaff = localStorage.getItem('isStaff') === 'true';

  React.useEffect(() => {
    const unsubscribeSurgeries = subscribeToSurgerySchedule(setSurgeries);
    const unsubscribeDoctors = subscribeToDoctors(setDoctors);
    
    return () => {
      unsubscribeSurgeries();
      unsubscribeDoctors();
    };
  }, []);

  const handleEdit = (item: SurgerySchedule) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    if (editingId) {
      try {
        await updateSurgerySchedule(editingId, editForm);
        setEditingId(null);
      } catch (error) {
        console.error('Error updating surgery:', error);
        alert('ไม่สามารถบันทึกการแก้ไขได้');
      }
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteSurgerySchedule(deleteConfirmId);
        setDeleteConfirmId(null);
      } catch (error) {
        console.error('Error deleting surgery:', error);
        alert('ไม่สามารถลบข้อมูลได้');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredSchedule = useMemo(() => {
    return surgeries.filter(s => {
      const matchesSearch = s.doctor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.patientHN.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDoctor = selectedDoctor === 'all' || s.doctor === selectedDoctor;
      
      // If searching, ignore month filter. Otherwise, show the entire month's schedule.
      const surgeryDate = parseISO(s.date);
      const matchesMonth = searchTerm ? true : isSameMonth(surgeryDate, currentMonth);
      
      return matchesSearch && matchesDoctor && matchesMonth;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [searchTerm, selectedDoctor, currentMonth, surgeries]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getSurgeriesForDay = (day: Date) => {
    return surgeries.filter(s => {
      const surgeryDate = parseISO(s.date);
      const matchesDoctor = selectedDoctor === 'all' || s.doctor === selectedDoctor;
      return isSameDay(surgeryDate, day) && matchesDoctor;
    });
  };

  // Group surgeries by date for better display in the list
  const groupedSchedule = useMemo<{ [key: string]: SurgerySchedule[] }>(() => {
    const groups: { [key: string]: SurgerySchedule[] } = {};
    filteredSchedule.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });
    return groups;
  }, [filteredSchedule]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: format(new Date(2026, i, 1), 'MMMM', { locale: th })
    }));
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <StaffHeader />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteConfirmId && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100"
                >
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">ยืนยันการลบข้อมูล?</h3>
                  <p className="text-slate-500 font-bold mb-8">
                    คุณแน่ใจหรือไม่ว่าต้องการลบรายการผ่าตัดนี้? ข้อมูลที่ลบแล้วจะไม่สามารถกู้คืนได้
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-grow py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      onClick={confirmDelete}
                      className="flex-grow py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                    >
                      ลบข้อมูล
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
              <button 
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2",
                  viewMode === 'calendar' 
                    ? (selectedDoctor === 'all' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : `${getDoctorColor(selectedDoctor).bg} ${getDoctorColor(selectedDoctor).text} shadow-lg ${getDoctorColor(selectedDoctor).shadow}`)
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <CalendarIcon className="w-4 h-4" />
                ปฏิทิน
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2",
                  viewMode === 'list' 
                    ? (selectedDoctor === 'all' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : `${getDoctorColor(selectedDoctor).bg} ${getDoctorColor(selectedDoctor).text} shadow-lg ${getDoctorColor(selectedDoctor).shadow}`)
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <ClipboardList className="w-4 h-4" />
                รายการ
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {isStaff && (
              <button 
                onClick={() => navigate('/surgery-entry')}
                className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 font-black text-lg"
              >
                <ClipboardList className="w-6 h-6" />
                ลงข้อมูลผู้ป่วยผ่าตัด
              </button>
            )}
            
            <div className="relative flex-grow min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="ค้นหาชื่อคนไข้, HN, หัตถการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 transition-all shadow-sm font-bold text-slate-700 text-lg",
                  selectedDoctor === 'all' ? "focus:ring-emerald-500/10 focus:border-emerald-500" : `${getDoctorColor(selectedDoctor).shadow.replace('shadow-', 'focus:ring-').replace('100', '500/10')} ${getDoctorColor(selectedDoctor).border.replace('border-', 'focus:border-').replace('200', '500')}`
                )}
              />
            </div>

            <div className="relative min-w-[280px]">
              <div className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10 border transition-colors",
                selectedDoctor === 'all' ? "bg-emerald-500 text-white border-emerald-400" : `${getDoctorColor(selectedDoctor).bg} ${getDoctorColor(selectedDoctor).text} ${getDoctorColor(selectedDoctor).border}`
              )}>
                <Stethoscope className="w-4 h-4" />
              </div>
              <select 
                className="w-full pl-12 pr-10 py-4 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-black text-slate-700 appearance-none cursor-pointer text-lg"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="all">แสดงแพทย์ทุกคน</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.name}>{doc.name}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* List of Surgeries */}
          <div className="lg:col-span-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl transition-all",
                  selectedDoctor === 'all' ? "bg-emerald-500 shadow-emerald-200" : (getDoctorColor(selectedDoctor).bar || "bg-slate-500 shadow-slate-200"),
                  selectedDoctor !== 'all' && getDoctorColor(selectedDoctor).shadow
                )}>
                  {selectedDoctor === 'all' ? <CalendarIcon className="w-8 h-8" /> : <Stethoscope className="w-8 h-8" />}
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-black uppercase tracking-widest">
                    {searchTerm ? 'ผลการค้นหา' : (selectedDoctor === 'all' ? 'ตารางผ่าตัดประจำเดือน' : 'ตารางผ่าตัดของแพทย์')}
                  </p>
                  <h3 className="text-3xl font-black text-slate-800">
                    {searchTerm 
                      ? `"${searchTerm}"`
                      : (selectedDoctor === 'all' 
                        ? `${format(currentMonth, 'MMMM', { locale: th })} ${currentMonth.getFullYear() + 543}`
                        : selectedDoctor)
                    }
                  </h3>
                  <p className={cn(
                    "text-base font-black mt-1",
                    selectedDoctor === 'all' ? "text-emerald-600" : (getDoctorColor(selectedDoctor).text || "text-slate-600")
                  )}>
                    พบทั้งหมด {filteredSchedule.length} รายการ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative">
                  <select 
                    className="pl-4 pr-10 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-slate-700 appearance-none cursor-pointer text-sm"
                    value={currentMonth.getMonth()}
                    onChange={(e) => {
                      const newDate = new Date(currentMonth);
                      newDate.setMonth(parseInt(e.target.value));
                      setCurrentMonth(newDate);
                    }}
                  >
                    {monthOptions.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 rotate-90 pointer-events-none" />
                </div>

                <div className="relative">
                  <select 
                    className="pl-4 pr-10 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-slate-700 appearance-none cursor-pointer text-sm"
                    value={currentMonth.getFullYear()}
                    onChange={(e) => {
                      const newDate = new Date(currentMonth);
                      newDate.setFullYear(parseInt(e.target.value));
                      setCurrentMonth(newDate);
                    }}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>
                        {year + 543} {/* Display in Buddhist Era if preferred, but let's stick to Gregorian for consistency with date-fns or use th locale */}
                        {/* Actually, Thai users often use BE. format(..., 'yyyy', {locale: th}) usually handles it if configured, but here we are using raw numbers. */}
                        {/* Let's just show the year as is or with BE offset if they expect it. */}
                        {/* The previous format was 'MMMM yyyy' which in 'th' locale shows BE year. */}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

          {viewMode === 'calendar' ? (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
              {/* Doctor Legend */}
              <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-4">
                {doctors.map((doc) => {
                  const config = getDoctorColor(doc.name);
                  return (
                    <div key={doc.id} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full border", config.bar)} />
                      <span className="text-sm font-black text-slate-500">{doc.name.split(' ').slice(0, -1).join(' ')}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 border-b border-slate-100">
                {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day, i) => (
                  <div key={day} className={cn(
                    "py-6 text-center text-base font-black uppercase tracking-widest",
                    i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : "text-slate-400"
                  )}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => {
                  const daySurgeries = getSurgeriesForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDay = isToday(day);

                  return (
                    <div 
                      key={day.toString()} 
                      className={cn(
                        "min-h-[160px] p-4 border-r border-b border-slate-50 transition-colors relative group",
                        !isCurrentMonth && "bg-slate-50/50 opacity-40",
                        isTodayDay && "bg-emerald-50/30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-base font-black",
                          isTodayDay ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : (isCurrentMonth ? "text-slate-700" : "text-slate-400")
                        )}>
                          {format(day, 'd')}
                        </span>
                        {daySurgeries.length > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-black">
                            {daySurgeries.length} รายการ
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                        {daySurgeries.slice(0, 3).map(s => {
                          const config = getDoctorColor(s.doctor);
                          return (
                              <div 
                                key={s.id}
                                onClick={() => {
                                  setViewMode('list');
                                  setSearchTerm(s.patientHN);
                                }}
                                className={cn(
                                  "p-1.5 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden pl-3",
                                  config?.bg || "bg-white",
                                  config?.border || "border-slate-100",
                                  config?.text || "text-slate-700"
                                )}
                              >
                                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config?.bar || "bg-slate-200")} />
                                <p className="text-[13px] font-black truncate leading-tight">{s.patientTitle}{s.patientName}</p>
                                <div className="flex justify-between items-center gap-1">
                                <p className="text-xs truncate font-bold opacity-80">{s.procedure}</p>
                                <p className="text-[11px] font-black whitespace-nowrap opacity-60">{s.doctor.split(' ').slice(0, -1).join(' ')}</p>
                              </div>
                            </div>
                          );
                        })}
                        {daySurgeries.length > 3 && (
                          <p className="text-xs text-emerald-500 font-black text-center mt-1">
                            + อีก {daySurgeries.length - 3} รายการ
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {(Object.entries(groupedSchedule) as [string, SurgerySchedule[]][]).map(([date, surgeries]) => (
                  <div key={date} id={`date-${date}`} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px bg-slate-100 flex-grow" />
                      <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-sm font-black">
                        {(() => {
                          const d = parseISO(date);
                          return `${format(d, 'EEEEที่ d MMMM', { locale: th })} ${d.getFullYear() + 543}`;
                        })()}
                      </span>
                      <div className="h-px bg-slate-100 flex-grow" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {surgeries.map((item, idx) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                          key={item.id}
                          className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all group relative"
                        >
                          {isStaff && (
                            <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              {editingId === item.id ? (
                                <>
                                  <button 
                                    onClick={handleSave}
                                    className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
                                    title="บันทึก"
                                  >
                                    <Save className="w-5 h-5" />
                                  </button>
                                  <button 
                                    onClick={handleCancel}
                                    className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                                    title="ยกเลิก"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleEdit(item)}
                                    className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-100"
                                    title="แก้ไข"
                                  >
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100"
                                    title="ลบ"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="flex items-center gap-5 min-w-[160px]">
                              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                                <Clock className="w-7 h-7" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">เวลาผ่าตัด</p>
                                {editingId === item.id ? (
                                  <div className="flex items-center gap-1">
                                    <select 
                                      value={editForm.time.split(':')[0]}
                                      onChange={(e) => setEditForm({ ...editForm, time: `${e.target.value}:${editForm.time.split(':')[1]}` })}
                                      className="font-black text-slate-700 text-lg bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                                        <option key={h} value={h}>{h}</option>
                                      ))}
                                    </select>
                                    <span className="font-bold text-slate-400">:</span>
                                    <select 
                                      value={editForm.time.split(':')[1]}
                                      onChange={(e) => setEditForm({ ...editForm, time: `${editForm.time.split(':')[0]}:${e.target.value}` })}
                                      className="font-black text-slate-700 text-lg bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                                        <option key={m} value={m}>{m}</option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <span className="font-black text-slate-700 text-2xl">{item.time} น.</span>
                                )}
                              </div>
                            </div>

                            <div className="flex-grow space-y-4">
                              <div className="flex flex-wrap gap-3">
                                {editingId === item.id ? (
                                  <>
                                    <select 
                                      value={editForm.surgeryType}
                                      onChange={(e) => setEditForm({ ...editForm, surgeryType: e.target.value as 'Minor' | 'Major' })}
                                      className="px-3 py-1 rounded-full text-xs font-black bg-slate-50 border border-slate-200"
                                    >
                                      <option value="Minor">Minor</option>
                                      <option value="Major">Major</option>
                                    </select>
                                    <select 
                                      value={editForm.room}
                                      onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                                      className="px-3 py-1 rounded-full text-xs font-black bg-slate-50 border border-slate-200"
                                    >
                                      <option value="Minor 1">Minor 1</option>
                                      <option value="Minor 2">Minor 2</option>
                                      <option value="Major 1">Major 1</option>
                                    </select>
                                    <select 
                                      value={editForm.status}
                                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                      className="px-3 py-1 rounded-full text-xs font-black bg-slate-50 border border-slate-200"
                                    >
                                      <option value="unconfirmed">ยังไม่คอนเฟิร์ม</option>
                                      <option value="confirmed">คอนเฟิร์มแล้ว</option>
                                      <option value="preparing">กำลังเตรียมการ</option>
                                      <option value="surgery">กำลังผ่าตัด</option>
                                      <option value="recovery">ห้องพักฟื้น</option>
                                      <option value="completed">เสร็จสิ้น</option>
                                      <option value="canceled">ยกเลิก</option>
                                    </select>
                                  </>
                                ) : (
                                  <>
                                    <span className={cn(
                                      "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider",
                                      item.surgeryType === 'Major' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                      {item.surgeryType}
                                    </span>
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-black">
                                      <MapPin className="w-4 h-4" />
                                      {item.room}
                                    </span>
                                  </>
                                )}
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-sm font-black">
                                  ภาควิชา: {item.department}
                                </span>
                                  {item.status && (
                                    <span className={cn(
                                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black",
                                      item.status === 'unconfirmed' && "bg-slate-100 text-slate-500 border border-slate-200",
                                      item.status === 'confirmed' && "bg-indigo-50 text-indigo-600 border border-indigo-100",
                                      item.status === 'preparing' && "bg-blue-50 text-blue-600 border border-blue-100",
                                      item.status === 'surgery' && "bg-amber-50 text-amber-600 border border-amber-100",
                                      item.status === 'recovery' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                                      item.status === 'completed' && "bg-slate-50 text-slate-600 border border-slate-100",
                                      item.status === 'canceled' && "bg-rose-50 text-rose-600 border border-rose-100"
                                    )}>
                                      {item.status === 'unconfirmed' && 'ยังไม่คอนเฟิร์ม'}
                                      {item.status === 'confirmed' && 'คอนเฟิร์มแล้ว'}
                                      {item.status === 'preparing' && 'กำลังเตรียมการ'}
                                      {item.status === 'surgery' && 'กำลังผ่าตัด'}
                                      {item.status === 'recovery' && 'ห้องพักฟื้น'}
                                      {item.status === 'completed' && 'เสร็จสิ้น'}
                                      {item.status === 'canceled' && 'ยกเลิก'}
                                    </span>
                                  )}
                              </div>
                              
                              <div>
                                {editingId === item.id ? (
                                  <div className="space-y-2">
                                    <input 
                                      value={editForm.procedure}
                                      onChange={(e) => setEditForm({ ...editForm, procedure: e.target.value })}
                                      className="text-xl font-black text-slate-800 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      placeholder="หัตถการ"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <h4 className="text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors mb-1">
                                      {item.procedure}
                                    </h4>
                                  </>
                                )}
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                                    <User className="w-4 h-4" />
                                  </div>
                                  {editingId === item.id ? (
                                    <div className="flex flex-col gap-2 flex-grow">
                                      <div className="flex gap-2">
                                        <input 
                                          value={editForm.patientHN}
                                          onChange={(e) => setEditForm({ ...editForm, patientHN: e.target.value })}
                                          className="text-sm font-bold text-emerald-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-24"
                                          placeholder="HN"
                                        />
                                        <input 
                                          value={editForm.patientName}
                                          onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                                          className="text-sm font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 flex-grow"
                                          placeholder="ชื่อคนไข้"
                                        />
                                        <input 
                                          value={editForm.patientAge}
                                          onChange={(e) => setEditForm({ ...editForm, patientAge: e.target.value })}
                                          className="text-sm font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-16"
                                          placeholder="อายุ"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <input 
                                          value={editForm.caseSetter || ''}
                                          onChange={(e) => setEditForm({ ...editForm, caseSetter: e.target.value })}
                                          className="text-sm font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                                          placeholder="ชื่อผู้ Set Case"
                                        />
                                        <input 
                                          value={editForm.caseReceiver || ''}
                                          onChange={(e) => setEditForm({ ...editForm, caseReceiver: e.target.value })}
                                          className="text-sm font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                                          placeholder="ชื่อผู้รับ Set Case"
                                        />
                                      </div>
                                      <textarea
                                        value={editForm.notes || ''}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="หมายเหตุ (ถ้ามี)"
                                        rows={2}
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1 flex-grow">
                                      <p className="text-lg font-bold text-slate-500">
                                        <span className="text-emerald-600 mr-2">HN {item.patientHN}</span>
                                        {item.patientTitle}{item.patientName}
                                        <span className="ml-3 text-slate-400 font-medium">อายุ {item.patientAge} ปี</span>
                                      </p>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {item.patientPhone && (
                                          <p className="text-sm font-bold text-slate-400 flex items-center gap-1">
                                            เบอร์โทร: {item.patientPhone}
                                          </p>
                                        )}
                                        {item.caseSetter && (
                                          <p className="text-sm font-bold text-indigo-500 flex items-center gap-1">
                                            ผู้ Set Case: {item.caseSetter}
                                          </p>
                                        )}
                                        {item.caseReceiver && (
                                          <p className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                                            ผู้รับ Set Case: {item.caseReceiver}
                                          </p>
                                        )}
                                      </div>
                                      {item.notes && (
                                        <p className="text-sm font-medium text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
                                          หมายเหตุ: {item.notes}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {selectedDoctor === 'all' && (
                              <div className="flex items-center gap-4 md:border-l md:pl-8 border-slate-100 min-w-[240px] shrink-0">
                                <div className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center border shrink-0",
                                  getDoctorColor(item.doctor).bg || "bg-slate-50",
                                  getDoctorColor(item.doctor).text || "text-slate-400",
                                  getDoctorColor(item.doctor).border || "border-slate-100"
                                )}>
                                  <Stethoscope className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ศัลยแพทย์</p>
                                  <p className={cn(
                                    "font-black text-lg leading-tight",
                                    getDoctorColor(item.doctor).text || "text-slate-800"
                                  )}>{item.doctor}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </AnimatePresence>

              {filteredSchedule.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                    <CalendarIcon className="w-10 h-10" />
                  </div>
                  <p className="text-xl text-slate-400 font-bold">
                    {selectedDoctor === 'all' 
                      ? 'ไม่มีรายการผ่าตัดในเดือนนี้' 
                      : `ไม่มีรายการผ่าตัดของ ${selectedDoctor} ในเดือนนี้`
                    }
                  </p>
                  <p className="text-slate-300 mt-2">ลองเปลี่ยนเดือนหรือเลือกแพทย์ท่านอื่น</p>
                </motion.div>
              )}
            </div>
          )}

            {/* Footer Info */}
            <div className="mt-8 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 mb-1">หมายเหตุสำหรับเจ้าหน้าที่</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  ตารางผ่าตัดอาจมีการเปลี่ยนแปลงตามความเหมาะสมและสถานการณ์ฉุกเฉิน 
                  หากมีการเลื่อนหรือยกเลิก กรุณาแจ้งศูนย์ประสานงานห้องผ่าตัดทันที
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
