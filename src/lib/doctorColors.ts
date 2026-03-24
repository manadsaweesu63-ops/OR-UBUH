
export const DEFAULT_COLOR = { 
  bg: 'bg-slate-50', 
  text: 'text-slate-700', 
  border: 'border-slate-200', 
  bar: 'bg-slate-500',
  shadow: 'shadow-slate-100'
};

export const DOCTOR_COLORS: { [key: string]: typeof DEFAULT_COLOR } = {
  'ดิน': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500', shadow: 'shadow-orange-100' },
  'ภานุวัตร': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', bar: 'bg-amber-600', shadow: 'shadow-amber-100' },
  'เกริก': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500', shadow: 'shadow-red-100' },
  'สิทธิชัย': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', bar: 'bg-green-500', shadow: 'shadow-green-100' },
  'วัฒนา': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', bar: 'bg-sky-500', shadow: 'shadow-sky-100' },
  'นวรัตน์': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', bar: 'bg-pink-500', shadow: 'shadow-pink-100' },
};

export const getDoctorColor = (name: string) => {
  if (!name || name === 'all') return DEFAULT_COLOR;
  
  // Try exact match
  if (DOCTOR_COLORS[name]) return DOCTOR_COLORS[name];
  
  // Try partial match (in case of titles like "นพ. ดิน")
  for (const key in DOCTOR_COLORS) {
    if (name.includes(key)) return DOCTOR_COLORS[key];
  }

  // Fallback to hash-based color if not found in predefined list
  const PASTEL_COLORS = [
    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500', shadow: 'shadow-blue-100' },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', shadow: 'shadow-emerald-100' },
    { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500', shadow: 'shadow-amber-100' },
    { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500', shadow: 'shadow-rose-100' },
    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', bar: 'bg-indigo-500', shadow: 'shadow-indigo-100' },
    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', bar: 'bg-purple-500', shadow: 'shadow-purple-100' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', bar: 'bg-cyan-500', shadow: 'shadow-cyan-100' },
    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500', shadow: 'shadow-orange-100' },
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', bar: 'bg-teal-500', shadow: 'shadow-teal-100' },
    { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', bar: 'bg-pink-500', shadow: 'shadow-pink-100' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
};
