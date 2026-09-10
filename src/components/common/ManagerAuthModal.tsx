import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { User } from '../../types';
import { ShieldCheck, ShieldAlert, Lock, Key, X, Check, ArrowRight, UserCheck } from 'lucide-react';

interface ManagerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authorizedManager: User) => void;
  actionTitle?: string;
  actionDescription?: string;
  requiredRoleLabel?: string;
}

export const ManagerAuthModal: React.FC<ManagerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'ขออนุมัติจากผู้จัดการร้าน (Manager Authorization)',
  actionDescription = 'การดำเนินการนี้จำกัดเฉพาะผู้จัดการร้านหรือผู้ดูแลระบบ กรุณากรอกรหัส PIN ผู้จัดการเพื่ออนุมัติ',
  requiredRoleLabel = 'ผู้จัดการร้าน (Manager) หรือ Admin',
}) => {
  const { users } = usePOS();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  if (!isOpen) return null;

  const managers = (users || []).filter(
    (u) => u.role === 'super_admin' || u.role === 'manager'
  );

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setErrorMsg('กรุณากรอกรหัส PIN ผู้จัดการ');
      return;
    }

    // 1. If a specific manager was selected
    if (selectedManagerId) {
      const mgr = managers.find((m) => m.id === selectedManagerId);
      if (mgr && mgr.pin === pin) {
        onSuccess(mgr);
        onClose();
        return;
      }
    } else {
      // 2. Check all managers in the system
      const matchedMgr = managers.find((m) => m.pin === pin);
      if (matchedMgr) {
        onSuccess(matchedMgr);
        onClose();
        return;
      }
    }

    setErrorMsg('รหัส PIN ผู้จัดการไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    setPin('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  {actionTitle}
                </h3>
              </div>
              <span className="inline-block mt-0.5 text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                🔒 {requiredRoleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action description note */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>คำเตือนด้านความปลอดภัย & กฎระเบียบร้าน</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {actionDescription}
          </p>
        </div>

        {/* Manager Select (Optional) */}
        {managers.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              เลือกผู้จัดการผู้อนุมัติ (Authorized Manager):
            </label>
            <select
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-slate-800"
            >
              <option value="">-- ตรวจสอบจาก PIN ผู้จัดการทุกคน --</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role === 'super_admin' ? 'Super Admin' : 'ผู้จัดการร้าน'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PIN Display */}
        <div className="space-y-2 text-center">
          <label className="block text-xs font-bold text-slate-700">
            กรอกรหัส PIN ผู้จัดการ (Manager PIN)
          </label>
          <div className="flex items-center justify-center space-x-3 py-3 bg-slate-100 rounded-2xl border border-slate-200">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  pin.length > idx
                    ? 'bg-amber-600 scale-110 shadow-xs'
                    : 'bg-slate-300 border border-slate-400'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-bold animate-shake">
              ⚠️ {errorMsg}
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="py-3 bg-slate-50 hover:bg-amber-50 active:bg-amber-100 text-slate-800 font-extrabold text-base rounded-xl border border-slate-200 hover:border-amber-300 transition shadow-2xs cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
          >
            ล้าง
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3 bg-slate-50 hover:bg-amber-50 text-slate-800 font-extrabold text-base rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
          >
            ⌫ ลบ
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={pin.length < 4}
            className={`flex-1 py-2.5 font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              pin.length >= 4
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ยืนยันอนุมัติ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
