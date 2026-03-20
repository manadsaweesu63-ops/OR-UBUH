import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_FAQS = [
  { id: 1, question: 'ญาติสามารถรอพบแพทย์ได้ที่ไหน?', answer: 'ญาติสามารถรอได้ที่จุดพักคอยหน้าห้องผ่าตัด ชั้น 2 โดยจะมีพยาบาลออกมาแจ้งสถานะเป็นระยะ หรือติดตามผ่านแอปพลิเคชันนี้' },
  { id: 2, question: 'การผ่าตัดใช้เวลานานเท่าไหร่?', answer: 'ระยะเวลาขึ้นอยู่กับประเภทของหัตถการ โดยเฉลี่ยประมาณ 1-3 ชั่วโมง ไม่รวมเวลาเตรียมตัวและพักฟื้น' },
  { id: 3, question: 'หลังผ่าตัดญาติสามารถเข้าเยี่ยมได้เมื่อไหร่?', answer: 'หลังผ่าตัดผู้ป่วยจะพักฟื้นที่ห้อง Recovery Room ประมาณ 1-2 ชั่วโมง เมื่อผู้ป่วยรู้สึกตัวดีและสัญญาณชีพคงที่ พยาบาลจะย้ายผู้ป่วยไปยังหอผู้ป่วยปกติ ซึ่งญาติสามารถเข้าเยี่ยมได้ตามเวลาที่โรงพยาบาลกำหนด' },
  { id: 4, question: 'ต้องเตรียมเอกสารอะไรบ้างในวันผ่าตัด?', answer: 'บัตรประจำตัวประชาชน, บัตรนัดผ่าตัด, และเอกสารยินยอมรับการผ่าตัดที่เซ็นชื่อเรียบร้อยแล้ว' },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-600 transition-colors font-medium"
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
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">คำถามที่พบบ่อย (FAQ)</h1>
                <p className="text-slate-500">รวบรวมคำถามที่ญาติและผู้ป่วยมักสงสัย</p>
              </div>
            </div>

            <div className="space-y-4">
              {MOCK_FAQS.map((faq) => (
                <div key={faq.id} className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden transition-all">
                  <button 
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-100/50 transition-colors"
                  >
                    <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                    {openId === faq.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  <AnimatePresence>
                    {openId === faq.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
