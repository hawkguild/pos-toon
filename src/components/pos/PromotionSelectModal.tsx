import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Promotion, AppliedPromotion } from '../../types';
import {
  Tag,
  Sparkles,
  Check,
  Plus,
  X,
  Zap,
  Gift,
  Percent,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface PromotionSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromotionSelectModal: React.FC<PromotionSelectModalProps> = ({ isOpen, onClose }) => {
  const {
    promotions,
    cart,
    appliedPromotions,
    selectedPromoCodes,
    applyPromoCode,
    removePromoCode,
    upsellSuggestions,
  } = usePOS();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const res = applyPromoCode(promoInput.trim());
    if (res.success) {
      setPromoMessage({ text: res.message, isError: false });
      setPromoInput('');
    } else {
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  const activePromotions = promotions.filter((p) => p.enabled);

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'teal':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl flex flex-col space-y-4 max-h-[85vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">โปรโมชั่นและส่วนลด (Promotions)</h3>
              <p className="text-xs text-slate-500">เลือกโปรโมชั่นพิเศษ หรือกรอกโค้ดส่วนลดสำหรับบิลนี้</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Promo Code Input Form */}
        <form onSubmit={handleApplyCode} className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 block">กรอกโค้ดโปรโมชั่น (Promo Code):</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="เช่น 3FOR100, BUY2GET1..."
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value.toUpperCase());
                setPromoMessage(null);
              }}
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition cursor-pointer"
            >
              ใช้โค้ด
            </button>
          </div>

          {promoMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                promoMessage.isError
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {promoMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{promoMessage.text}</span>
            </div>
          )}
        </form>

        {/* Active Applied Promotions in Cart */}
        {appliedPromotions.length > 0 && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-950 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>โปรโมชั่นที่ได้รับในบิลนี้ ({appliedPromotions.length} รายการ):</span>
              </span>
              <span className="text-xs font-black text-emerald-700">
                ประหยัด ฿{appliedPromotions.reduce((sum, p) => sum + p.discountAmount, 0).toLocaleString()}
              </span>
            </div>

            <div className="space-y-1.5">
              {appliedPromotions.map((ap) => (
                <div
                  key={ap.promoId}
                  className="p-2 bg-white rounded-xl border border-emerald-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{ap.promoName}</span>
                    {ap.promoCode && (
                      <span className="text-[10px] bg-slate-100 font-mono px-1.5 py-0.5 rounded text-slate-600">
                        {ap.promoCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-emerald-600">-฿{ap.discountAmount.toLocaleString()}</span>
                    {ap.promoCode && selectedPromoCodes.includes(ap.promoCode) && (
                      <button
                        onClick={() => removePromoCode(ap.promoCode!)}
                        className="text-slate-400 hover:text-rose-600 text-xs p-1"
                        title="ยกเลิกโค้ดนี้"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upsell / Opportunity Suggestions */}
        {upsellSuggestions.length > 0 && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <span className="text-xs font-extrabold text-amber-950 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>โอกาสรับโปรโมชั่นเพิ่ม (คำแนะนำสำหรับพนักงาน):</span>
            </span>
            <div className="space-y-1">
              {upsellSuggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white/90 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-center justify-between"
                >
                  <span>{s.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Available Promotions in Store */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-extrabold text-slate-700 block">โปรโมชั่นทั้งหมดประจำร้าน:</span>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {activePromotions.map((p) => {
              const isApplied = appliedPromotions.some((ap) => ap.promoId === p.id);
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                    isApplied
                      ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border ${getBadgeColor(
                        p.badgeColor
                      )}`}
                    >
                      {p.icon || '🏷️'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-900">{p.name}</span>
                        {p.code && (
                          <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded">
                            {p.code}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                    </div>
                  </div>

                  <div>
                    {isApplied ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>ได้รับแล้ว</span>
                      </span>
                    ) : p.code && !p.isAutoApply ? (
                      <button
                        onClick={() => applyPromoCode(p.code!)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl transition cursor-pointer"
                      >
                        กดใช้โค้ด
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-medium text-[10px] rounded-md">
                        อัตโนมัติ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
