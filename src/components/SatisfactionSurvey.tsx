import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ClipboardCheck, Star, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SatisfactionSurvey() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate('/'), 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">ขอบคุณสำหรับความคิดเห็น!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">ข้อมูลของคุณมีค่าอย่างยิ่งในการพัฒนาการบริการของเราให้ดียิ่งขึ้น</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
          >
            กลับหน้าหลัก
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors font-medium"
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
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">แบบประเมินความพึงพอใจ</h1>
                <p className="text-slate-500">ร่วมแสดงความคิดเห็นเพื่อพัฒนาการบริการของเรา</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-slate-700 font-bold mb-4">ความพึงพอใจโดยรวมในการใช้บริการ</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-all transform hover:scale-110"
                    >
                      <Star 
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating) 
                            ? 'fill-rose-400 text-rose-400' 
                            : 'text-slate-200'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-slate-700 font-bold">ข้อเสนอแนะเพิ่มเติม</label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-700 placeholder:text-slate-400"
                  placeholder="พิมพ์ข้อเสนอแนะของคุณที่นี่..."
                />
              </div>

              <button 
                type="submit"
                disabled={rating === 0}
                className={`w-full py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg ${
                  rating > 0 
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-100' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                ส่งแบบประเมิน
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
