import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Clock, 
  MapPin, 
  Stethoscope,
  ClipboardList,
  Calendar as CalendarIcon,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { addSurgerySchedule } from '../services/surgeryService';
import { getDoctors, Doctor } from '../services/doctorListService';
import StaffHeader from './StaffHeader';

const ROOMS = ['กรุณาเลือก','Minor 1', 'Minor 2', 'Major 1'];
const SURGERY_TYPES = ['กรุณาเลือก','Minor', 'Major'];
const DEPARTMENTS = ['กรุณาเลือก','Plastic Surgery', 'General Surgery', 'Orthopedic', 'Urology', 'ENT', 'Ophthalmology'];
const PATIENT_TITLES = ['กรุณาเลือก', 'นาย', 'นาง', 'นางสาว', 'เด็กหญิง', 'เด็กชาย'];

export default function SurgeryEntry() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    patientHN: '',
    patientTitle: PATIENT_TITLES[0],
    patientName: '',
    patientAge: '',
    patientPhone: '',
    procedure: '',
    surgeryType: SURGERY_TYPES[0] as 'Minor' | 'Major',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    doctor: 'กรุณาเลือก',
    room: ROOMS[0],
    department: DEPARTMENTS[0],
    notes: ''
  });

  React.useEffect(() => {
    const fetchDoctors = async () => {
      const data = await getDoctors();
      setDoctors(data);
    };
    fetchDoctors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for "กรุณาเลือก"
    if (formData.doctor === 'กรุณาเลือก' || 
        formData.room === 'กรุณาเลือก' || 
        formData.surgeryType === 'กรุณาเลือก' || 
        formData.department === 'กรุณาเลือก' ||
        formData.patientTitle === 'กรุณาเลือก') {
      alert('กรุณาเลือกข้อมูลให้ครบถ้วน');
      return;
    }
    
    setStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      await addSurgerySchedule(formData);
      setStep('success');
    } catch (error) {
      console.error('Error saving surgery:', error);
      alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือลองเข้าสู่ระบบใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <StaffHeader />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => step === 'confirm' ? setStep('input') : navigate('/login')}
              className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              {step === 'confirm' ? 'กลับไปแก้ไข' : 'กลับหน้าเมนูเจ้าหน้าที่'}
            </button>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              step === 'input' ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-600"
            )}>1</div>
            <div className="w-8 h-px bg-slate-200" />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              step === 'confirm' ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-600"
            )}>2</div>
            <div className="w-8 h-px bg-slate-200" />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              step === 'success' ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-600"
            )}>3</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
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
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">ลงข้อมูลผู้ป่วยผ่าตัด</h1>
                  <p className="text-slate-500">กรุณากรอกรายละเอียดการผ่าตัดให้ครบถ้วน</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Info Section */}
                  <div className="space-y-6 md:col-span-2">
                    <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-500" />
                      ข้อมูลคนไข้
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-24 space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">HN</label>
                        <input 
                          required
                          name="patientHN"
                          autoComplete="off"
                          value={formData.patientHN}
                          onChange={handleChange}
                          placeholder="เช่น 123xx"
                          className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                        />
                      </div>
                      <div className="w-full md:w-32 space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">คำนำหน้า</label>
                        <select 
                          required
                          name="patientTitle"
                          value={formData.patientTitle}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none"
                        >
                          {PATIENT_TITLES.map(title => <option key={title} value={title}>{title}</option>)}
                        </select>
                      </div>
                      <div className="flex-grow space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">ชื่อ-นามสกุล</label>
                        <input 
                          required
                          name="patientName"
                          autoComplete="off"
                          value={formData.patientName}
                          onChange={handleChange}
                          placeholder="ระบุชื่อ-นามสกุลคนไข้"
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">อายุ (ปี)</label>
                        <input 
                          required
                          type="number"
                          name="patientAge"
                          autoComplete="off"
                          value={formData.patientAge}
                          onChange={handleChange}
                          placeholder="เช่น 45"
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">เบอร์โทรศัพท์</label>
                        <input 
                          required
                          type="tel"
                          name="patientPhone"
                          autoComplete="off"
                          value={formData.patientPhone}
                          onChange={handleChange}
                          placeholder="เช่น 0812345678"
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clinical Info Section */}
                  <div className="space-y-6 md:col-span-2 pt-4 border-t border-slate-50">
                    <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-emerald-500" />
                      ข้อมูลทางคลินิก
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">หัตถการ/ผ่าตัด (Procedure)</label>
                        <input 
                          required
                          name="procedure"
                          autoComplete="off"
                          value={formData.procedure}
                          onChange={handleChange}
                          placeholder="ระบุชื่อการผ่าตัด"
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedule Info Section */}
                  <div className="space-y-6 md:col-span-2 pt-4 border-t border-slate-50">
                    <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-emerald-500" />
                      ข้อมูลตารางผ่าตัด
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">วันที่ผ่าตัด</label>
                        <input 
                          required
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">เวลาผ่าตัด</label>
                        <input 
                          required
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">แพทย์เจ้าของไข้</label>
                        <select 
                          name="doctor"
                          value={formData.doctor}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none"
                        >
                          <option value="กรุณาเลือก">กรุณาเลือก</option>
                          {doctors.length === 0 ? (
                            <option value="">ไม่มีรายชื่อแพทย์ (กรุณาเพิ่มในระบบ)</option>
                          ) : (
                            doctors.map(doc => <option key={doc.id} value={doc.name}>{doc.name}</option>)
                          )}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">ประเภทการผ่าตัด</label>
                        <select 
                          name="surgeryType"
                          value={formData.surgeryType}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none"
                        >
                          {SURGERY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">ห้องผ่าตัด</label>
                        <select 
                          name="room"
                          value={formData.room}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none"
                        >
                          {ROOMS.map(room => <option key={room} value={room}>{room}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">ภาควิชา</label>
                        <select 
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none"
                        >
                          {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">หมายเหตุ (ถ้ามี)</label>
                        <textarea 
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="ระบุหมายเหตุเพิ่มเติม เช่น เลื่อนนัดมาจากวันที่..."
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 text-lg mt-10"
                >
                  ตรวจสอบข้อมูล
                  <ChevronRight className="w-6 h-6" />
                </button>
              </form>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">ยืนยันข้อมูล</h1>
                  <p className="text-slate-500">กรุณาตรวจสอบความถูกต้องก่อนบันทึก</p>
                </div>
              </div>

              <div className="space-y-6 bg-slate-50 rounded-[2rem] p-8 border border-slate-100 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">HN</p>
                    <p className="text-xl font-black text-emerald-600">{formData.patientHN}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ชื่อ-นามสกุล</p>
                    <p className="text-xl font-black text-slate-800">{formData.patientTitle}{formData.patientName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">อายุ</p>
                    <p className="text-xl font-black text-slate-800">{formData.patientAge} ปี</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">เบอร์โทรศัพท์</p>
                    <p className="text-xl font-black text-slate-800">{formData.patientPhone}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">หัตถการ/ผ่าตัด</p>
                    <p className="text-xl font-black text-emerald-600">{formData.procedure}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">วัน-เวลา</p>
                    <p className="text-xl font-black text-slate-800">
                      {format(parseISO(formData.date), 'd MMM yyyy', { locale: th })} | {formData.time} น.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ประเภทการผ่าตัด</p>
                    <p className="text-xl font-black text-slate-800">{formData.surgeryType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ห้องผ่าตัด</p>
                    <p className="text-xl font-black text-slate-800">{formData.room}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">แพทย์เจ้าของไข้</p>
                    <p className="text-xl font-black text-slate-800">{formData.doctor}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ภาควิชา</p>
                    <p className="text-xl font-black text-slate-800">{formData.department}</p>
                  </div>
                  {formData.notes && (
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">หมายเหตุ</p>
                      <p className="text-lg font-bold text-slate-600 italic">{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => setStep('input')}
                  className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-3xl hover:bg-slate-200 transition-all text-lg"
                >
                  แก้ไขข้อมูล
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-[2] py-5 bg-emerald-500 text-white font-black rounded-3xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 text-lg"
                >
                  <Save className="w-6 h-6" />
                  ยืนยันและบันทึกข้อมูล
                </button>
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
                    ข้อมูลการผ่าตัดของ <span className="font-bold text-slate-800">{formData.patientTitle}{formData.patientName}</span> <br />
                    ได้ถูกเพิ่มลงในตารางเรียบร้อยแล้ว
                  </p>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    setFormData({
                      patientHN: '',
                      patientTitle: PATIENT_TITLES[0],
                      patientName: '',
                      patientAge: '',
                      patientPhone: '',
                      procedure: '',
                      surgeryType: SURGERY_TYPES[0] as 'Minor' | 'Major',
                      date: format(new Date(), 'yyyy-MM-dd'),
                      time: '09:00',
                      doctor: doctors.length > 0 ? doctors[0].name : '',
                      room: ROOMS[0],
                      department: DEPARTMENTS[0],
                      notes: ''
                    });
                    setStep('input');
                  }}
                  className="px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                >
                  เพิ่มรายการใหม่
                </button>
                <button 
                  onClick={() => navigate('/schedule')}
                  className="px-8 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                >
                  ดูตารางผ่าตัด
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
