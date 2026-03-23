import React, { useState, useEffect, useCallback } from 'react';
import { Search, Clock, Activity, Heart, CheckCircle2, Info, Bell, User, ChevronRight, X, Settings, AlertCircle, ArrowLeft, LogOut, ShieldCheck, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient, PatientStatus, STATUS_LABELS } from '../types';
import { cn } from '../lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSurgerySchedule, updateSurgerySchedule, subscribeToSurgerySchedule } from '../services/surgeryService';
import StaffHeader from './StaffHeader';

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length < 2) return name;
  
  // Extract title if exists (e.g., นาย, นาง, น.ส., ด.ช., ด.ญ.)
  const titles = ['นาย', 'นาง', 'น.ส.', 'ด.ช.', 'ด.ญ.', 'นพ.', 'พญ.'];
  let title = '';
  let firstName = parts[0];
  let lastName = parts[1];

  for (const t of titles) {
    if (parts[0].startsWith(t)) {
      title = t;
      firstName = parts[0].substring(t.length);
      break;
    }
  }

  const f = firstName.charAt(0);
  const l = lastName.charAt(0);
  return `${title} ${f}.${l}.`;
};

export default function StatusBoard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const location = useLocation();
  const isAdminPath = location.pathname === '/admin/status';
  const isStaff = localStorage.getItem('isStaff') === 'true';
  const [isAdminMode, setIsAdminMode] = useState(isAdminPath && isStaff);
  const [hnInput, setHnInput] = useState('');
  const [isHnVerified, setIsHnVerified] = useState(false);
  const [hnError, setHnError] = useState('');

  useEffect(() => {
    if (isAdminPath && !isStaff) {
      navigate('/login');
    }
  }, [isAdminPath, isStaff, navigate]);

  useEffect(() => {
    const unsubscribe = subscribeToSurgerySchedule((schedule) => {
      const today = new Date();
      
      const todaySurgeries = schedule.filter(item => {
        try {
          return isSameDay(parseISO(item.date), today);
        } catch (e) {
          return false;
        }
      });

      const mappedPatients: Patient[] = todaySurgeries.map(item => ({
        id: item.id,
        code: item.patientHN,
        nameInitials: getInitials(item.patientName),
        fullName: item.patientName,
        room: item.room,
        procedure: item.procedure,
        status: item.status || 'preparing',
        startTime: item.time,
        lastUpdate: format(new Date(), 'HH:mm'),
      }));

      setPatients(mappedPatients);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isStaff');
    setIsAdminMode(false);
    navigate('/');
  };

  const updateStatus = useCallback(async (id: string, newStatus: PatientStatus) => {
    // Update local state for immediate feedback
    setPatients(prev => prev.map(p => 
      p.id === id ? { ...p, status: newStatus, lastUpdate: format(new Date(), 'HH:mm') } : p
    ));

    // Update persistent storage
    await updateSurgerySchedule(id, { status: newStatus });

    if (selectedPatient?.id === id) {
      setSelectedPatient(prev => prev ? { ...prev, status: newStatus, lastUpdate: format(new Date(), 'HH:mm') } : null);
    }
  }, [selectedPatient]);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.room.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (isAdminMode) return matchesSearch;
    
    // For public view, only show the patient matching the verified HN
    return p.code === hnInput && matchesSearch;
  });

  const handleHnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hnInput.trim()) {
      setHnError('กรุณาระบุหมายเลข HN');
      return;
    }

    const patient = patients.find(p => p.code === hnInput);
    if (patient) {
      setIsHnVerified(true);
      setHnError('');
    } else {
      setHnError('ไม่พบข้อมูลการผ่าตัดสำหรับหมายเลข HN นี้ในวันนี้');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {isAdminMode && <StaffHeader />}
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          {!isAdminMode && (
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              กลับหน้าหลัก
            </button>
          )}
          
          {isAdminMode ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              โหมดเจ้าหน้าที่
            </div>
          ) : !isHnVerified && (
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-bold text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              สำหรับเจ้าหน้าที่
            </button>
          )}
        </div>

        {/* HN Entry Gate for Public */}
        {!isAdminMode && !isHnVerified ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">ติดตามสถานะการผ่าตัด</h2>
            <p className="text-slate-500 mb-8">กรุณาระบุหมายเลข HN ของผู้ป่วยเพื่อตรวจสอบสถานะการผ่าตัดแบบเรียลไทม์</p>
            
            <form onSubmit={handleHnSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="ระบุหมายเลข HN"
                  value={hnInput}
                  onChange={(e) => {
                    setHnInput(e.target.value);
                    if (hnError) setHnError('');
                  }}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold text-lg text-center tracking-widest"
                />
              </div>
              {hnError && (
                <p className="text-rose-500 text-sm font-medium">{hnError}</p>
              )}
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                ตรวจสอบสถานะ
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-slate-50 flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                เพื่อความปลอดภัยและความเป็นส่วนตัว ข้อมูลจะแสดงเฉพาะผู้ที่มีหมายเลข HN ที่ถูกต้องเท่านั้น และจะแสดงข้อมูลเป็นชื่อย่อและรหัส HN บางส่วน
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Admin Badge / Public Info */}
            {isAdminMode ? (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">โหมดเจ้าหน้าที่ (Staff Mode)</p>
                    <p className="text-xs text-slate-400">คุณสามารถอัปเดตสถานะผู้ป่วยได้โดยตรงจากรายการด้านล่าง</p>
                  </div>
                </div>
                <Settings className="w-5 h-5 text-slate-500 animate-spin-slow" />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-blue-900">โหมดสำหรับญาติผู้ป่วย (Public View)</p>
                    <p className="text-xs text-blue-600">แสดงข้อมูลสถานะการผ่าตัดสำหรับ HN: {hnInput.substring(0, 2)}XXXX</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsHnVerified(false); setHnInput(''); }}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  เปลี่ยนหมายเลข HN
                </button>
              </motion.div>
            )}

            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">สถานะห้องผ่าตัด</h1>
                <p className="text-slate-500 mt-1">ข้อมูลอัปเดตล่าสุดแบบเรียลไทม์</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <Clock className="w-5 h-5 text-olive-dark" />
                <span className="text-xl font-mono font-medium text-slate-700">
                  {format(currentTime, 'HH:mm:ss')}
                </span>
                <span className="text-slate-400 text-sm border-l pl-3 border-slate-200">
                  {format(currentTime, 'd MMM yyyy', { locale: th })}
                </span>
              </div>
            </header>

            {/* Search & Stats - ONLY FOR ADMIN */}
            {isAdminMode && patients.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-3 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text"
                    placeholder="ค้นหาด้วยรหัสผู้ป่วย (เช่น HN-45**) หรือห้องผ่าตัด..."
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-emerald-700 flex items-center justify-between shadow-sm border border-emerald-100">
                  <div>
                    <p className="text-emerald-600/70 text-sm font-medium uppercase tracking-wider">กำลังผ่าตัด</p>
                    <p className="text-3xl font-bold">{patients.filter(p => p.status === 'surgery').length}</p>
                  </div>
                  <Activity className="w-10 h-10 opacity-20" />
                </div>
              </div>
            )}

            {/* Status List */}
            <div className="space-y-4">
        {patients.length > 0 && (
          <div className="hidden md:grid grid-cols-12 px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <div className="col-span-3">รหัสผู้ป่วย</div>
            <div className="col-span-3">หัตถการ</div>
            <div className="col-span-1 text-center">ห้อง</div>
            <div className="col-span-3 text-center">สถานะ</div>
            <div className="col-span-2 text-right">เวลาเริ่ม</div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {filteredPatients.map((patient) => (
            <motion.div
              layout
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 items-center p-4 md:p-6 gap-4">
                {/* Patient Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-0.5">
                      {isAdminMode ? patient.code : `${patient.code.substring(0, 2)}XXXX`}
                    </p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">
                      {isAdminMode ? patient.fullName : patient.nameInitials}
                    </p>
                  </div>
                </div>

                {/* Procedure */}
                <div className="col-span-3">
                  <p className="text-xs text-slate-400 mb-1 md:hidden">หัตถการ</p>
                  <p className="text-base font-bold text-slate-700 leading-tight">
                    {patient.procedure}
                  </p>
                </div>

                {/* Room */}
                <div className="col-span-1 text-center">
                  <p className="text-xs text-slate-400 mb-1 md:hidden">ห้อง</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium whitespace-nowrap">
                    {patient.room}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="col-span-3 flex flex-col items-center justify-center">
                  <p className="text-xs text-slate-400 mb-1 md:hidden">สถานะ</p>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold w-fit transition-colors whitespace-nowrap",
                    STATUS_LABELS[patient.status].color
                  )}>
                    {patient.status === 'surgery' && <Activity className="w-4 h-4 animate-pulse" />}
                    {patient.status === 'preparing' && <Clock className="w-4 h-4" />}
                    {patient.status === 'confirmed' && <CheckCircle2 className="w-4 h-4" />}
                    {patient.status === 'recovery' && <Heart className="w-4 h-4 animate-bounce" />}
                    {patient.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    {patient.status === 'canceled' && <X className="w-4 h-4" />}
                    <span>{STATUS_LABELS[patient.status].label}</span>
                  </div>
                </div>

                {/* Time & Update */}
                <div className="col-span-2 text-right">
                  <p className="text-slate-600 font-bold text-lg">{patient.startTime} น.</p>
                  <p className="text-slate-400 text-[10px]">อัปเดต {patient.lastUpdate} น.</p>
                </div>
              </div>
              
              {/* Progress Bar for Surgery */}
              {patient.status === 'surgery' && (
                <div className="h-1 w-full bg-slate-100 overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="h-full w-1/3 bg-blue-300"
                  />
                </div>
              )}

              {/* Admin Controls Inline */}
              {isAdminMode && (
                <div className="bg-slate-50 p-3 border-t border-slate-100 flex flex-wrap gap-2 justify-center" onClick={e => e.stopPropagation()}>
                  {(Object.keys(STATUS_LABELS) as PatientStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(patient.id, status)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                        patient.status === status 
                          ? "bg-slate-800 text-white shadow-md" 
                          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                      )}
                    >
                      {STATUS_LABELS[status].label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPatients.length === 0 && (
          <div className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-emerald-200 shadow-inner">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Calendar className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลการผ่าตัด</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {isAdminMode 
                ? "ขณะนี้ยังไม่มีคิวการผ่าตัดที่กำลังดำเนินการหรือรอรับบริการ" 
                : "ไม่พบข้อมูลการผ่าตัดสำหรับหมายเลข HN นี้ในวันนี้ กรุณาตรวจสอบหมายเลขอีกครั้ง"}
            </p>
            {!isAdminMode && (
              <button 
                onClick={() => { setIsHnVerified(false); setHnInput(''); }}
                className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
              >
                ระบุหมายเลข HN ใหม่
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Section - Only show when verified or admin */}
      {(isAdminMode || isHnVerified) && (
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">ขั้นตอนการผ่าตัด</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            โดยปกติการผ่าตัดจะใช้เวลา 1-3 ชั่วโมง ขึ้นอยู่กับประเภทของการผ่าตัด ญาติสามารถรอได้ที่จุดพักคอยหน้ากลุ่มงานห้องผ่าตัดและวิสัญญี ชั้น 4
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">การแจ้งเตือน</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            เมื่อสถานะเปลี่ยนเป็น "เสร็จสิ้น" พยาบาลจะเรียกญาติที่หน้าห้องผ่าตัดเพื่อแจ้งผลการผ่าตัดเบื้องต้น
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">ห้องพักฟื้น</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            หลังผ่าตัด ผู้ป่วยจะพักฟื้นดูอาการประมาณ 1-2 ชั่วโมง ก่อนย้ายกลับไปยังห้องพักผู้ป่วย
          </p>
        </div>
      </section>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                      {isAdminMode ? selectedPatient.fullName : selectedPatient.nameInitials}
                    </h2>
                    <p className="text-sm font-bold text-blue-600">
                      HN: {isAdminMode ? selectedPatient.code : `${selectedPatient.code.substring(0, 2)}XXXX`}
                    </p>
                    <p className="text-base font-bold text-slate-700 mt-1">หัตถการ: {selectedPatient.procedure}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                    <div className="space-y-8">
                      <div className="relative flex items-center gap-6">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-4 border-white shadow-sm z-10 flex items-center justify-center">
                          <Clock className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">เริ่มเตรียมการ</p>
                          <p className="text-xs text-slate-400">{selectedPatient.startTime} น.</p>
                        </div>
                      </div>

                      <div className={cn(
                        "relative flex items-center gap-6 transition-opacity",
                        ['surgery', 'recovery', 'completed'].includes(selectedPatient.status) ? "opacity-100" : "opacity-30"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center",
                          ['surgery', 'recovery', 'completed'].includes(selectedPatient.status) ? "bg-amber-500" : "bg-slate-200"
                        )}>
                          <Activity className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">เข้าห้องผ่าตัด</p>
                          <p className="text-xs text-slate-400">ดำเนินการแล้ว</p>
                        </div>
                      </div>

                      <div className={cn(
                        "relative flex items-center gap-6 transition-opacity",
                        ['recovery', 'completed'].includes(selectedPatient.status) ? "opacity-100" : "opacity-30"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center",
                          ['recovery', 'completed'].includes(selectedPatient.status) ? "bg-emerald-500" : "bg-slate-200"
                        )}>
                          <Heart className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">ห้องพักฟื้น</p>
                          <p className="text-xs text-slate-400">
                            {['recovery', 'completed'].includes(selectedPatient.status) ? "กำลังพักฟื้น" : "รอการอัปเดต"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <p className="text-xs text-rose-700 leading-relaxed">
                      ข้อมูลนี้ใช้เพื่อการติดตามสถานะเบื้องต้นเท่านั้น หากต้องการข้อมูลทางการแพทย์ที่ชัดเจน กรุณารอพบแพทย์เจ้าของไข้หลังการผ่าตัดเสร็จสิ้น
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="w-full mt-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                  ตกลง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        </>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 ระบบติดตามสถานะห้องผ่าตัดอัจฉริยะ | โรงพยาบาลมหาวิทยาลัยอุบลราชธานี</p>
        <p className="mt-1">วิทยาลัยแพทยศาสตร์และการสาธารณสุข มหาวิทยาลัยอุบลราชธานี</p>
      </footer>
    </div>
  </div>
);
}
