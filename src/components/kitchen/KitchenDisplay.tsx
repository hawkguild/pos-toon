import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { KitchenOrder } from '../../types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  UtensilsCrossed,
  Timer,
  Bell,
  Zap,
} from 'lucide-react';

export const KitchenDisplay: React.FC = () => {
  const { kitchenOrders = [], updateKitchenItemStatus } = usePOS();
  const [stationFilter, setStationFilter] = useState<'all' | 'kitchen' | 'bar'>('all');
  const [targetSlaMins, setTargetSlaMins] = useState<number>(15); // Default target 15 mins
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [now, setNow] = useState<Date>(new Date());

  // Real-time ticking timer every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingOrPreparingOrders = (kitchenOrders || []).filter(
    (o) => o.overallStatus !== 'served'
  );

  // Helper calculations for Order Alerts
  const getOrderSlaDetails = (orderTimestamp: string) => {
    const orderTime = new Date(orderTimestamp).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - orderTime) / 1000));
    const targetSeconds = targetSlaMins * 60;
    const remainingSeconds = targetSeconds - elapsedSeconds;

    let alertLevel: 'normal' | 'warning' | 'overdue' = 'normal';
    if (elapsedSeconds >= targetSeconds) {
      alertLevel = 'overdue';
    } else if (elapsedSeconds >= targetSeconds * 0.6) {
      alertLevel = 'warning';
    }

    return { elapsedSeconds, targetSeconds, remainingSeconds, alertLevel };
  };

  // Stats calculation
  const stats = pendingOrPreparingOrders.reduce(
    (acc, order) => {
      const { alertLevel } = getOrderSlaDetails(order.timestamp);
      if (alertLevel === 'overdue') acc.overdue++;
      else if (alertLevel === 'warning') acc.warning++;
      else acc.normal++;
      return acc;
    },
    { normal: 0, warning: 0, overdue: 0 }
  );

  const formatMinSec = (totalSeconds: number) => {
    const isNegative = totalSeconds < 0;
    const absSecs = Math.abs(totalSeconds);
    const mins = Math.floor(absSecs / 60);
    const secs = absSecs % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return isNegative ? `+${formatted}` : formatted;
  };

  const getStatusColor = (status: KitchenOrder['overallStatus'], alertLevel: 'normal' | 'warning' | 'overdue') => {
    if (status === 'ready') {
      return 'bg-emerald-50/90 border-emerald-300 text-emerald-950 ring-1 ring-emerald-400';
    }
    if (alertLevel === 'overdue') {
      return 'bg-rose-50/90 border-rose-300 text-rose-950 ring-2 ring-rose-500 animate-pulse-subtle';
    }
    if (alertLevel === 'warning') {
      return 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-400';
    }
    return 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';
  };

  const getStatusText = (status: KitchenOrder['overallStatus']) => {
    switch (status) {
      case 'pending':
        return '⏳ รอดำเนินการ';
      case 'preparing':
        return '🍳 กำลังปรุงอาหาร';
      case 'ready':
        return '✅ พร้อมเสิร์ฟ';
      case 'served':
        return '🛎️ เสิร์ฟแล้ว';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5 text-slate-800">
      {/* Top Banner & Control Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="bg-orange-500/20 p-3 rounded-2xl border border-orange-500/30 text-orange-400 shrink-0">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-lg sm:text-xl font-bold tracking-wide">
                ระบบจอครัว KDS (Kitchen Display & Alert System)
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Real-Time Timer
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              ระบบจับเวลาถอยหลังรายออเดอร์ แจ้งเตือนออเดอร์ล่าช้าเกิน SLA พร้อมส่งสัญญาณควบคุมในครัว
            </p>
          </div>
        </div>

        {/* Realtime Alert & SLA Control Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Audio toggle button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              soundEnabled
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="เปิด/ปิด เสียงเตือนเมื่อมีออเดอร์ใหม่หรือล่าช้า"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'เสียงเตือน: เปิด' : 'เสียงเตือน: ปิด'}</span>
          </button>

          {/* SLA Target selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-xs">
            <Timer className="w-4 h-4 text-amber-400 ml-1" />
            <span className="text-slate-300 font-medium hidden sm:inline">เกณฑ์ SLA:</span>
            <select
              value={targetSlaMins}
              onChange={(e) => setTargetSlaMins(Number(e.target.value))}
              className="bg-slate-900 text-white font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-orange-500 text-xs cursor-pointer"
            >
              <option value={10}>10 นาที (ด่วนมาก)</option>
              <option value={15}>15 นาที (มาตรฐาน)</option>
              <option value={20}>20 นาที (ช่วงเร่งด่วน)</option>
              <option value={30}>30 นาที (อาหารทำยาก)</option>
            </select>
          </div>

          {/* Station Filter */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs shadow-inner">
            <button
              onClick={() => setStationFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                stationFilter === 'all'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setStationFilter('kitchen')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                stationFilter === 'kitchen'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              🍳 ครัว
            </button>
            <button
              onClick={() => setStationFilter('bar')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                stationFilter === 'bar'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              🥤 บาร์
            </button>
          </div>
        </div>
      </div>

      {/* Alert Summary Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ออเดอร์ active ทั้งหมด</p>
            <p className="text-2xl font-black text-slate-900">{pendingOrPreparingOrders.length}</p>
          </div>
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">ตรงตามเวลาปกติ</p>
            <p className="text-2xl font-black text-emerald-800">{stats.normal}</p>
          </div>
          <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">ใกล้ครบกำหนด SLA</p>
            <p className="text-2xl font-black text-amber-800">{stats.warning}</p>
          </div>
          <div className="bg-amber-100 p-2.5 rounded-xl text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between transition-colors ${
          stats.overdue > 0 ? 'bg-rose-100/80 border-rose-300 text-rose-900 animate-pulse' : 'bg-slate-50 border-slate-200/80 text-slate-600'
        }`}>
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">🔥 ล่าช้าเกินเวลา</p>
            <p className="text-2xl font-black text-rose-900">{stats.overdue}</p>
          </div>
          <div className="bg-rose-200/80 p-2.5 rounded-xl text-rose-800">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Kitchen Orders Grid */}
      {pendingOrPreparingOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <UtensilsCrossed className="w-12 h-12 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-700 text-base">ไม่มีออเดอร์รอดำเนินการในขณะนี้</h4>
          <p className="text-xs text-slate-500">ออเดอร์ใหม่จากหน้า POS จะแสดงบนจอนี้พร้อมนับเวลาถอยหลังทันที</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingOrPreparingOrders.map((order) => {
            const filteredItems = (order?.items || []).filter(
              (i) => stationFilter === 'all' || i.station === stationFilter
            );

            if (filteredItems.length === 0) return null;

            const { elapsedSeconds, targetSeconds, remainingSeconds, alertLevel } =
              getOrderSlaDetails(order.timestamp);

            const progressPct = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

            return (
              <div
                key={order.id}
                className={`border rounded-2xl p-4 space-y-3 shadow-xs transition-all duration-300 ${getStatusColor(
                  order.overallStatus,
                  alertLevel
                )}`}
              >
                {/* Card Header & Countdown Timer Badge */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-slate-900">
                        {order.orderNo}
                      </span>
                      {alertLevel === 'overdue' && (
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs animate-bounce">
                          <Flame className="w-3 h-3" /> ล่าช้า!
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      {order.orderType === 'dine_in'
                        ? `🪑 โต๊ะ: ${order.tableNo}`
                        : order.orderType === 'takeaway'
                        ? '🛍️ กลับบ้าน'
                        : '🛵 เดลิเวอรี่'}
                    </p>
                  </div>

                  {/* Countdown Timer Badge */}
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-extrabold border shadow-2xs ${
                        alertLevel === 'overdue'
                          ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                          : alertLevel === 'warning'
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-slate-900 text-emerald-400 border-slate-800'
                      }`}
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>
                        {remainingSeconds >= 0
                          ? `เหลือ ${formatMinSec(remainingSeconds)}`
                          : `เกิน ${formatMinSec(remainingSeconds)}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      ผ่านไป {formatMinSec(elapsedSeconds)}
                    </p>
                  </div>
                </div>

                {/* SLA Timer Progress Bar */}
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      alertLevel === 'overdue'
                        ? 'bg-rose-600'
                        : alertLevel === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>

                {/* Items List */}
                <div className="space-y-2 py-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/95 p-2.5 rounded-xl border border-slate-200/90 flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="pr-2">
                        <p className="font-bold text-slate-900 text-sm">
                          {item.productName}{' '}
                          <span className="text-orange-600 font-mono font-extrabold">
                            ×{item.quantity}
                          </span>
                        </p>
                        {item.customNotes && (
                          <p className="text-[10px] text-amber-700 italic font-medium mt-0.5">
                            หมายเหตุ: {item.customNotes}
                          </p>
                        )}
                      </div>

                      {/* Status Buttons */}
                      <div className="flex space-x-1 shrink-0">
                        {item.status === 'pending' && (
                          <button
                            onClick={() =>
                              updateKitchenItemStatus(order.id, item.id, 'preparing')
                            }
                            className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            [เริ่มทำ]
                          </button>
                        )}
                        {item.status === 'preparing' && (
                          <button
                            onClick={() =>
                              updateKitchenItemStatus(order.id, item.id, 'ready')
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            [เสร็จแล้ว]
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <button
                            onClick={() =>
                              updateKitchenItemStatus(order.id, item.id, 'served')
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            [เสิร์ฟแล้ว]
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Time & Status */}
                <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    สั่งเมื่อ: {new Date(order.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-slate-700">
                    {getStatusText(order.overallStatus)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

