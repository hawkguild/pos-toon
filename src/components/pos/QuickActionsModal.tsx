import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  Zap,
  ChefHat,
  RefreshCw,
  DollarSign,
  History,
  Tag,
  Plus,
  Camera,
  QrCode,
  Trash2,
  Keyboard,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  Receipt,
  Sparkles,
  Volume2,
  VolumeX,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKitchenTab?: () => void;
  onOpenOrderHistory: () => void;
  onOpenPromotionModal: () => void;
  onOpenAddMenu: () => void;
  onOpenCameraScanner: () => void;
  onOpenQuickQr: () => void;
  onOpenShortcuts: () => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onOpenOrderHistory,
  onOpenPromotionModal,
  onOpenAddMenu,
  onOpenCameraScanner,
  onOpenQuickQr,
  onOpenShortcuts,
}) => {
  const {
    currentUser,
    users,
    kitchenOrders,
    updateKitchenItemStatus,
    currentShift,
    shifts,
    startShift,
    switchShift,
    closeShift,
    openCashDrawer,
    cart,
    clearCart,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'hub' | 'kitchen' | 'shift'>('hub');
  
  // Kitchen View Sub-states
  const [kitchenStationFilter, setKitchenStationFilter] = useState<'all' | 'kitchen' | 'bar'>('all');
  const [now, setNow] = useState<Date>(new Date());
  const [kitchenSound, setKitchenSound] = useState(true);

  // Shift Switching Sub-states
  const [selectedTargetUserId, setSelectedTargetUserId] = useState<string>('');
  const [targetUserPin, setTargetUserPin] = useState<string>('');
  const [startingFloatInput, setStartingFloatInput] = useState<string>('1000');
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState<string | null>(null);

  // Shift Closing Sub-states
  const [isClosingShiftMode, setIsClosingShiftMode] = useState<boolean>(false);
  const [closingActualCashInput, setClosingActualCashInput] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState<string>('');

  // Cash Drawer Notification
  const [drawerSuccessMsg, setDrawerSuccessMsg] = useState<string | null>(null);

  // Update clock every second for KDS SLA calculation
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Set default target user when users list is available
  useEffect(() => {
    if (users.length > 0 && !selectedTargetUserId) {
      const otherUser = users.find((u) => u.id !== currentUser.id);
      if (otherUser) {
        setSelectedTargetUserId(otherUser.id);
      } else {
        setSelectedTargetUserId(users[0].id);
      }
    }
  }, [users, currentUser, selectedTargetUserId]);

  if (!isOpen) return null;

  // Pending Kitchen Orders
  const pendingOrPrepKitchenOrders = (kitchenOrders || []).filter(
    (o) => o.overallStatus !== 'served'
  );

  // SLA Calculation
  const getOrderSlaDetails = (orderTimestamp: string, targetMins = 15) => {
    const orderTime = new Date(orderTimestamp).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - orderTime) / 1000));
    const targetSeconds = targetMins * 60;
    const remainingSeconds = targetSeconds - elapsedSeconds;

    let alertLevel: 'normal' | 'warning' | 'overdue' = 'normal';
    if (elapsedSeconds >= targetSeconds) alertLevel = 'overdue';
    else if (elapsedSeconds >= targetSeconds * 0.6) alertLevel = 'warning';

    const mins = Math.floor(Math.abs(remainingSeconds) / 60);
    const secs = Math.abs(remainingSeconds) % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return {
      elapsedSeconds,
      remainingSeconds,
      alertLevel,
      formattedCountdown: remainingSeconds < 0 ? `+${formatted}` : formatted,
    };
  };

  const handleOpenCashDrawerTrigger = () => {
    openCashDrawer('เปิดลิ้นชักผ่านเมนูด่วน POS Quick Actions');
    setDrawerSuccessMsg('ส่งสัญญาณเปิดลิ้นชักเก็บเงินเรียบร้อยแล้ว (Open Cash Drawer)');
    setTimeout(() => setDrawerSuccessMsg(null), 3000);
  };

  const handleExecuteSwitchShift = (e: React.FormEvent) => {
    e.preventDefault();
    setSwitchError(null);
    setSwitchSuccess(null);

    if (!selectedTargetUserId) {
      setSwitchError('กรุณาเลือกพนักงานที่ต้องการสลับกะ');
      return;
    }

    if (!targetUserPin.trim()) {
      setSwitchError('กรุณาระบุรหัส PIN 4 หลักของพนักงานผู้รับกะ');
      return;
    }

    const floatNum = parseFloat(startingFloatInput) || 0;
    const res = switchShift(selectedTargetUserId, targetUserPin.trim(), floatNum, shiftNotes.trim());

    if (res.success) {
      setSwitchSuccess(res.message);
      setTargetUserPin('');
      setShiftNotes('');
      setTimeout(() => {
        setSwitchSuccess(null);
        setActiveTab('hub');
      }, 1500);
    } else {
      setSwitchError(res.message);
    }
  };

  const handleExecuteCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const actualCash = closingActualCashInput ? parseFloat(closingActualCashInput) : undefined;
    const res = closeShift(actualCash, closeNotes.trim());
    if (res.success) {
      alert(`ปิดกะ ${res.shift?.shiftNumber} เรียบร้อยแล้ว!`);
      setIsClosingShiftMode(false);
      setClosingActualCashInput('');
      setCloseNotes('');
      setActiveTab('hub');
    }
  };

  const handleExecuteStartNewShift = () => {
    const floatNum = prompt('ระบุเงินทอนเริ่มต้นกะ (บาท):', '1000');
    if (floatNum !== null) {
      const parsedFloat = parseFloat(floatNum) || 0;
      startShift(parsedFloat, 'เปิดกะใหม่ผ่าน Quick Actions');
      alert('เปิดกะใหม่สำเร็จ!');
    }
  };

  return (
    <div
      id="pos-quick-actions-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="pos-quick-actions-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-500/30 text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold">
                  เมนูด่วนหน้าร้าน POS (Quick Actions)
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  F4 / Alt+Q
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ควบคุมคำสั่งด่วน: สลับกะแคชเชียร์, จอครัว KDS, ลิ้นชักเก็บเงิน และเครื่องมือขาย
              </p>
            </div>
          </div>

          <button
            id="close-quick-actions-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center space-x-2">
            <button
              id="quick-tab-hub-btn"
              onClick={() => setActiveTab('hub')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'hub'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>ศูนย์รวมคำสั่งด่วน</span>
            </button>

            <button
              id="quick-tab-kitchen-btn"
              onClick={() => setActiveTab('kitchen')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
                activeTab === 'kitchen'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>จอครัวด่วน KDS</span>
              {pendingOrPrepKitchenOrders.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'kitchen' ? 'bg-white text-orange-700' : 'bg-orange-500 text-white'
                }`}>
                  {pendingOrPrepKitchenOrders.length}
                </span>
              )}
            </button>

            <button
              id="quick-tab-shift-btn"
              onClick={() => setActiveTab('shift')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'shift'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>สลับกะ & แคชเชียร์</span>
              {currentShift && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>

          {/* Current Cashier Badge */}
          <div className="flex items-center space-x-2 text-xs text-slate-600 shrink-0">
            <span className="text-slate-400">ผู้ใช้งานปัจจุบัน:</span>
            <span className="font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <User className="w-3 h-3 text-emerald-600" />
              {currentUser.name}
              <span className="text-[10px] text-slate-500 font-mono">({currentUser.role})</span>
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* Feedback message for cash drawer */}
          {drawerSuccessMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-2xl flex items-center space-x-2.5 animate-fade-in shadow-xs text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{drawerSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: QUICK ACTIONS HUB */}
          {activeTab === 'hub' && (
            <div className="space-y-6">
              {/* Shift Quick Status Card */}
              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {currentShift ? `กะทำงาน: ${currentShift.shiftNumber}` : 'ยังไม่มีกะที่เปิดใช้งาน'}
                        </h4>
                        {currentShift ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Closed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        แคชเชียร์: <span className="font-semibold text-slate-800">{currentUser.name}</span> • เงินทอนเริ่มต้น: ฿{(currentShift?.startingFloatThb || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="quick-switch-shift-btn"
                      onClick={() => setActiveTab('shift')}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>สลับกะแคชเชียร์</span>
                    </button>
                    <button
                      id="quick-open-drawer-btn"
                      onClick={handleOpenCashDrawerTrigger}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="กดเพื่อสั่งเปิดลิ้นชักเก็บเงิน"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>เปิดลิ้นชัก</span>
                    </button>
                  </div>
                </div>

                {/* Shift Summary mini stats */}
                {currentShift && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-1 text-center">
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-medium">ยอดขายรวมในกะ</span>
                      <p className="text-sm font-extrabold text-emerald-700">฿{currentShift.totalSalesThb.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-medium">ยอดเงินสด</span>
                      <p className="text-sm font-bold text-slate-800">฿{currentShift.cashSalesThb.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-medium">พร้อมเพย์ / โอน</span>
                      <p className="text-sm font-bold text-blue-700">฿{currentShift.promptPaySalesThb.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-medium">จำนวนบิลขาย</span>
                      <p className="text-sm font-bold text-slate-800">{currentShift.orderCount} บิล</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  รายการคำสั่งด่วนที่ใช้งานบ่อย (Frequent Actions)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Action 1: Toggle Kitchen Display */}
                  <button
                    id="action-toggle-kitchen-card"
                    onClick={() => setActiveTab('kitchen')}
                    className="group bg-white hover:bg-orange-50/70 border border-slate-200 hover:border-orange-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:scale-105 transition">
                        <ChefHat className="w-5 h-5" />
                      </div>
                      {pendingOrPrepKitchenOrders.length > 0 && (
                        <span className="bg-orange-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                          {pendingOrPrepKitchenOrders.length} ออเดอร์
                        </span>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-orange-800 transition">
                        จอครัวด่วน (KDS Display)
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ดูคิวอาหาร, ควบคุมเวลา SLA, เปลี่ยนสถานะพร้อมเสิร์ฟ
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-orange-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>เปิดจอครัวด่วน</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* Action 2: Switch Shift / Cashier Handover */}
                  <button
                    id="action-switch-shift-card"
                    onClick={() => setActiveTab('shift')}
                    className="group bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                        PIN Guard
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition">
                        สลับกะ & ผลัดเวรแคชเชียร์
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        เปลี่ยนผู้รับผิดชอบกะ, นับเงินทอน, บันทึกการส่งมอบ
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>จัดการผลัดกะ</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* Action 3: Open Cash Drawer */}
                  <button
                    id="action-open-drawer-card"
                    onClick={handleOpenCashDrawerTrigger}
                    className="group bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                        Hardware Link
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                        เปิดลิ้นชักเก็บเงิน
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ส่งสัญญาณเปิดลิ้นชักแคชเชียร์พร้อมบันทึก Audit Log
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>สั่งเด้งลิ้นชัก</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* Action 4: Promotions & Coupons */}
                  <button
                    id="action-promotions-card"
                    onClick={() => {
                      onClose();
                      onOpenPromotionModal();
                    }}
                    className="group bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
                        <Tag className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">
                        3 ชิ้น 100 / คูปอง
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition">
                        โปรโมชั่น & โค้ดส่วนลด
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        เลือกโปรโมชั่นแถม, ลดเปอร์เซ็นต์ หรือกรอกรหัสคูปอง
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>เปิดหน้าต่างโปรโมชั่น</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* Action 5: Order History & Returns */}
                  <button
                    id="action-history-returns-card"
                    onClick={() => {
                      onClose();
                      onOpenOrderHistory();
                    }}
                    className="group bg-white hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center group-hover:scale-105 transition">
                        <History className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                        พิมพ์ซ้ำ / คืนเงิน
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition">
                        ประวัติบิล & ขอคืนเงิน
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ค้นหาบิลเก่า, พิมพ์ใบเสร็จซ้ำ และทำรายการคืนสินค้า
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-amber-800 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>ดูประวัติการขาย</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* Action 6: Quick Add Menu Item */}
                  <button
                    id="action-add-menu-card"
                    onClick={() => {
                      onClose();
                      onOpenAddMenu();
                    }}
                    className="group bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
                        <Plus className="w-5 h-5" />
                      </div>
                      {currentUser?.role === 'cashier' ? (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> ต้องใช้ PIN ผจก.
                        </span>
                      ) : (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
                          สร้างเมนู
                        </span>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-indigo-800 transition">
                        เพิ่มเมนู / สินค้าด่วน
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        สร้างเมนูเครื่องดื่ม, กัญชา, กระท่อม หรืออาหารใหม่
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>สร้างสินค้าใหม่</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* Action 7: Camera Barcode Scanner */}
                  <button
                    id="action-camera-scanner-card"
                    onClick={() => {
                      onClose();
                      onOpenCameraScanner();
                    }}
                    className="group bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                        Webcam / Phone
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                        สแกนกล้อง Barcode / QR
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        เปิดกล้องเว็บแคมสแกนบาร์โค้ดลงตะกร้าอัตโนมัติ
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>เปิดกล้องสแกน</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* Action 8: Quick Thai QR PromptPay */}
                  <button
                    id="action-quick-qr-card"
                    onClick={() => {
                      onClose();
                      onOpenQuickQr();
                    }}
                    className="group bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                        EMVCo QR
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition">
                        QR พร้อมเพย์กลางร้าน
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        แสดง QR Code พร้อมเพย์ร้านค้าแบบคงที่ให้ลูกค้าสแกน
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>แสดง QR โค้ด</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* Action 9: Keyboard Shortcuts Cheat Sheet */}
                  <button
                    id="action-shortcuts-card"
                    onClick={() => {
                      onClose();
                      onOpenShortcuts();
                    }}
                    className="group bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 p-4 rounded-2xl text-left transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
                        <Keyboard className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                        F1 / ?
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition">
                        คู่มือคีย์ลัด POS (Shortcuts)
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ดูคีย์ลัดแป้นพิมพ์: F1-F12, Space, Enter, Alt+1-9
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <span>ดูตารางคีย์ลัด</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger / Emergency Utility */}
              {cart.length > 0 && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    มีสินค้าในตะกร้าปัจจุบัน {cart.length} รายการ (฿{cart.reduce((sum, i) => sum + i.subtotal, 0).toLocaleString()})
                  </div>
                  <button
                    id="quick-clear-cart-btn"
                    onClick={() => {
                      if (confirm('ต้องการล้างสินค้าทั้งหมดในตะกร้าหรือไม่?')) {
                        clearCart();
                        onClose();
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ล้างตะกร้าสินค้าด่วน</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUICK KITCHEN DISPLAY (KDS) */}
          {activeTab === 'kitchen' && (
            <div className="space-y-4">
              {/* KDS Bar */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">กรองแผนก:</span>
                  <div className="flex items-center space-x-1">
                    {(['all', 'kitchen', 'bar'] as const).map((station) => (
                      <button
                        key={station}
                        onClick={() => setKitchenStationFilter(station)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          kitchenStationFilter === station
                            ? 'bg-orange-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {station === 'all' && 'ทั้งหมด'}
                        {station === 'kitchen' && '🍳 ครัวอาหาร'}
                        {station === 'bar' && '🍹 บาร์เครื่องดื่ม'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setKitchenSound(!kitchenSound)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                      kitchenSound
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    {kitchenSound ? <Volume2 className="w-3.5 h-3.5 text-orange-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{kitchenSound ? 'เสียงเตือน: เปิด' : 'เสียงเตือน: ปิด'}</span>
                  </button>

                  <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-xl text-slate-700 border border-slate-200">
                    {now.toLocaleTimeString('th-TH')}
                  </span>
                </div>
              </div>

              {/* Kitchen Orders List */}
              {pendingOrPrepKitchenOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 space-y-3">
                  <ChefHat className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">ไม่มีรายการออเดอร์ค้างในครัวขณะนี้</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    เมื่อมีการชำระเงินเมนูอาหารหรือเครื่องดื่ม รายการจะปรากฏบนหน้านี้แบบ Real-Time ทันที
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {pendingOrPrepKitchenOrders.map((order) => {
                    const sla = getOrderSlaDetails(order.timestamp, 15);
                    const filteredItems = (order.items || []).filter((item) => {
                      if (kitchenStationFilter === 'all') return true;
                      return item.station === kitchenStationFilter;
                    });

                    if (filteredItems.length === 0) return null;

                    return (
                      <div
                        key={order.id}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs flex flex-col justify-between transition ${
                          sla.alertLevel === 'overdue'
                            ? 'border-rose-300 ring-2 ring-rose-400 bg-rose-50/40'
                            : sla.alertLevel === 'warning'
                            ? 'border-amber-300 ring-1 ring-amber-300 bg-amber-50/30'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Order Header */}
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-extrabold text-sm text-slate-900">
                                  {order.orderNo}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                                  {order.orderType === 'dine_in'
                                    ? `ทานที่ร้าน (โต๊ะ ${order.tableNo || '-'})`
                                    : order.orderType === 'takeaway'
                                    ? 'สั่งกลับบ้าน'
                                    : 'เดลิเวอรี'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                สั่งเมื่อ {new Date(order.timestamp).toLocaleTimeString('th-TH')}
                              </span>
                            </div>

                            {/* SLA Timer Countdown */}
                            <div className="text-right">
                              <span
                                className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                                  sla.alertLevel === 'overdue'
                                    ? 'bg-rose-600 text-white'
                                    : sla.alertLevel === 'warning'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-emerald-600 text-white'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                {sla.formattedCountdown}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mt-3 space-y-2">
                            {filteredItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-extrabold text-slate-900">
                                      {item.quantity}x
                                    </span>
                                    <span className="font-bold text-slate-800 truncate">
                                      {item.productName}
                                    </span>
                                    <span className="text-[10px] text-slate-400">({item.unit})</span>
                                  </div>
                                  {item.customNotes && (
                                    <p className="text-[10px] text-amber-700 font-semibold mt-0.5 truncate">
                                      📝 {item.customNotes}
                                    </p>
                                  )}
                                </div>

                                {/* Status Control Buttons */}
                                <div className="flex items-center space-x-1 shrink-0">
                                  {item.status === 'pending' && (
                                    <button
                                      onClick={() => updateKitchenItemStatus(order.id, item.id, 'preparing')}
                                      className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-2xs"
                                    >
                                      🍳 ปรุง
                                    </button>
                                  )}
                                  {item.status === 'preparing' && (
                                    <button
                                      onClick={() => updateKitchenItemStatus(order.id, item.id, 'ready')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-2xs"
                                    >
                                      ✅ พร้อมเสิร์ฟ
                                    </button>
                                  )}
                                  {item.status === 'ready' && (
                                    <button
                                      onClick={() => updateKitchenItemStatus(order.id, item.id, 'served')}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-2xs"
                                    >
                                      🛎️ เสิร์ฟแล้ว
                                    </button>
                                  )}
                                  {item.status === 'served' && (
                                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                      เสร็จสิ้น
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quick Action to Serve All */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 font-medium">
                            สถานะ: {order.overallStatus === 'ready' ? '✅ พร้อมเสิร์ฟทั้งหมด' : order.overallStatus === 'preparing' ? '🍳 กำลังปรุง' : '⏳ รอดำเนินการ'}
                          </span>
                          <button
                            onClick={() => {
                              filteredItems.forEach((item) => {
                                updateKitchenItemStatus(order.id, item.id, 'served');
                              });
                            }}
                            className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            เสิร์ฟครบทุกรายการ 🛎️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHIFT & CASHIER SWITCHING */}
          {activeTab === 'shift' && (
            <div className="space-y-5">
              {/* Active Shift Overview */}
              <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold">
                      <RefreshCw className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-bold text-white">
                          {currentShift ? `ข้อมูลกะปัจจุบัน: ${currentShift.shiftNumber}` : 'ไม่มีกะที่เปิดใช้งาน'}
                        </h4>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {currentShift?.status === 'active' ? 'Active Shift' : 'Idle'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        แคชเชียร์ผู้รับผิดชอบ: <span className="font-bold text-white">{currentUser.name}</span> ({currentUser.role})
                        {currentShift && ` • เริ่มเวลา: ${new Date(currentShift.startTime).toLocaleTimeString('th-TH')}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentShift ? (
                      <button
                        id="close-shift-mode-toggle-btn"
                        onClick={() => setIsClosingShiftMode(!isClosingShiftMode)}
                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isClosingShiftMode ? 'ยกเลิกการปิดกะ' : 'ปิดกะประจำวัน (Close Shift)'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleExecuteStartNewShift}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เปิดกะใหม่</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Shift Financial Stats */}
                {currentShift && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-700/60 text-center">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-medium">เงินทอนตั้งต้น</span>
                      <p className="text-sm font-extrabold text-white">฿{currentShift.startingFloatThb.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-medium">ยอดเงินสดที่รับมา</span>
                      <p className="text-sm font-extrabold text-emerald-400">฿{currentShift.cashSalesThb.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-medium">ยอดพร้อมเพย์ / บัตร</span>
                      <p className="text-sm font-extrabold text-blue-400">฿{(currentShift.promptPaySalesThb + currentShift.cardSalesThb).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-medium">เงินสดที่ควรมีในลิ้นชัก</span>
                      <p className="text-sm font-extrabold text-amber-300">
                        ฿{(currentShift.startingFloatThb + currentShift.cashSalesThb).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Shift Form Panel */}
              {isClosingShiftMode && currentShift && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in">
                  <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>ปิดกะและกระทบยอดเงินสดในลิ้นชัก (Shift Reconciliation)</span>
                  </div>
                  <form onSubmit={handleExecuteCloseShift} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          เงินสดที่นับได้จริงในลิ้นชัก (บาท) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={closingActualCashInput}
                          onChange={(e) => setClosingActualCashInput(e.target.value)}
                          placeholder={`ยอดตามระบบ: ${(currentShift.startingFloatThb + currentShift.cashSalesThb).toLocaleString()}`}
                          className="w-full bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                        />
                        {closingActualCashInput && (
                          <div className="mt-1 text-[11px]">
                            {(() => {
                              const actual = parseFloat(closingActualCashInput) || 0;
                              const expected = currentShift.startingFloatThb + currentShift.cashSalesThb;
                              const diff = actual - expected;
                              if (diff === 0) {
                                return <span className="text-emerald-700 font-bold">✅ ยอดเงินสดตรงเป๊ะ (พอดี ฿0)</span>;
                              } else if (diff > 0) {
                                return <span className="text-blue-700 font-bold">📈 เงินสดเกิน ฿{diff.toLocaleString()}</span>;
                              } else {
                                return <span className="text-rose-700 font-bold">⚠️ เงินสดขาด ฿{Math.abs(diff).toLocaleString()}</span>;
                              }
                            })()}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          หมายเหตุการปิดกะ (ถ้ามี)
                        </label>
                        <input
                          type="text"
                          value={closeNotes}
                          onChange={(e) => setCloseNotes(e.target.value)}
                          placeholder="เช่น เงินทอนเหรียญสำรอง, สรุปยอดสิ้นวัน"
                          className="w-full bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsClosingShiftMode(false)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition cursor-pointer"
                      >
                        ยืนยันการปิดกะ
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Handover / Switch Shift Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      สลับกะให้พนักงานคนอื่น (Cashier Handover)
                    </h4>
                    <p className="text-xs text-slate-500">
                      เลือกพนักงานผู้มารับกะต่อ และให้พนักงานระบุรหัส PIN 4 หลักเพื่อยืนยันตัวตน
                    </p>
                  </div>
                </div>

                {switchError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{switchError}</span>
                  </div>
                )}

                {switchSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{switchSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleExecuteSwitchShift} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Target User Select */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        พนักงานผู้รับกะใหม่ *
                      </label>
                      <select
                        id="switch-shift-target-user-select"
                        value={selectedTargetUserId}
                        onChange={(e) => setSelectedTargetUserId(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role === 'super_admin' ? 'Super Admin' : u.role === 'manager' ? 'Manager' : u.role === 'cashier' ? 'Cashier' : u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PIN Security Check */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        รหัส PIN 4 หลักของผู้รับกะ *
                      </label>
                      <input
                        id="switch-shift-pin-input"
                        type="password"
                        maxLength={8}
                        value={targetUserPin}
                        onChange={(e) => setTargetUserPin(e.target.value)}
                        placeholder="ระบุรหัส PIN..."
                        className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center font-bold"
                      />
                    </div>

                    {/* Starting Float */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        เงินทอนส่งมอบเริ่มต้น (บาท)
                      </label>
                      <input
                        id="switch-shift-float-input"
                        type="number"
                        step="any"
                        value={startingFloatInput}
                        onChange={(e) => setStartingFloatInput(e.target.value)}
                        placeholder="1000"
                        className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      บันทึกช่วยจำการสลับกะ (Handover Notes)
                    </label>
                    <input
                      type="text"
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      placeholder="เช่น ส่งมอบเงินสดครบถ้วน, สำรองเหรียญ 500 บาท..."
                      className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      id="execute-switch-shift-submit-btn"
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>ยืนยันการสลับกะแคชเชียร์</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Past Shifts History summary */}
              {shifts.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    ประวัติกะที่ผ่านมา (Shift History Log)
                  </h4>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {shifts.slice(0, 5).map((s) => (
                      <div key={s.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-slate-800">{s.shiftNumber}</span>
                          <span className="text-slate-500 ml-2">โดย {s.cashierName}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(s.startTime).toLocaleDateString('th-TH')} {new Date(s.startTime).toLocaleTimeString('th-TH')}
                            {s.endTime && ` - ${new Date(s.endTime).toLocaleTimeString('th-TH')}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-700">฿{s.totalSalesThb.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500 block">({s.orderCount} บิล)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            กด <kbd className="font-mono bg-white border border-slate-300 px-1 py-0.2 rounded text-[10px] text-slate-700">F4</kbd> หรือ <kbd className="font-mono bg-white border border-slate-300 px-1 py-0.2 rounded text-[10px] text-slate-700">Alt+Q</kbd> เพื่อเปิด/ปิดเมนูด่วนได้ตลอดเวลา
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            ปิดหน้าต่าง (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
