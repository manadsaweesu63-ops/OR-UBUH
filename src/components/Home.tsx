import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  BookOpen, 
  Megaphone, 
  Lock, 
  ChevronRight, 
  Heart, 
  Calendar, 
  ClipboardCheck, 
  HelpCircle,
  Stethoscope,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const isStaff = localStorage.getItem('isStaff') === 'true';

  const features = [
    {
      title: 'ตารางออกตรวจศัลยแพทย์',
      desc: 'ตรวจสอบวันและเวลาออกตรวจของศัลยแพทย์',
      icon: Stethoscope,
      color: 'bg-indigo-50 text-indigo-500',
      path: '/doctors'
    },
    {
      title: 'ติดตามสถานะการผ่าตัด',
      desc: 'ตรวจสอบสถานะการผ่าตัดแบบเรียลไทม์สำหรับญาติผู้ป่วย',
      icon: Activity,
      color: 'bg-emerald-500 text-white',
      path: '/status'
    },
    {
      title: 'ข่าวประชาสัมพันธ์',
      desc: 'ประกาศและข่าวสารล่าสุดจากเรา',
      icon: Megaphone,
      color: 'bg-amber-50 text-amber-500',
      path: '/pr'
    },
    {
      title: 'บทความทางการแพทย์',
      desc: 'ความรู้ทางการแพทย์เกี่ยวกับการผ่าตัด',
      icon: BookOpen,
      color: 'bg-purple-50 text-purple-500',
      path: '/articles'
    },
    {
      title: 'แบบประเมินความพึงพอใจ',
      desc: 'ร่วมแสดงความคิดเห็นเพื่อพัฒนาการบริการ',
      icon: ClipboardCheck,
      color: 'bg-rose-50 text-rose-500',
      path: '/survey'
    },
    {
      title: 'คำถามที่พบบ่อย (FAQ)',
      desc: 'รวบรวมคำถามที่ผู้รับบริการมักสงสัย',
      icon: HelpCircle,
      color: 'bg-slate-100 text-slate-500',
      path: '/faq'
    }
  ];

  return (
    <div className="min-h-screen bg-emerald-50/40">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="OR UBUH Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to UBU logo if local logo.png is not found
                  (e.target as HTMLImageElement).src = "https://www.ubu.ac.th/images/logo_ubu.png";
                }}
              />
            </div>
            <span className="font-bold text-slate-900 hidden sm:inline-block">OR UBUH</span>
          </div>
          
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-sm font-medium"
          >
            {isStaff ? (
              <>
                <UserCircle className="w-4 h-4" />
                <span>ระบบเจ้าหน้าที่</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>สำหรับเจ้าหน้าที่</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white/60 pt-20 pb-24 border-b border-emerald-100/50">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl opacity-50" />
        <div className="max-w-5xl mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 leading-tight">
              กลุ่มงานห้องผ่าตัดและวิสัญญี <br />
              <span className="text-olive-dark">โรงพยาบาลมหาวิทยาลัยอุบลราชธานี</span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              มุ่งเน้นความเป็นเลิศด้านศัลยกรรมและการระงับความรู้สึก <br className="hidden md:block" />
              ด้วยมาตรฐานความปลอดภัยระดับสากล เพื่อสุขภาวะที่ดีของประชาชน
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex flex-wrap justify-center gap-5">
          {features.map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(item.path)}
              className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-left hover:shadow-xl hover:border-blue-100 transition-all flex flex-col h-auto w-full md:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.25rem)] min-h-[180px]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", item.color)}>
                  <item.icon className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-grow">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 กลุ่มงานห้องผ่าตัดและวิสัญญี โรงพยาบาลมหาวิทยาลัยอุบลราชธานี <br />
            วิทยาลัยแพทยศาสตร์และการสาธารณสุข มหาวิทยาลัยอุบลราชธานี
          </p>
        </div>
      </footer>
    </div>
  );
}
