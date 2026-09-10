import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { SaleOrder, CartItem, User } from '../../types';
import {
  Receipt,
  RotateCcw,
  Search,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  UserCheck,
  DollarSign,
  Calendar,
  X,
  Printer,
  ChevronDown,
  ChevronUp,
  Tag,
  PackageCheck,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ManagerAuthModal } from '../common/ManagerAuthModal';
import { ReceiptModal } from './ReceiptModal';

interface OrderHistoryReturnsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryReturnsModal: React.FC<OrderHistoryReturnsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orders = [], currentUser, refundOrder } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'refunded'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Refund State
  const [orderToRefund, setOrderToRefund] = useState<SaleOrder | null>(null);
  const [isManagerAuthOpen, setIsManagerAuthOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('ลูกค้าขอเปลี่ยน/คืนสินค้า');
  const [customRefundNote, setCustomRefundNote] = useState('');
  const [showConfirmRefundDialog, setShowConfirmRefundDialog] = useState(false);
  const [authorizedManager, setAuthorizedManager] = useState<User | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<SaleOrder | null>(null);

  if (!isOpen) return null;

  const isCashier = currentUser.role === 'cashier';

  // Filter orders
  const filteredOrders = (orders || []).filter((o) => {
    if (!o) return false;
    const matchesSearch =
      o.orderNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.cashierName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && o.paymentStatus === 'paid') ||
      (statusFilter === 'refunded' && (o.paymentStatus === 'refunded' || o.paymentStatus === 'partially_refunded'));

    return matchesSearch && matchesStatus;
  });

  const handleStartRefund = (order: SaleOrder) => {
    setOrderToRefund(order);
    setRefundReason('ลูกค้าขอเปลี่ยน/คืนสินค้า');
    setCustomRefundNote('');

    if (isCashier) {
      // Cashier MUST have manager PIN authorization
      setIsManagerAuthOpen(true);
    } else {
      // Manager / Admin can proceed directly
      setAuthorizedManager(currentUser);
      setShowConfirmRefundDialog(true);
    }
  };

  const handleManagerAuthSuccess = (manager: User) => {
    setAuthorizedManager(manager);
    setShowConfirmRefundDialog(true);
  };

  const handleExecuteRefund = () => {
    if (!orderToRefund) return;
    const finalReason = customRefundNote.trim()
      ? `${refundReason}: ${customRefundNote.trim()}`
      : refundReason;

    const managerName = authorizedManager ? authorizedManager.name : currentUser.name;
    const success = refundOrder(orderToRefund.id, finalReason, managerName);

    if (success) {
      setShowConfirmRefundDialog(false);
      setOrderToRefund(null);
      setAuthorizedManager(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-5 sm:p-6 text-slate-800 shadow-2xl flex flex-col max-h-[92vh] space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-2xl border border-indigo-200">
              <Receipt className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  ประวัติบิลการขาย & ระบบรับคืนสินค้า (Order History & Returns)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ค้นหาบิลย้อนหลัง พิมพ์สลิป และทำเรื่องคืนสินค้า/คืนเงิน (สิทธิ์แคชเชียร์ต้องได้รับอนุมัติจาก ผจก.)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cashier Policy Notice Banner */}
        {isCashier && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">กฎความปลอดภัยระดับแคชเชียร์: </span>
              <span>การทำคืนสินค้า (Refund) หรือรับเปลี่ยนสินค้า ต้องได้รับการอนุมัติและใส่รหัส PIN โดยผู้จัดการร้านทุกครั้ง</span>
            </div>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาเลขบิล, ชื่อลูกค้า, แคชเชียร์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ทั้งหมด ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ชำระแล้ว ({orders.filter((o) => o.paymentStatus === 'paid').length})
            </button>
            <button
              onClick={() => setStatusFilter('refunded')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'refunded'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              คืนเงินแล้ว ({orders.filter((o) => o.paymentStatus === 'refunded' || o.paymentStatus === 'partially_refunded').length})
            </button>
          </div>
        </div>

        {/* Order List Body */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[480px]">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-2">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">ไม่พบบิลการขายที่ตรงกับเงื่อนไข</p>
              <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const isRefunded = order.paymentStatus === 'refunded' || order.paymentStatus === 'partially_refunded';

              return (
                <div
                  key={order.id}
                  className={`border rounded-2xl p-4 transition duration-150 ${
                    isRefunded
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2.5 rounded-xl mt-0.5 ${
                          isRefunded
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isRefunded ? (
                          <RotateCcw className="w-5 h-5" />
                        ) : (
                          <Receipt className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 font-mono">
                            #{order.orderNo || order.id.substring(0, 10)}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              isRefunded
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {isRefunded ? '❌ คืนเงินแล้ว (Refunded)' : '✓ ชำระเงินสำเร็จ'}
                          </span>
                          {order.orderType && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                              {order.orderType === 'dine_in' ? 'ทานที่ร้าน' : order.orderType === 'takeaway' ? 'กลับบ้าน' : 'เดลิเวอรี'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-500 flex-wrap gap-y-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(order.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            แคชเชียร์: {order.cashierName || 'พนักงาน'}
                          </span>
                          {order.customerName && (
                            <span className="text-indigo-600 font-semibold">
                              👤 {order.customerName}
                            </span>
                          )}
                        </div>

                        {/* Refund Details Strip if refunded */}
                        {isRefunded && (
                          <div className="mt-2 p-2 bg-rose-100/70 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5 text-rose-700" />
                              <span>บันทึกการคืนเงิน: {order.refundReason || 'ลูกค้าคืนสินค้า'}</span>
                            </div>
                            <div className="text-rose-800 text-[10px] flex items-center space-x-3">
                              <span>อนุมัติโดย: {order.refundApprovedByManager || 'ผู้จัดการ'}</span>
                              {order.refundedAt && <span>เมื่อ: {formatDate(order.refundedAt)}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Total & Actions */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block">ยอดสุทธิ</span>
                        <span
                          className={`font-mono text-base font-extrabold ${
                            isRefunded ? 'line-through text-slate-400' : 'text-emerald-700'
                          }`}
                        >
                          ฿{(order.netTotal || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                          title="ดูสลิปใบเสร็จ / พิมพ์ซ้ำ"
                        >
                          <Printer className="w-4 h-4 text-slate-600" />
                        </button>

                        {!isRefunded && (
                          <button
                            onClick={() => handleStartRefund(order)}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer shadow-2xs"
                            title={isCashier ? 'ขออนุมัติผู้จัดการเพื่อคืนสินค้า' : 'ทำรายการคืนสินค้า'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>คืนสินค้า</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                          title="ดูรายการสินค้าในบิล"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Item List */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-100">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>รายการสินค้าในบิล ({order.items?.length || 0} รายการ)</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          ช่องทางชำระ: {order.paymentMethods?.map((p) => p.method).join(', ') || 'เงินสด'}
                        </span>
                      </div>

                      <div className="bg-slate-50/70 rounded-xl p-2.5 space-y-1.5">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800">{item.productName}</span>
                              <div className="text-[10px] text-slate-500 space-x-2">
                                <span>
                                  ฿{item.price.toLocaleString()} x {item.quantity} {item.unit}
                                </span>
                                {item.lotNumber && (
                                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    Lot: {item.lotNumber}
                                  </span>
                                )}
                                {item.batchNo && (
                                  <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                    Batch: {item.batchNo}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              ฿{(item.subtotal || item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            แสดง {filteredOrders.length} จากทั้งหมด {orders.length} บิล
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Manager Auth Modal Trigger */}
      <ManagerAuthModal
        isOpen={isManagerAuthOpen}
        onClose={() => {
          setIsManagerAuthOpen(false);
          setOrderToRefund(null);
        }}
        onSuccess={handleManagerAuthSuccess}
        actionTitle="ขออนุมัติคืนสินค้า / คืนเงิน (Manager Refund Approval)"
        actionDescription="ตามกฎข้อที่ 2 ของร้าน: พนักงานแคชเชียร์ห้ามทำคืนสินค้า (Refund) หรือรับเปลี่ยนสินค้า ยกเว้นได้รับอนุมัติจากผู้จัดการร้าน"
        requiredRoleLabel="ต้องได้รับการอนุมัติจาก ผู้จัดการ หรือ Admin"
      />

      {/* Confirm Refund Details Dialog */}
      {showConfirmRefundDialog && orderToRefund && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                  <RotateCcw className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    ยืนยันการคืนสินค้า & คืนเงิน
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    บิล #{orderToRefund.orderNo || orderToRefund.id.substring(0, 10)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmRefundDialog(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Manager approval badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">อนุมัติโดย: </span>
                <span>{authorizedManager ? authorizedManager.name : currentUser.name} ({authorizedManager?.role === 'super_admin' ? 'Super Admin' : 'ผู้จัดการร้าน'})</span>
              </div>
            </div>

            {/* Order Refund Summary */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>จำนวนสินค้าที่คืน:</span>
                <span className="font-bold text-slate-900">{orderToRefund.items?.length || 0} รายการ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ยอดเงินที่ต้องคืนลูกค้า:</span>
                <span className="font-mono font-extrabold text-base text-rose-600">
                  ฿{(orderToRefund.netTotal || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                * ระบบจะปรับเพิ่มสต็อกสินค้า, คืนน้ำหนัก Lot กัญชา และบันทึก Audit Trail อัตโนมัติ
              </div>
            </div>

            {/* Reason selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                เลือกเหตุผลการคืนสินค้า (Refund Reason):
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-semibold focus:outline-none focus:border-rose-500"
              >
                <option value="ลูกค้าขอเปลี่ยน/คืนสินค้า">ลูกค้าขอเปลี่ยน/คืนสินค้า (Customer Request)</option>
                <option value="สินค้าชำรุด/แตกหัก/เสียหาย">สินค้าชำรุด/แตกหัก/เสียหาย (Damaged Goods)</option>
                <option value="คีย์รายการผิด/คิดเงินผิด">คีย์รายการผิดพลาด / คิดเงินผิด (Cashier Mistake)</option>
                <option value="สินค้าไม่ได้มาตรฐาน/คุณภาพไม่ตรง">สินค้าไม่ได้มาตรฐาน / คุณภาพไม่ตรง (Quality Issue)</option>
                <option value="อื่นๆ">เหตุผลอื่นๆ (กรุณาระบุ)</option>
              </select>

              <input
                type="text"
                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)..."
                value={customRefundNote}
                onChange={(e) => setCustomRefundNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmRefundDialog(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ยืนยันการคืนเงิน ฿{(orderToRefund.netTotal || 0).toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal for Reprinting */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
};
