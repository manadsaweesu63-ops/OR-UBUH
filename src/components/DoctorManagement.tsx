import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Stethoscope,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscribeToDoctors, addDoctor, updateDoctor, deleteDoctor, Doctor } from '../services/doctorListService';
import StaffHeader from './StaffHeader';

const CLINICS = [
  'ศัลยกรรมตกแต่ง',
  'ศัลยกรรมทั่วไป',
  'ศัลยกรรมกระดูกและข้อ',
  'ศัลยกรรมระบบทางเดินปัสสาวะ',
  'โสต ศอ นาสิก',
  'จักษุ'
];

export default function DoctorManagement() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', clinic: CLINICS[0] });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToDoctors((data) => {
      setDoctors(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.clinic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await updateDoctor(editingId, formData);
        setEditingId(null);
      } else {
        await addDoctor(formData);
        setIsAdding(false);
      }
      setFormData({ name: '', clinic: CLINICS[0] });
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setFormData({ name: doctor.name, clinic: doctor.clinic });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบข้อมูลแพทย์ท่านนี้ใช่หรือไม่?')) return;
    try {
      await deleteDoctor(id);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/30">
      <StaffHeader />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              กลับหน้าเมนูเจ้าหน้าที่
            </button>
          
          {!isAdding && !editingId && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
            >
              <Plus className="w-5 h-5" />
              เพิ่มแพทย์ใหม่
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">จัดการรายชื่อแพทย์</h1>
            <p className="text-slate-500">เพิ่ม แก้ไข หรือลบรายชื่อแพทย์ในระบบ</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {(isAdding || editingId) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm mb-8"
            >
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 ml-1">ชื่อแพทย์</label>
                  <input 
                    required
                    autoFocus
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ระบุชื่อแพทย์"
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 ml-1">คลินิก</label>
                  <select 
                    value={formData.clinic}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinic: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold appearance-none"
                  >
                    {CLINICS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingId ? 'บันทึก' : 'เพิ่ม'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      setFormData({ name: '', clinic: CLINICS[0] });
                    }}
                    className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อแพทย์ หรือคลินิก..."
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredDoctors.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                ไม่พบข้อมูลแพทย์
              </div>
            ) : (
              filteredDoctors.map(doctor => (
                <div key={doctor.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{doctor.name}</h3>
                      <p className="text-xs text-slate-500">{doctor.clinic}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(doctor)}
                      className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(doctor.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-1">คำแนะนำ</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                รายชื่อแพทย์ที่เพิ่มในหน้านี้ จะไปปรากฏในตัวเลือกของหน้า "ลงข้อมูลผู้ป่วยผ่าตัด" และ "จัดการตารางออกตรวจ" โดยอัตโนมัติ
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
