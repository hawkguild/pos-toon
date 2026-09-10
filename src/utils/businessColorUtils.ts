export interface ColorThemeOption {
  id: string;
  name: string;
  dotBg: string;
  activeBg: string;
  borderActive: string;
  textActive: string;
  ring: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const BUSINESS_COLORS: Record<string, ColorThemeOption> = {
  emerald: {
    id: 'emerald',
    name: 'เขียวมรกต (Emerald)',
    dotBg: 'bg-emerald-500',
    activeBg: 'bg-emerald-50',
    borderActive: 'border-emerald-400',
    textActive: 'text-emerald-900',
    ring: 'ring-emerald-400/30',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
  },
  blue: {
    id: 'blue',
    name: 'น้ำเงินฟ้า (Blue)',
    dotBg: 'bg-blue-500',
    activeBg: 'bg-blue-50',
    borderActive: 'border-blue-400',
    textActive: 'text-blue-900',
    ring: 'ring-blue-400/30',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
  },
  amber: {
    id: 'amber',
    name: 'ส้มอำพัน (Amber)',
    dotBg: 'bg-amber-500',
    activeBg: 'bg-amber-50',
    borderActive: 'border-amber-400',
    textActive: 'text-amber-900',
    ring: 'ring-amber-400/30',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  purple: {
    id: 'purple',
    name: 'ม่วงลาเวนเดอร์ (Purple)',
    dotBg: 'bg-purple-500',
    activeBg: 'bg-purple-50',
    borderActive: 'border-purple-400',
    textActive: 'text-purple-900',
    ring: 'ring-purple-400/30',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
  },
  rose: {
    id: 'rose',
    name: 'ชมพูกุหลาบ (Rose)',
    dotBg: 'bg-rose-500',
    activeBg: 'bg-rose-50',
    borderActive: 'border-rose-400',
    textActive: 'text-rose-900',
    ring: 'ring-rose-400/30',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
  },
  teal: {
    id: 'teal',
    name: 'เขียวพฤกษา (Teal)',
    dotBg: 'bg-teal-500',
    activeBg: 'bg-teal-50',
    borderActive: 'border-teal-400',
    textActive: 'text-teal-900',
    ring: 'ring-teal-400/30',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
  },
  indigo: {
    id: 'indigo',
    name: 'ครามอินดิโก้ (Indigo)',
    dotBg: 'bg-indigo-500',
    activeBg: 'bg-indigo-50',
    borderActive: 'border-indigo-400',
    textActive: 'text-indigo-900',
    ring: 'ring-indigo-400/30',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
  },
  orange: {
    id: 'orange',
    name: 'ส้มอิฐ (Orange)',
    dotBg: 'bg-orange-500',
    activeBg: 'bg-orange-50',
    borderActive: 'border-orange-400',
    textActive: 'text-orange-900',
    ring: 'ring-orange-400/30',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
  },
  cyan: {
    id: 'cyan',
    name: 'ฟ้าทะเล (Cyan)',
    dotBg: 'bg-cyan-500',
    activeBg: 'bg-cyan-50',
    borderActive: 'border-cyan-400',
    textActive: 'text-cyan-900',
    ring: 'ring-cyan-400/30',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
  },
  slate: {
    id: 'slate',
    name: 'เทาพรีเมียม (Slate)',
    dotBg: 'bg-slate-600',
    activeBg: 'bg-slate-100',
    borderActive: 'border-slate-400',
    textActive: 'text-slate-900',
    ring: 'ring-slate-400/30',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
  },
};

export const getBusinessStyle = (colorName?: string, isSelected: boolean = false) => {
  const c = (colorName && BUSINESS_COLORS[colorName]) ? BUSINESS_COLORS[colorName] : BUSINESS_COLORS.indigo;
  if (isSelected) {
    return `${c.activeBg} ${c.borderActive} ${c.textActive} font-bold ring-2 ${c.ring} shadow-xs`;
  }
  return 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300';
};

export const getBusinessBadgeStyle = (colorName?: string) => {
  const c = (colorName && BUSINESS_COLORS[colorName]) ? BUSINESS_COLORS[colorName] : BUSINESS_COLORS.indigo;
  return `${c.badgeBg} ${c.badgeText} ${c.badgeBorder} border`;
};
