import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Megaphone, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_PR = [
  { id: 1, date: '15 มี.ค. 2569', title: 'ประกาศ: การปรับปรุงระบบการจองห้องผ่าตัดใหม่', desc: 'เพื่อเพิ่มประสิทธิภาพในการให้บริการ ทางภาควิชาได้นำระบบจองห้องผ่าตัดใหม่มาใช้...' },
  { id: 2, date: '10 มี.ค. 2569', title: 'กิจกรรม: อบรมการเตรียมตัวก่อนผ่าตัดสำหรับญาติ', desc: 'ขอเชิญญาติผู้ป่วยเข้าร่วมฟังการบรรยายพิเศษเรื่องการดูแลผู้ป่วยหลังผ่าตัด...' },
  { id: 3, date: '05 มี.ค. 2569', title: 'ข่าวดี: ภาควิชาห้องผ่าตัดได้รับรางวัลมาตรฐานความปลอดภัยดีเด่น', desc: 'ความภูมิใจของทีมงานทุกคนที่มุ่งมั่นรักษามาตรฐานความปลอดภัยระดับสากล...' },
];

export default function PressRelease() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          กลับหน้าหลัก
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">ข่าวประชาสัมพันธ์</h1>
                <p className="text-slate-500">ประกาศและข่าวสารล่าสุดจากภาควิชาห้องผ่าตัด</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Megaphone className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีข่าวประชาสัมพันธ์ ณ ขณะนี้</h3>
              <p className="text-slate-500">โปรดติดตามประกาศและข่าวสารใหม่ๆ ได้ที่นี่ในเร็วๆ นี้</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
