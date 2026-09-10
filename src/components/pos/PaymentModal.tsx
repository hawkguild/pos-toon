import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod, PaymentBreakdown, Customer, SaleOrder } from '../../types';
import { calculateMembershipTier, calculatePointsEarned } from '../../lib/loyalty';
import { PromptPayQRCard } from './PromptPayQRCard';
import {
  DollarSign,
  QrCode,
  CreditCard,
  Building,
  Layers,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Keyboard,
} from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: (order: SaleOrder) => void;
  customer: Customer | null;
  patientMedicalNote?: string;
  prescriptionRef?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  onClose,
  onSuccess,
  customer,
  patientMedicalNote,
  prescriptionRef,
}) => {
  const { cart, shopSettings, completeCheckout } = usePOS();

  // Order Details
  const subtotal = (cart || []).reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalDiscount = (cart || []).reduce((acc, item) => acc + item.discount, 0);
  const netTotal = (cart || []).reduce((acc, item) => acc + item.subtotal, 0);

  // States
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('cash');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [tableNo, setTableNo] = useState('T-01');

  // Cash Calculation
  const [cashReceived, setCashReceived] = useState<number>(netTotal);
  const changeAmount = Math.max(0, cashReceived - netTotal);

  // Other Method Details
  const [refNo, setRefNo] = useState('');

  // Split Payment
  const [splitCash, setSplitCash] = useState<number>(Math.floor(netTotal / 2));
  const [splitPromptPay, setSplitPromptPay] = useState<number>(netTotal - Math.floor(netTotal / 2));

  const handleConfirmPayment = () => {
    let payments: PaymentBreakdown[] = [];

    if (activeMethod === 'cash') {
      if (cashReceived < netTotal) {
        alert('จำนวนเงินสดที่รับมาไม่เพียงพอ');
        return;
      }
      payments.push({
        method: 'cash',
        amount: netTotal,
        change: changeAmount,
      });
    } else if (activeMethod === 'promptpay' || activeMethod === 'transfer' || activeMethod === 'card') {
      payments.push({
        method: activeMethod,
        amount: netTotal,
        referenceNo: refNo || `REF-${Date.now().toString().slice(-6)}`,
      });
    } else if (activeMethod === 'split') {
      if (splitCash + splitPromptPay < netTotal) {
        alert('ยอดชำระรวมแบบแบ่งจ่ายไม่ครบจำนวน');
        return;
      }
      payments.push({ method: 'cash', amount: splitCash });
      payments.push({
        method: 'promptpay',
        amount: splitPromptPay,
        referenceNo: refNo || `SPLIT-${Date.now().toString().slice(-6)}`,
      });
    }

    const order = completeCheckout(
      payments,
      orderType,
      orderType === 'dine_in' ? tableNo : undefined,
      customer,
      patientMedicalNote,
      prescriptionRef
    );

    if (order) {
      onSuccess(order);
    }
  };

  // Keyboard shortcut listener inside Payment Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape -> close
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Enter or Ctrl+Enter -> Confirm Payment
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConfirmPayment();
        return;
      }

      // Alt + 1..5 -> Switch payment methods
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveMethod('cash');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveMethod('promptpay');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveMethod('transfer');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveMethod('card');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveMethod('split');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleConfirmPayment]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-bold text-lg text-slate-900">ชำระเงิน (Checkout Gateway)</h3>
              <p className="text-xs text-slate-500">
                เลือกประเภทออเดอร์เเละช่องทางการชำระเงิน
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold">
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto my-4 space-y-5 pr-1 text-xs">
          {/* Order Type & Table Selection */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <label className="block font-semibold text-slate-700">
              ประเภทการสั่งซื้อ (Order Type):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`py-2 rounded-xl font-bold border transition ${
                  orderType === 'dine_in'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🍽️ ทานที่ร้าน (Dine-in)
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`py-2 rounded-xl font-bold border transition ${
                  orderType === 'takeaway'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🛍️ กลับบ้าน (Takeaway)
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`py-2 rounded-xl font-bold border transition ${
                  orderType === 'delivery'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🛵 เดลิเวอรี่ (Delivery)
              </button>
            </div>

            {orderType === 'dine_in' && (
              <div className="pt-2 flex items-center space-x-2">
                <span className="text-slate-600 font-medium">หมายเลขโต๊ะ:</span>
                <input
                  type="text"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  className="bg-white text-slate-800 px-3 py-1 rounded border border-slate-300 w-24 font-bold"
                />
              </div>
            )}
          </div>

          {/* Net Amount Banner */}
          <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 flex justify-between items-center">
            <div>
              <span className="text-slate-600 font-medium">ยอดที่ต้องชำระสุทธิ:</span>
              <p className="text-xs text-emerald-800 font-semibold">
                {customer ? `ลูกค้า: ${customer.name}` : 'ลูกค้าทั่วไป'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-emerald-800 font-mono">
                ฿{netTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Loyalty Points Earning Preview */}
          {customer && (
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-lg">⭐</span>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-amber-950">{customer.name}</span>
                    <span className="bg-amber-200/80 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      {customer.membershipTier || calculateMembershipTier(customer.totalSpend || 0)} Member
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    แต้มคงเหลือปัจจุบัน: <span className="font-bold font-mono">{customer.points || 0}</span> แต้ม
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-700 block">จะได้รับแต้มบิลนี้</span>
                <span className="font-mono font-black text-amber-900 text-sm">
                  +{calculatePointsEarned(netTotal, customer.membershipTier || calculateMembershipTier(customer.totalSpend || 0))} แต้ม
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => setActiveMethod('cash')}
              className={`p-2.5 rounded-xl border font-bold flex flex-col items-center space-y-1 transition relative ${
                activeMethod === 'cash'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-300 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>เงินสด</span>
              <span className="text-[9px] font-mono opacity-60">Alt+1</span>
            </button>

            <button
              onClick={() => setActiveMethod('promptpay')}
              className={`p-2.5 rounded-xl border font-bold flex flex-col items-center space-y-1 transition relative ${
                activeMethod === 'promptpay'
                  ? 'bg-blue-50 border-blue-300 text-blue-800 ring-1 ring-blue-300 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>พร้อมเพย์</span>
              <span className="text-[9px] font-mono opacity-60">Alt+2</span>
            </button>

            <button
              onClick={() => setActiveMethod('transfer')}
              className={`p-2.5 rounded-xl border font-bold flex flex-col items-center space-y-1 transition relative ${
                activeMethod === 'transfer'
                  ? 'bg-purple-50 border-purple-300 text-purple-800 ring-1 ring-purple-300 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building className="w-5 h-5 text-purple-600" />
              <span>โอนเงิน</span>
              <span className="text-[9px] font-mono opacity-60">Alt+3</span>
            </button>

            <button
              onClick={() => setActiveMethod('card')}
              className={`p-2.5 rounded-xl border font-bold flex flex-col items-center space-y-1 transition relative ${
                activeMethod === 'card'
                  ? 'bg-amber-50 border-amber-300 text-amber-800 ring-1 ring-amber-300 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5 text-amber-600" />
              <span>บัตรเครดิต</span>
              <span className="text-[9px] font-mono opacity-60">Alt+4</span>
            </button>

            <button
              onClick={() => setActiveMethod('split')}
              className={`p-2.5 rounded-xl border font-bold flex flex-col items-center space-y-1 transition relative ${
                activeMethod === 'split'
                  ? 'bg-orange-50 border-orange-300 text-orange-800 ring-1 ring-orange-300 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-5 h-5 text-orange-600" />
              <span>แบ่งชำระ</span>
              <span className="text-[9px] font-mono opacity-60">Alt+5</span>
            </button>
          </div>

          {/* Payment Details Container */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            {/* CASH PAYMENT UI */}
            {activeMethod === 'cash' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-800">
                    จำนวนเงินสดที่รับมา (Cash Received):
                  </label>
                  <span className="text-slate-500 text-[11px] font-medium">
                    พอดีราคา: ฿{netTotal.toLocaleString()}
                  </span>
                </div>

                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white text-slate-900 font-mono text-2xl font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />

                {/* Quick Cash Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {[netTotal, 100, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCashReceived(preset)}
                      className="py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 font-mono transition"
                    >
                      ฿{preset.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Change Calculation Display */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm mt-3 shadow-xs">
                  <span className="font-bold text-slate-700">เงินทอน (Change):</span>
                  <span
                    className={`font-mono font-extrabold text-xl ${
                      cashReceived < netTotal ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    ฿{changeAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* PROMPTPAY QR UI */}
            {activeMethod === 'promptpay' && (
              <div className="py-2">
                <PromptPayQRCard
                  amount={netTotal}
                  promptPayId={shopSettings.promptPayId || shopSettings.taxId || '0105568192083'}
                  merchantName={shopSettings.promptPayName || shopSettings.shopName}
                  refNo={refNo}
                  onRefNoChange={setRefNo}
                />
              </div>
            )}

            {/* BANK TRANSFER UI */}
            {activeMethod === 'transfer' && (
              <div className="space-y-3">
                <p className="font-semibold text-slate-800">โอนผ่านบัญชีธนาคารร้าน:</p>
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700 shadow-xs">
                  <p className="font-bold text-emerald-700">ธนาคารกสิกรไทย (KBANK)</p>
                  <p className="font-mono">เลขบัญชี: 128-8-99900-1</p>
                  <p>ชื่อบัญชี: {shopSettings.promptPayName || shopSettings.shopName}</p>
                </div>
                <input
                  type="text"
                  placeholder="หมายเลขอ้างอิงการโอน / Ref ID"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            )}

            {/* CREDIT CARD UI */}
            {activeMethod === 'card' && (
              <div className="space-y-3">
                <p className="font-semibold text-slate-800">รูดบัตรผ่านเครื่อง EDC:</p>
                <input
                  type="text"
                  placeholder="รหัสอนุมัติบัตร EDC (Approval Code e.g. 881023)"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            )}

            {/* SPLIT PAYMENT UI */}
            {activeMethod === 'split' && (
              <div className="space-y-4">
                <p className="font-semibold text-slate-800">แบ่งชำระหลายช่องทาง:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 text-[10px] font-medium">ชำระเงินสด (฿):</label>
                    <input
                      type="number"
                      value={splitCash}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSplitCash(val);
                        setSplitPromptPay(Math.max(0, netTotal - val));
                      }}
                      className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] font-medium">ชำระสแกน QR (฿):</label>
                    <input
                      type="number"
                      value={splitPromptPay}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSplitPromptPay(val);
                      }}
                      className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>
                </div>

                {splitPromptPay > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-700 mb-2 text-center">
                      สแกนชำระเงินส่วน QR พร้อมเพย์ (฿{splitPromptPay.toLocaleString()}):
                    </p>
                    <PromptPayQRCard
                      amount={splitPromptPay}
                      promptPayId={shopSettings.promptPayId || shopSettings.taxId || '0105568192083'}
                      merchantName={shopSettings.promptPayName || shopSettings.shopName}
                      refNo={refNo}
                      onRefNoChange={setRefNo}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span>กด [Esc] ยกเลิก, [Alt+1..5] เลือกช่องทาง, [Ctrl+Enter] ยืนยัน</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition"
            >
              ยกเลิก (Esc)
            </button>
            <button
              onClick={handleConfirmPayment}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันการชำระเงิน</span>
              <span className="text-[10px] font-mono bg-emerald-700 text-emerald-100 border border-emerald-500 px-1.5 py-0.5 rounded">
                Ctrl+↵
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
