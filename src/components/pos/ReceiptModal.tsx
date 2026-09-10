import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { SaleOrder } from '../../types';
import {
  Printer,
  FileCheck,
  CheckCircle,
  Copy,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ReceiptModalProps {
  order: SaleOrder;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { shopSettings } = usePOS();
  const [receiptType, setReceiptType] = useState<'abbreviated' | 'full_tax'>('abbreviated');
  const [taxPayerName, setTaxPayerName] = useState(order.customerName || '');
  const [taxPayerId, setTaxPayerId] = useState('0105550001234');
  const [taxPayerAddress, setTaxPayerAddress] = useState('กรุงเทพมหานคร');

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct window.print failed, attempting iframe print fallback', e);
    }

    // Fallback Popup window for printing if iframe print is intercepted
    const receiptElement = document.querySelector('.printable-receipt');
    if (receiptElement) {
      const printWin = window.open('', '_blank', 'width=450,height=600');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt ${order.orderNo}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; margin: 0; background: #fff; color: #000; }
                .printable-receipt { width: 100%; max-width: 80mm; margin: 0 auto; font-size: 11px; line-height: 1.3; }
                .printable-receipt table { width: 100%; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              ${receiptElement.outerHTML}
              <script>
                setTimeout(() => {
                  window.print();
                }, 300);
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">ชำระเงินสำเร็จ (Receipt Preview)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Type Switcher */}
        <div className="my-3 flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs no-print">
          <button
            onClick={() => setReceiptType('abbreviated')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition ${
              receiptType === 'abbreviated'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ใบเสร็จรับเงินอย่างย่อ
          </button>
          <button
            onClick={() => setReceiptType('full_tax')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition ${
              receiptType === 'full_tax'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ใบกำกับภาษีเต็มรูปแบบ
          </button>
        </div>

        {/* Full Tax Fields if Full Tax */}
        {receiptType === 'full_tax' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs mb-2">
            <h5 className="font-bold text-emerald-700">ข้อมูลผู้เสียภาษี (ผู้ซื้อ):</h5>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="ชื่อบริษัท / บุคคล"
                value={taxPayerName}
                onChange={(e) => setTaxPayerName(e.target.value)}
                className="bg-white text-slate-800 p-1.5 rounded border border-slate-300"
              />
              <input
                type="text"
                placeholder="เลขผู้เสียภาษี 13 หลัก"
                value={taxPayerId}
                onChange={(e) => setTaxPayerId(e.target.value)}
                className="bg-white text-slate-800 p-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <input
              type="text"
              placeholder="ที่อยู่ตามภ.พ.20"
              value={taxPayerAddress}
              onChange={(e) => setTaxPayerAddress(e.target.value)}
              className="w-full bg-white text-slate-800 p-1.5 rounded border border-slate-300"
            />
          </div>
        )}

        {/* Printable Paper Voucher Layout */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 p-5 rounded-2xl border border-slate-200 font-sans text-xs space-y-3 printable-receipt">
          {/* Shop Info Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-extrabold text-sm uppercase text-slate-900 tracking-tight">
              {shopSettings.shopName}
            </h2>
            {shopSettings.receiptHeader && (
              <p className="text-[10px] text-emerald-800 font-bold whitespace-pre-line bg-emerald-50/70 p-1 rounded border border-emerald-200/60 my-1">
                {shopSettings.receiptHeader}
              </p>
            )}
            <p className="text-[10px] text-slate-600">{shopSettings.address}</p>
            <p className="text-[10px] text-slate-600 font-mono">
              เลขผู้เสียภาษี: {shopSettings.taxId} | โทร: {shopSettings.phone}
            </p>
            <div className="text-[9px] text-emerald-800 font-medium bg-emerald-50 py-1 px-2 rounded border border-emerald-200 mt-1">
              <span>🌿 ใบอนุญาตสมุนไพรควบคุม: {shopSettings.cannabisLicenseNo}</span> <br />
              <span>🥤 เลขสารบบ อย. กระท่อม: {shopSettings.kratomFdaNo}</span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-800 pt-1 uppercase">
              {receiptType === 'full_tax' ? 'ใบกำกับภาษี / ใบเสร็จรับเงิน' : 'ใบเสร็จรับเงินอย่างย่อ'}
            </h4>
          </div>

          {/* Full Tax Invoice Details */}
          {receiptType === 'full_tax' && (
            <div className="bg-white p-2.5 rounded border border-slate-200 text-[10px] space-y-1">
              <p className="font-bold text-slate-800">ลูกค้า / ผู้ซื้อ:</p>
              <p>ชื่อ: {taxPayerName || 'ลูกค้าทั่วไป'}</p>
              <p className="font-mono">เลขผู้เสียภาษี: {taxPayerId}</p>
              <p>ที่อยู่: {taxPayerAddress}</p>
            </div>
          )}

          {/* Order Header */}
          <div className="text-[10px] space-y-0.5 text-slate-700">
            <div className="flex justify-between">
              <span>เลขที่ออเดอร์:</span>
              <span className="font-mono font-bold text-slate-900">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span>วันที่เวลา:</span>
              <span>{new Date(order.timestamp).toLocaleString('th-TH')}</span>
            </div>
            <div className="flex justify-between">
              <span>แคชเชียร์ผู้ทำรายการ:</span>
              <span>{order.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>รูปแบบการซื้อ:</span>
              <span className="font-bold">
                {order.orderType === 'dine_in'
                  ? `ทานที่ร้าน (${order.tableNo})`
                  : order.orderType === 'takeaway'
                  ? 'กลับบ้าน'
                  : 'เดลิเวอรี่'}
              </span>
            </div>
            {order.prescriptionRef && (
              <div className="flex justify-between text-emerald-800 font-mono font-bold bg-emerald-50 px-1 py-0.5 rounded">
                <span>ใบสั่งจ่ายสมุนไพร:</span>
                <span>{order.prescriptionRef}</span>
              </div>
            )}

            {/* Customer & Loyalty Points */}
            {order.customerName && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-1.5 my-1 space-y-0.5">
                <div className="flex justify-between font-bold text-amber-950">
                  <span>สมาชิก: {order.customerName}</span>
                  {order.customerTier && (
                    <span className="bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded text-[9px]">
                      {order.customerTier} Tier
                    </span>
                  )}
                </div>
                {order.pointsEarned !== undefined && order.pointsEarned > 0 && (
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>แต้มสะสมที่ได้รับบิลนี้:</span>
                    <span className="font-mono font-bold text-amber-900">+{order.pointsEarned} แต้ม</span>
                  </div>
                )}
                {order.customerPointsBalance !== undefined && (
                  <div className="flex justify-between text-slate-600 text-[9px]">
                    <span>ยอดแต้มสะสมคงเหลือล่าสุด:</span>
                    <span className="font-mono font-bold text-amber-800">{order.customerPointsBalance} แต้ม</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Purchased Items Table */}
          <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-2">
            <div className="grid grid-cols-12 font-bold text-[10px] text-slate-800 border-b pb-1">
              <span className="col-span-6">รายการสินค้า</span>
              <span className="col-span-2 text-center">จำนวน</span>
              <span className="col-span-2 text-right">หน่วยละ</span>
              <span className="col-span-2 text-right">รวม</span>
            </div>

            {(order?.items || []).map((item, i) => (
              <div key={i} className="grid grid-cols-12 text-[10px] text-slate-800">
                <div className="col-span-6">
                  <p className="font-semibold">{item.productName}</p>
                  {item.lotNumber && (
                    <span className="text-[9px] text-emerald-700 font-mono">
                      (Lot: {item.lotNumber})
                    </span>
                  )}
                  {item.batchNo && (
                    <span className="text-[9px] text-blue-700 font-mono">
                      (Batch: {item.batchNo})
                    </span>
                  )}
                </div>
                <span className="col-span-2 text-center font-mono">
                  {item.quantity} {item.unit}
                </span>
                <span className="col-span-2 text-right font-mono">
                  ฿{item.price.toLocaleString()}
                </span>
                <span className="col-span-2 text-right font-mono font-bold">
                  ฿{item.subtotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="space-y-1 text-[11px] text-slate-800 pt-1">
            <div className="flex justify-between">
              <span>ราคารวม:</span>
              <span className="font-mono">฿{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>ส่วนลด:</span>
                <span className="font-mono">-฿{order.discountTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>ภาษีมูลค่าเพิ่ม VAT {shopSettings.vatPercent}%:</span>
              <span className="font-mono">฿{order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-300 pt-1">
              <span>ยอดรวมสุทธิ:</span>
              <span className="font-mono">฿{order.netTotal.toLocaleString()}</span>
            </div>

            {/* Payment Method Details */}
            <div className="pt-2 text-[10px] text-slate-600 space-y-0.5">
              {(order?.paymentMethods || []).map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    การชำระ ({p.method}): {p.referenceNo ? `[${p.referenceNo}]` : ''}
                  </span>
                  <span className="font-mono font-bold">฿{p.amount.toLocaleString()}</span>
                </div>
              ))}
              {order.paymentMethods.find((p) => p.change) && (
                <div className="flex justify-between font-bold text-slate-900 pt-0.5">
                  <span>เงินทอน:</span>
                  <span className="font-mono">
                    ฿{order.paymentMethods.find((p) => p.change)?.change?.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-500 whitespace-pre-line">
            {shopSettings.receiptFooter}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between no-print">
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(order, null, 2));
              alert('คัดลอก JSON ของออเดอร์เรียบร้อย');
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs flex items-center space-x-1 font-medium transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>คัดลอก JSON</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบเสร็จ (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
