import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Leaf,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = usePOS();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const success = login(username, password);
      setLoading(false);
      if (!success) {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    }, 350);
  };

  return (
    <div className="min-h-full py-8 sm:py-12 bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans selection:bg-red-600 selection:text-white">
      {/* Background Soft Red Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-100/60 to-transparent pointer-events-none blur-3xl" />

      {/* Main Container Card */}
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-rose-100/80 shadow-xl shadow-rose-950/5 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 my-auto">
        
        {/* Left Side: Red/Dark Sleek Brand Hero Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Background Watermarks */}
          <div className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none transform rotate-12">
            <Leaf className="w-52 h-52 text-red-500" />
          </div>
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none transform -rotate-45">
            <Leaf className="w-36 h-36 text-rose-400" />
          </div>

          <div className="space-y-6 relative z-10">
            {/* Logo Badge */}
            <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="text-sm">⛵</span>
              <span>พัฒนาโปรแกรมโดย ที พกท 81</span>
              <span className="text-sm">⛵</span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                ระบบจัดการร้านค้า <br />
                <span className="text-red-400 font-extrabold">ครบวงจร & สมุนไพร</span>
              </h2>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                ระบบบริหารหน้าร้าน คุมสต็อกชั่งน้ำหนัก ชำระเงิน PromptPay และรองรับข้อกำหนดกฎหมาย
              </p>
            </div>

            {/* Simple Clean Highlights with Cannabis Leaf Icons */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="p-1 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 shrink-0">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <span>ขายหน้าร้าน พิมพ์ใบเสร็จรวดเร็ว</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="p-1 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 shrink-0">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <span>คุมสต็อกสินค้า ละเอียดระดับกรัม</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="p-1 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 shrink-0">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <span>ระบบรายงานและ Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>Cloud Realtime Sync</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">v2026.8</span>
          </div>
        </div>

        {/* Right Side: Clean Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                เข้าสู่ระบบ
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                ระบุชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งานระบบ
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-center space-x-2 animate-shake">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ชื่อผู้ใช้ (Username)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น admin"
                    className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/15 font-medium transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ระบุรหัสผ่าน"
                    className="w-full bg-slate-50 text-slate-900 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/15 font-mono transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center space-x-2 text-xs sm:text-sm transition cursor-pointer"
              >
                {loading ? (
                  <span className="animate-pulse">กำลังตรวจสอบ...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>เข้าสู่ระบบ</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs font-bold text-slate-400 flex items-center justify-center space-x-1.5">
            <span>⛵</span>
            <span>พัฒนาโปรแกรมโดย ที พกท 81</span>
            <span>⛵</span>
          </div>
        </div>
      </div>
    </div>
  );
};

