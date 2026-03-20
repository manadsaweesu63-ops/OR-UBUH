import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Clock, 
  Stethoscope,
  ClipboardList,
  Calendar as CalendarIcon,
  ChevronRight,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { addDoctorSchedule, getDoctorSchedules, updateDoctorSchedule, deleteDoctorSchedule, DoctorSchedule } from '../services/doctorService';

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
  const [step, setStep] = useState<'list' | 'input' | 'success'>('list');
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<DoctorSchedule, 'id'>>({
    name: '',
    clinic: CLINICS[0],
    schedule: [],
    exclusions: []
  });

  const [newDay, setNewDay] = useState(1);
  const [newTime, setNewTime] = useState('08:00 - 12:00 น.');
  const [newExclusion, setNewExclusion] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const fetchSchedules = async () => {
      const data = await getDoctorSchedules();
      setSchedules(data);
    };
    fetchSchedules();
  }, []);

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

  const handleAddExclusion = () => {
    if (formData.exclusions?.includes(newExclusion)) return;
    setFormData(prev => ({
      ...prev,
      exclusions: [...(prev.exclusions || []), newExclusion]
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
    if (formData.schedule.length === 0) {
      alert('กรุณาเพิ่มตารางเวลาอย่างน้อย 1 วัน');
      return;
    }

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
    }
  };

  const handleEdit = (schedule: DoctorSchedule) => {
    setEditingId(schedule.id);
    setFormData({
      name: schedule.name,
      clinic: schedule.clinic,
      schedule: schedule.schedule,
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
      clinic: CLINICS[0],
      schedule: [],
      exclusions: []
    });
    setEditingId(null);
    setStep('input');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => step === 'input' ? setStep('list') : navigate('/login')}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            {step === 'input' ? 'กลับไปหน้ารายการ' : 'กลับหน้าเมนูเจ้าหน้าที่'}
          </button>
          
          {step === 'list' && (
            <button 
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
            >
              <Plus className="w-5 h-5" />
              เพิ่มแพทย์ใหม่
            </button>
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
                  {schedules.map(schedule => (
                    <div key={schedule.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
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
                          {schedule.schedule.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="w-4 h-4 text-emerald-500" />
                              <span className="font-bold text-slate-700">{DAYS.find(d => d.id === s.day)?.label}:</span>
                              <span>{s.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <label className="text-sm font-bold text-slate-500 ml-1">ชื่อ-นามสกุล</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="เช่น อ.นพ. สมชาย ใจดี"
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">คลินิก</label>
                    <select 
                      value={formData.clinic}
                      onChange={(e) => setFormData(prev => ({ ...prev, clinic: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none"
                    >
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
                          value={newExclusion}
                          onChange={(e) => setNewExclusion(e.target.value)}
                          className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none font-bold text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="button"
                          onClick={handleAddExclusion}
                          className="w-full py-2 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          เพิ่มวันหยุด
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.exclusions?.map((date, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100 font-bold text-sm">
                          {format(new Date(date), 'd MMM yyyy')}
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
                    className="flex-[2] py-5 bg-emerald-500 text-white font-black rounded-3xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 text-lg"
                  >
                    <Save className="w-6 h-6" />
                    {editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลแพทย์'}
                  </button>
                </div>
              </form>
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
  );
}
