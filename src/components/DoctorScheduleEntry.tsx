import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  User, 
  Clock, 
  Stethoscope,
  ClipboardList,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  parseISO,
  setMonth,
  setYear
} from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { 
  addDoctorSchedule, 
  getDoctorSchedules, 
  updateDoctorSchedule, 
  deleteDoctorSchedule, 
  DoctorSchedule, 
  subscribeToDoctorSchedules,
  Holiday,
  addHoliday,
  deleteHoliday,
  subscribeToHolidays
} from '../services/doctorService';
import { getDoctors, Doctor, subscribeToDoctors } from '../services/doctorListService';
import { getDoctorColor } from '../lib/doctorColors';
import StaffHeader from './StaffHeader';

const CLINICS = [
  'ศัลยกรรมตกแต่ง',
  'ศัลยกรรมทั่วไป',
  'ศัลยกรรมกระดูกและข้อ',
  'ศัลยกรรมระบบทางเดินปัสสาวะ',
  'โสต ศอ นาสิก',
  'จักษุ'
];

const DAYS = [
  { id: 0, label: 'อาทิตย์' },
  { id: 1, label: 'จันทร์' },
  { id: 2, label: 'อังคาร' },
  { id: 3, label: 'พุธ' },
  { id: 4, label: 'พฤหัสบดี' },
  { id: 5, label: 'ศุกร์' },
  { id: 6, label: 'เสาร์' }
];

