export type PatientStatus = 'preparing' | 'confirmed' | 'surgery' | 'recovery' | 'completed' | 'canceled';

export interface Patient {
  id: string;
  code: string;
  nameInitials: string;
  fullName: string;
  room: string;
  procedure: string;
  status: PatientStatus;
  startTime: string;
  lastUpdate: string;
}

export interface SurgerySchedule {
  id: string;
  time: string;
  room: string;
  doctor: string;
  patientInitials: string;
  procedure: string;
  department: string;
}

export const STATUS_LABELS: Record<PatientStatus, { label: string; color: string; icon: string }> = {
  preparing: { label: 'กำลังเตรียมการ', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: 'Clock' },
  confirmed: { label: 'คอนเฟิร์มแล้ว', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: 'CheckCircle2' },
  surgery: { label: 'กำลังผ่าตัด', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'Activity' },
  recovery: { label: 'ห้องพักฟื้น', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'Heart' },
  completed: { label: 'เสร็จสิ้น', color: 'bg-slate-50 text-slate-600 border-slate-100', icon: 'CheckCircle2' },
  canceled: { label: 'ยกเลิก', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: 'XCircle' },
};
