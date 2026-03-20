import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_ARTICLES = [
  { id: 1, title: 'การเตรียมตัวก่อนผ่าตัด: สิ่งที่ผู้ป่วยและญาติควรรู้', category: 'การเตรียมตัว', time: '5 นาที', image: 'https://picsum.photos/seed/surgery1/800/400' },
  { id: 2, title: 'การดูแลแผลผ่าตัดให้หายเร็วและไม่เป็นแผลเป็น', category: 'การดูแลหลังผ่าตัด', time: '7 นาที', image: 'https://picsum.photos/seed/surgery2/800/400' },
  { id: 3, title: 'อาหารที่ควรหลีกเลี่ยงก่อนการระงับความรู้สึก', category: 'วิสัญญีวิทยา', time: '4 นาที', image: 'https://picsum.photos/seed/surgery3/800/400' },
];

export default function MedicalArticles() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors font-medium"
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
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">บทความทางการแพทย์</h1>
                <p className="text-slate-500">ความรู้สุขภาพและการเตรียมตัวก่อน-หลังผ่าตัด</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_ARTICLES.map((article) => (
                <div key={article.id} className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden hover:border-purple-200 transition-all group cursor-pointer">
                  <div className="h-40 overflow-hidden relative">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-purple-600">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                      <Clock className="w-3 h-3" />
                      <span>ใช้เวลาอ่าน {article.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors leading-tight">{article.title}</h3>
                    <div className="flex items-center gap-1 text-purple-600 text-sm font-bold">
                      อ่านบทความ
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
