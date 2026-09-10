import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Copy,
  Check,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  generatePromptPayPayload,
  getPromptPayQrImageUrl,
  getPromptPayIoUrl,
  sanitizePromptPayId,
} from '../../lib/promptPay';

interface PromptPayQRCardProps {
  amount: number;
  promptPayId: string;
  merchantName: string;
  refNo: string;
  onRefNoChange: (val: string) => void;
  onSimulateSuccess?: () => void;
  isVerified?: boolean;
}

export const PromptPayQRCard: React.FC<PromptPayQRCardProps> = ({
  amount,
  promptPayId,
  merchantName,
  refNo,
  onRefNoChange,
  onSimulateSuccess,
  isVerified = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [useBackupApi, setUseBackupApi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [simulatedPaid, setSimulatedPaid] = useState(isVerified);

  const payload = generatePromptPayPayload(promptPayId, amount);
  const qrImageUrl = useBackupApi
    ? getPromptPayIoUrl(promptPayId, amount)
    : getPromptPayQrImageUrl(promptPayId, amount);

  const sanitized = sanitizePromptPayId(promptPayId);
  const formattedPromptPayId =
    sanitized.type === 'taxId'
      ? `${promptPayId.slice(0, 3)}-${promptPayId.slice(3, 6)}-${promptPayId.slice(
          6,
          9
        )}-${promptPayId.slice(9)}`
      : `${promptPayId.slice(0, 3)}-${promptPayId.slice(3, 6)}-${promptPayId.slice(6)}`;

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const handleCopyPayload = () => {
    if (payload) {
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = () => {
    const slipId = `SLIP-PP-${Date.now().toString().slice(-6)}`;
    onRefNoChange(slipId);
    setSimulatedPaid(true);
    if (onSimulateSuccess) {
      onSimulateSuccess();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl border border-slate-300 shadow-lg overflow-hidden text-slate-800">
      {/* Official Thai QR Payment Style Header Bar */}
      <div className="bg-[#003b70] text-white p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-black text-amber-300 text-xs">
            THAI
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider leading-none text-white">
              THAI QR PAYMENT
            </div>
            <div className="text-[9px] text-sky-200 font-medium">พร้อมเพย์ (PromptPay)</div>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-white/10 px-2 py-1 rounded-md text-[10px] font-mono text-sky-100">
          <Clock className="w-3 h-3 text-amber-300" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Main Merchant & QR Container */}
      <div className="p-4 text-center space-y-3">
        {/* Merchant Info */}
        <div className="border-b border-slate-100 pb-2">
          <h4 className="font-extrabold text-sm text-slate-900">{merchantName}</h4>
          <p className="text-[11px] text-slate-500 font-mono">
            {sanitized.type === 'taxId' ? 'เลขประจำตัวผู้เสียภาษี:' : 'เบอร์โทรศัพท์พร้อมเพย์:'}{' '}
            <span className="font-bold text-slate-800">{formattedPromptPayId}</span>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative inline-block bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-inner group">
          {simulatedPaid ? (
            <div className="w-48 h-48 bg-emerald-50 rounded-xl border border-emerald-300 flex flex-col items-center justify-center p-3 text-emerald-800 space-y-2">
              <div className="p-3 bg-emerald-600 text-white rounded-full shadow-md animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="font-bold text-xs">ชำระเงินสำเร็จแล้ว!</span>
              <span className="text-[10px] text-emerald-600 font-mono font-semibold">
                Ref: {refNo}
              </span>
            </div>
          ) : (
            <div className="relative">
              <img
                src={qrImageUrl}
                alt="PromptPay Thai QR Code"
                className="w-48 h-48 object-contain mx-auto rounded-lg"
                onError={() => setUseBackupApi(true)}
              />

              {/* PromptPay Center Logo Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white p-1 rounded-lg shadow-md border border-slate-200 flex items-center justify-center">
                  <div className="bg-[#003b70] w-full h-full rounded flex items-center justify-center text-[10px] font-extrabold text-white">
                    PP
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payable Amount Highlight */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center px-4">
          <span className="text-xs font-semibold text-slate-600">จำนวนเงินที่ต้องสแกน:</span>
          <span className="font-mono text-xl font-black text-emerald-700">
            ฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px]">
          {simulatedPaid ? (
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold flex items-center space-x-1 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ยืนยันยอดเงินเรียบร้อยแล้ว</span>
            </span>
          ) : (
            <span className="text-slate-500 flex items-center space-x-1">
              <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
              <span>รอรับการสแกนจากแอปพลิเคชันธนาคาร...</span>
            </span>
          )}
        </div>

        {/* Ref No input */}
        <div className="space-y-1 text-left pt-1">
          <label className="text-[11px] font-bold text-slate-700">
            หมายเลขอ้างอิงสลิป / Ref Slip ID:
          </label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => onRefNoChange(e.target.value)}
            placeholder="เช่น SLIP-882190 หรือ กรอกเลขอ้างอิงสลิป"
            className="w-full bg-slate-50 text-slate-900 text-xs font-mono p-2 rounded-xl border border-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopyPayload}
            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 border border-slate-200 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>คัดลอก Payload</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSimulatePayment}
            className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>จำลองสแกนจ่าย</span>
          </button>
        </div>
      </div>
    </div>
  );
};