export default function DoctorScheduleEntry() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'list' | 'input' | 'success' | 'holidays'>('list');
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [holidayFormData, setHolidayFormData] = useState({ date: '', name: '' });
  
  const [formData, setFormData] = useState<Omit<DoctorSchedule, 'id'>>({
    name: '',
    clinic: '',
    schedule: [],
    specificDates: [],
    exclusions: []
  });

  const [isSaving, setIsSaving] = useState(false);

  const [newDay, setNewDay] = useState(1);
  const [newTime, setNewTime] = useState('08:00 - 12:00 น.');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTimeForDates, setSelectedTimeForDates] = useState('08:00 - 12:00 น.');

  const MONTHS_TH = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const YEARS_TH = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  useEffect(() => {
    const unsubscribeSchedules = subscribeToDoctorSchedules(setSchedules);
    const unsubscribeDoctors = subscribeToDoctors((data) => {
      setDoctorsList(data);
    });
    const unsubscribeHolidays = subscribeToHolidays(setHolidays);
    
    return () => {
      unsubscribeSchedules();
      unsubscribeDoctors();
      unsubscribeHolidays();
    };
  }, [editingId, formData.name]);

  const handleAddScheduleItem = () => {
    if (formData.schedule.some(s => s.day === newDay)) {
      alert('มีข้อมูลวันนี้นี้อยู่แล้ว');
      return;
    }
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: newDay, time: newTime }]
    }));
  };

  const handleRemoveScheduleItem = (day: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter(s => s.day !== day)
    }));
  };

  const toggleSpecificDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const exists = formData.specificDates?.find(d => d.date === dateStr);

    if (exists) {
      setFormData(prev => ({
        ...prev,
        specificDates: prev.specificDates?.filter(d => d.date !== dateStr) || []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        specificDates: [...(prev.specificDates || []), { date: dateStr, time: selectedTimeForDates }]
      }));
    }
  };

  const handleAddExclusion = (dateStr: string) => {
    if (formData.exclusions?.includes(dateStr)) return;
    setFormData(prev => ({
      ...prev,
      exclusions: [...(prev.exclusions || []), dateStr]
    }));
  };

  const handleRemoveExclusion = (date: string) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions?.filter(d => d !== date) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('กรุณาเลือกชื่อแพทย์');
      return;
    }

    if (formData.schedule.length === 0 && (!formData.specificDates || formData.specificDates.length === 0)) {
      alert('กรุณาเพิ่มตารางเวลาอย่างน้อย 1 วัน (แบบรายสัปดาห์ หรือ ระบุวันที่)');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateDoctorSchedule(editingId, formData);
      } else {
        await addDoctorSchedule(formData);
      }
      
      const updatedSchedules = await getDoctorSchedules();
      setSchedules(updatedSchedules);
      setStep('success');
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (schedule: DoctorSchedule) => {
    setEditingId(schedule.id);
    setFormData({
      name: schedule.name,
      clinic: schedule.clinic,
      schedule: schedule.schedule,
      specificDates: schedule.specificDates || [],
      exclusions: schedule.exclusions || []
    });
    setStep('input');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) return;
    await deleteDoctorSchedule(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      clinic: '',
      schedule: [],
      specificDates: [],
      exclusions: []
    });
    setEditingId(null);
    setStep('input');
  };

  // Calendar Helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <StaffHeader />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => (step === 'input' || step === 'holidays') ? setStep('list') : navigate('/login')}
              className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              {(step === 'input' || step === 'holidays') ? 'กลับไปหน้ารายการ' : 'กลับหน้าเมนูเจ้าหน้าที่'}
            </button>
          
          {step === 'list' && (
            <div className="flex gap-2">
              <button 
                onClick={() => setStep('holidays')}
                className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
              >
                <CalendarIcon className="w-5 h-5" />
                จัดการวันหยุด
              </button>
              <button 
                onClick={resetForm}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
              >
                <Plus className="w-5 h-5" />
                เพิ่มแพทย์ใหม่
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">จัดการตารางออกตรวจ</h1>
                  <p className="text-slate-500">แก้ไขหรือลบข้อมูลตารางออกตรวจของแพทย์</p>
                </div>
              </div>

              {schedules.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                  <p className="text-slate-400 font-medium">ยังไม่มีข้อมูลแพทย์ในระบบ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules.map(schedule => {
                    const doctorColor = getDoctorColor(schedule.name);
                    return (
                      <div key={schedule.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className={cn("px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider", doctorColor.bg, doctorColor.text)}>
                              {schedule.clinic}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(schedule)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                                <ClipboardList className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDelete(schedule.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-4">{schedule.name}</h3>
                          <div className="space-y-2">
                            {schedule.schedule.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-bold text-slate-400 mb-1">รายสัปดาห์:</p>
                                {schedule.schedule.map((s, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <span className="font-bold text-slate-700">{DAYS.find(d => d.id === s.day)?.label}:</span>
                                    <span>{s.time}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {schedule.specificDates && schedule.specificDates.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-slate-400 mb-1">ระบุวันที่ ({schedule.specificDates.length} วัน):</p>
                                <div className="flex flex-wrap gap-1">
                                  {schedule.specificDates.slice(0, 3).map((d, i) => (
                                    <span key={i} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                      {(() => {
                                        const dateObj = parseISO(d.date);
                                        return `${format(dateObj, 'd MMM', { locale: th })} ${dateObj.getFullYear() + 543}`;
                                      })()}
                                    </span>
                                  ))}
                                  {schedule.specificDates.length > 3 && <span className="text-[10px] text-slate-400">...</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">
                    {editingId ? 'แก้ไขข้อมูลแพทย์' : 'เพิ่มข้อมูลแพทย์'}
                  </h1>
                  <p className="text-slate-500">ระบุชื่อ คลินิก และตารางเวลาออกตรวจ</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">ชื่อแพทย์</label>
                    <select 
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const doc = doctorsList.find(d => d.name === e.target.value);
                        setFormData(prev => ({ 
                          ...prev, 
                          name: e.target.value,
                          clinic: doc ? doc.clinic : prev.clinic
                        }));
                      }}
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none"
                    >
                      <option value="">กรุณาเลือก</option>
                      {doctorsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">คลินิก</label>
                    <select 
                      required
                      value={formData.clinic}
                      onChange={(e) => setFormData(prev => ({ ...prev, clinic: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none"
                    >
                      <option value="">กรุณาเลือก</option>
                      {CLINICS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Weekly Schedule Section */}
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-50">
                    <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-500" />
                      ตารางเวลาออกตรวจ (รายสัปดาห์)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 ml-1">วัน</label>
                        <select 
                          value={newDay}
                          onChange={(e) => setNewDay(parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none font-bold text-sm"
                        >
                          {DAYS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 ml-1">เวลา</label>
                        <input 
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          placeholder="เช่น 08:00 - 12:00 น."
                          className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none font-bold text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="button"
                          onClick={handleAddScheduleItem}
                          className="w-full py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          เพิ่มวัน
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {formData.schedule.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black text-sm">
                              {DAYS.find(d => d.id === s.day)?.label.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{DAYS.find(d => d.id === s.day)?.label}</p>
                              <p className="text-sm text-slate-500">{s.time}</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveScheduleItem(s.day)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specific Dates Section */}
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-50">
                    <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-500" />
                      ระบุวันที่ออกตรวจ (เลือกได้หลายวัน)
                    </h3>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">เวลาสำหรับวันที่เลือก</label>
                          <input 
                            value={selectedTimeForDates}
                            onChange={(e) => setSelectedTimeForDates(e.target.value)}
                            className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none font-bold text-sm"
                          />
                        </div>
                        <div className="flex-[2] grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 ml-1">เดือน</label>
                            <select 
                              value={currentMonth.getMonth()}
                              onChange={(e) => setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)))}
                              className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none font-bold text-sm"
                            >
                              {MONTHS_TH.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 ml-1">ปี</label>
                            <select 
                              value={currentMonth.getFullYear()}
                              onChange={(e) => setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)))}
                              className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none font-bold text-sm"
                            >
                              {YEARS_TH.map(y => <option key={y} value={y}>{y + 543}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 px-2">
                        <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-xl transition-colors">
                          <ChevronLeft className="w-5 h-5 text-slate-400" />
                        </button>
                        <span className="font-bold text-slate-700">
                          {`${format(currentMonth, 'MMMM', { locale: th })} ${currentMonth.getFullYear() + 543}`}
                        </span>
                        <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-xl transition-colors">
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
                          <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: startDay }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {daysInMonth.map(day => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isSelected = formData.specificDates?.some(d => d.date === dateStr);
                          const isExclusion = formData.exclusions?.includes(dateStr);

                          return (
                            <button
                              key={dateStr}
                              type="button"
                              onClick={() => toggleSpecificDate(day)}
                              className={`
                                aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all
                                ${isSelected 
                                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' 
                                  : isExclusion
                                    ? 'bg-rose-50 text-rose-300 line-through'
                                    : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-100'
                                }
                              `}
                            >
                              {format(day, 'd')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                      {formData.specificDates && formData.specificDates.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.specificDates.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 font-bold text-xs">
                              {(() => {
                                const dateObj = parseISO(d.date);
                                return `${format(dateObj, 'd MMM', { locale: th })} ${dateObj.getFullYear() + 543}`;
                              })()} ({d.time})
                              <button type="button" onClick={() => toggleSpecificDate(parseISO(d.date))} className="hover:text-blue-800">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Exclusions Section */}
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-50">
                    <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-rose-500" />
                      วันหยุด/งดตรวจ (เฉพาะกิจ)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 ml-1">วันที่งดตรวจ</label>
                        <input 
                          type="date"
                          onChange={(e) => handleAddExclusion(e.target.value)}
                          className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none font-bold text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.exclusions?.map((date, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100 font-bold text-sm">
                          {(() => {
                            const dateObj = parseISO(date);
                            return `${format(dateObj, 'd MMM', { locale: th })} ${dateObj.getFullYear() + 543}`;
                          })()}
                          <button 
                            type="button"
                            onClick={() => handleRemoveExclusion(date)}
                            className="hover:text-rose-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-10">
                  <button 
                    type="button"
                    onClick={() => setStep('list')}
                    className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-3xl hover:bg-slate-200 transition-all text-lg"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className={`flex-[2] py-5 text-white font-black rounded-3xl transition-all shadow-xl flex items-center justify-center gap-3 text-lg ${
                      isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                    }`}
                  >
                    {isSaving ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-6 h-6" />
                    )}
                    {isSaving ? 'กำลังบันทึก...' : (editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลแพทย์')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'holidays' && (
            <motion.div
              key="holidays"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">จัดการวันหยุดนักขัตฤกษ์</h1>
                  <p className="text-slate-500">ระบุวันหยุดที่แพทย์จะไม่มาออกตรวจ (มีผลกับแพทย์ทุกคน)</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">วันที่หยุด</label>
                    <input 
                      type="date"
                      value={holidayFormData.date}
                      onChange={(e) => setHolidayFormData({ ...holidayFormData, date: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">ชื่อวันหยุด</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="เช่น วันสงกรานต์"
                        value={holidayFormData.name}
                        onChange={(e) => setHolidayFormData({ ...holidayFormData, name: e.target.value })}
                        className="flex-grow px-5 py-3.5 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold"
                      />
                      <button 
                        onClick={async () => {
                          if (holidayFormData.date && holidayFormData.name) {
                            await addHoliday(holidayFormData);
                            setHolidayFormData({ date: '', name: '' });
                          } else {
                            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                          }
                        }}
                        className="px-6 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                      >
                        เพิ่ม
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-700">รายการวันหยุด</h3>
                  {holidays.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">ยังไม่มีข้อมูลวันหยุด</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {holidays.sort((a, b) => a.date.localeCompare(b.date)).map(holiday => (
                        <div key={holiday.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 font-black">
                              <CalendarIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{holiday.name}</p>
                              <p className="text-sm text-slate-500 font-bold">
                                {(() => {
                                  const d = parseISO(holiday.date);
                                  return `${format(d, 'd MMMM', { locale: th })} ${d.getFullYear() + 543}`;
                                })()}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteHoliday(holiday.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-12 text-center"
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8">
                <CheckCircle2 className="w-16 h-16" />
              </div>
              <h1 className="text-4xl font-black text-slate-800 mb-4">บันทึกข้อมูลสำเร็จ!</h1>
              <p className="text-slate-500 text-lg mb-12">
                ข้อมูลตารางออกตรวจของ <span className="font-bold text-slate-800">{formData.name}</span> <br />
                ได้ถูกบันทึกลงในระบบเรียบร้อยแล้ว
              </p>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setStep('list')}
                  className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
                >
                  กลับไปหน้ารายการ
                </button>
                <button 
                  onClick={() => navigate('/doctors')}
                  className="px-8 py-4 bg-emerald-50 text-emerald-600 font-black rounded-2xl hover:bg-emerald-100 transition-all"
                >
                  ดูตารางออกตรวจรวม
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
