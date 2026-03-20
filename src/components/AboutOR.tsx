import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Info, Shield, Clock, Heart, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutOR() {
  const navigate = useNavigate();

  const steps = [
    { title: 'การเตรียมตัว', desc: 'งดน้ำและอาหารอย่างน้อย 6-8 ชั่วโมงก่อนผ่าตัด', icon: Clock },
    { title: 'ความปลอดภัย', desc: 'ตรวจสอบชื่อ-นามสกุล และประเภทการผ่าตัดอย่างเข้มงวด', icon: Shield },
    { title: 'การผ่าตัด', desc: 'ดำเนินการโดยทีมแพทย์ผู้เชี่ยวชาญและเครื่องมือทันสมัย', icon: Heart },
    { title: 'การพักฟื้น', desc: 'ดูแลอย่างใกล้ชิดในห้องพักฟื้นจนกว่าจะรู้สึกตัวดี', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          กลับหน้าหลัก
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="h-48 bg-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/hospital/1200/400')] bg-cover bg-center mix-blend-overlay opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h1 className="text-3xl font-bold text-white">แนะนำห้องผ่าตัด</h1>
              <p className="text-blue-100">ข้อมูลสำหรับผู้ป่วยและญาติ</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">มาตรฐานความปลอดภัยระดับสากล</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                ห้องผ่าตัดของเราได้รับการออกแบบตามมาตรฐาน JCI โดยเน้นความสะอาด ปลอดเชื้อ 
                และเทคโนโลยีทางการแพทย์ที่ทันสมัยที่สุด เพื่อผลลัพธ์การรักษาที่ดีที่สุดสำหรับผู้ป่วยทุกคน
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {steps.map((step, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm mb-4">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                <Info className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">ข้อควรรู้สำหรับญาติ</h4>
                  <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                    <li>กรุณารอที่จุดพักคอยที่กำหนดเพื่อให้พยาบาลติดต่อได้สะดวก</li>
                    <li>งดใช้เสียงดังบริเวณหน้าห้องผ่าตัด</li>
                    <li>สามารถติดตามสถานะผ่านแอปพลิเคชันนี้ได้ตลอดเวลา</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
