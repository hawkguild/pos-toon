import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Supplier, CannabisLot, SaleOrder } from '../../types';
import { AddEditSupplierModal } from './AddEditSupplierModal';
import {
  Truck,
  Plus,
  Search,
  FileText,
  Phone,
  Building,
  CheckCircle2,
  Edit2,
  Trash2,
  Printer,
  ShieldCheck,
  Package,
  Layers,
  Calendar,
  AlertTriangle,
  UserCheck,
  Tag,
  ExternalLink,
} from 'lucide-react';

export const SupplierManager: React.FC = () => {
  const { suppliers = [], addSupplier, updateSupplier, deleteSupplier, cannabisLots = [], orders = [], products = [] } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    (suppliers || []).length > 0 ? suppliers[0] : null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);

  const filteredSuppliers = (suppliers || []).filter((s) => {
    const matchesSearch =
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.licenseNumber && s.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || (s.productTypes && s.productTypes.includes(categoryFilter as any));

    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setSupplierToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setSupplierToEdit(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = (supplier: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        `คุณต้องการลบซัพพลายเออร์ "${supplier.companyName}" (${supplier.code}) ออกจากระบบใช่หรือไม่?`
      )
    ) {
      deleteSupplier(supplier.id);
      if (selectedSupplier?.id === supplier.id) {
        setSelectedSupplier(null);
      }
    }
  };

  const handleSaveSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    if (supplierToEdit) {
      updateSupplier(supplierToEdit.id, supplierData);
      if (selectedSupplier?.id === supplierToEdit.id) {
        setSelectedSupplier({ ...supplierToEdit, ...supplierData });
      }
    } else {
      addSupplier(supplierData);
    }
  };

  // Find linked lots for selected supplier
  const linkedLots = selectedSupplier
    ? (cannabisLots || []).filter((l) => l.supplierId === selectedSupplier.id)
    : [];

  // Find sales orders that contain items from this supplier's lots or items
  const linkedOrders: { order: SaleOrder; lotNumber?: string; productName: string; qty: number }[] = [];
  if (selectedSupplier) {
    const supplierLotNumbers = new Set(linkedLots.map((l) => l.lotNumber));
    (orders || []).forEach((ord) => {
      (ord?.items || []).forEach((item) => {
        if (item.lotNumber && supplierLotNumbers.has(item.lotNumber)) {
          linkedOrders.push({
            order: ord,
            lotNumber: item.lotNumber,
            productName: item.productName,
            qty: item.quantity,
          });
        }
      });
    });
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-teal-50/90 p-6 rounded-2xl border border-teal-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-teal-100 p-3 rounded-2xl border border-teal-200 text-teal-700 shadow-xs">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              ระบบจัดการซัพพลายเออร์เเละการตรวจสอบย้อนหลัง (Supplier Traceability System)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              จัดเก็บใบอนุญาตฟาร์ม/ซัพพลายเออร์ แผนผังตรวจสอบย้อนหลัง: ซัพพลายเออร์ → Lot รับเข้า → สต็อกสินค้า → บันทึกการขาย
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มซัพพลายเออร์ใหม่</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Supplier Search & List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, ผู้ติดต่อ, เลขใบอนุญาต..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 shadow-xs"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] shadow-2xs">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'cannabis', label: '🌿 กัญชา' },
                { id: 'kratom', label: '🥤 กระท่อม' },
                { id: 'food', label: '🍜 อาหาร' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`flex-1 py-1 rounded-lg font-bold transition text-center ${
                    categoryFilter === cat.id
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredSuppliers.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                ไม่พบข้อมูลซัพพลายเออร์ตรงตามเงื่อนไข
              </div>
            ) : (
              filteredSuppliers.map((s) => {
                const isSelected = selectedSupplier?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSupplier(s)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition relative group ${
                      isSelected
                        ? 'bg-teal-50/90 border-teal-400 shadow-xs ring-1 ring-teal-400/30'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200 font-bold">
                        {s.code}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                            s.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        {/* Edit & Delete Action Buttons */}
                        <button
                          onClick={(e) => handleOpenEditModal(s, e)}
                          title="แก้ไขข้อมูล"
                          className="p-1 text-slate-400 hover:text-teal-700 hover:bg-teal-100 rounded-md transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSupplier(s, e)}
                          title="ลบซัพพลายเออร์"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs mt-1.5">{s.companyName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ผู้ติดต่อ: <span className="font-semibold text-slate-700">{s.contactPerson}</span> ({s.phone})
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.productTypes?.map((pt) => (
                        <span
                          key={pt}
                          className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium border border-slate-200 uppercase"
                        >
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Details & Lot Traceability Map */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          {selectedSupplier ? (
            <div className="space-y-5">
              {/* Header Details */}
              <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-teal-700 font-bold bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                      {selectedSupplier.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ใบอนุญาต: <strong className="text-slate-800">{selectedSupplier.licenseNumber || 'สมบูรณ์'}</strong>
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 mt-1">
                    {selectedSupplier.companyName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">{selectedSupplier.address}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPrintReportModal(true)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-200 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์รายงาน Traceability</span>
                  </button>
                  <button
                    onClick={(e) => handleOpenEditModal(selectedSupplier, e)}
                    className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center space-x-1 border border-teal-200 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>
                </div>
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 text-[10px]">ผู้ติดต่อ:</span>
                  <p className="font-bold text-slate-800">{selectedSupplier.contactPerson}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 text-[10px]">เบอร์โทรศัพท์:</span>
                  <p className="font-mono font-bold text-slate-800">{selectedSupplier.phone}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 text-[10px]">เลขผู้เสียภาษี:</span>
                  <p className="font-mono font-bold text-slate-800">{selectedSupplier.taxId}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 text-[10px]">วันหมดอายุใบอนุญาต:</span>
                  <p className="font-mono font-bold text-amber-700">
                    {selectedSupplier.licenseExpiry || '2026-12-31'}
                  </p>
                </div>
              </div>

              {/* Traceability Flow Map */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>แผนผังการตรวจสอบย้อนหลัง (Lot & Batch Genealogy Trace)</span>
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    พบ {linkedLots.length} Lot รับเข้า
                  </span>
                </div>

                {linkedLots.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                    <Package className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>ยังไม่มีบันทึก Lot รับเข้าสำหรับซัพพลายเออร์รายนี้ในระบบ</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {linkedLots.map((lot) => (
                      <div
                        key={lot.id}
                        className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3 hover:border-teal-300 transition"
                      >
                        {/* Lot Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-lg border border-teal-300">
                              Lot: {lot.lotNumber}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{lot.strain}</span>
                            <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                              COA: {lot.coaNumber}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                            <span className="font-mono">วันที่รับเข้า: {lot.receivedDate}</span>
                            <span
                              className={`px-2 py-0.2 rounded-full font-bold text-[10px] ${
                                lot.status === 'available'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {lot.status}
                            </span>
                          </div>
                        </div>

                        {/* Lot Metrics & Potency */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[10px] block font-sans">THC / CBD %:</span>
                            <span className="font-bold text-emerald-700">
                              THC {lot.thcPercent}% | CBD {lot.cbdPercent}%
                            </span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[10px] block font-sans">ปริมาณรับเข้า:</span>
                            <span className="font-bold text-slate-800">{lot.initialWeightGrams} g</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[10px] block font-sans">คงเหลือปัจจุบัน:</span>
                            <span className="font-bold text-teal-700">{lot.remainingWeightGrams} g</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[10px] block font-sans">แหล่งที่มา:</span>
                            <span className="font-sans text-[11px] font-semibold text-slate-700 truncate block">
                              {lot.originLocation || 'ฟาร์มกัญชาออร์แกนิค'}
                            </span>
                          </div>
                        </div>

                        {/* Associated Sales Orders for this Lot */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                          <span className="text-[11px] font-bold text-slate-700 block">
                            ประวัติการขายออก (Sales Traceability):
                          </span>
                          {linkedOrders.filter((lo) => lo.lotNumber === lot.lotNumber).length === 0 ? (
                            <p className="text-[11px] text-slate-400 font-sans">
                              ยังไม่มีประวัติการจำหน่ายออกจาก Lot นี้
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {linkedOrders
                                .filter((lo) => lo.lotNumber === lot.lotNumber)
                                .map((lo, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center text-[11px] font-mono border-b border-slate-100 last:border-0 py-1"
                                  >
                                    <span className="text-indigo-700 font-bold">{lo.order.orderNo}</span>
                                    <span className="text-slate-700 font-sans">{lo.productName} ({lo.qty}g)</span>
                                    <span className="text-slate-500">{lo.order.customerName || 'ลูกค้าทั่วไป'}</span>
                                    <span className="text-slate-400">
                                      {new Date(lo.order.timestamp).toLocaleDateString('th-TH')}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs font-medium space-y-2">
              <Truck className="w-10 h-10 text-slate-300 mx-auto" />
              <p>คลิกเลือกซัพพลายเออร์จากรายการฝั่งซ้ายเพื่อดูรายละเอียดเเละ Lot Traceability Map</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddEditSupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSupplier}
        supplierToEdit={supplierToEdit}
      />

      {/* Printable Traceability Audit Report Modal */}
      {showPrintReportModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl w-full text-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                  OFFICIAL COMPLIANCE AUDIT REPORT
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                  รายงานตรวจสอบย้อนหลังวัตถุดิบเเละซัพพลายเออร์ (Traceability Audit)
                </h3>
              </div>
              <button
                onClick={() => setShowPrintReportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Print Document Payload */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300 font-sans space-y-4 text-xs text-slate-900">
              <div className="text-center border-b border-slate-300 pb-3 space-y-1">
                <h4 className="font-extrabold text-base">THAI MULTI BUSINESS CENTER</h4>
                <p className="text-[11px] text-slate-600">
                  เอกสารกำกับการตรวจสอบย้อนหลังสมุนไพรควบคุมเเละวัตถุดิบ (GACP / DTAM Compliance)
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  วันที่ออกรายงาน: {new Date().toLocaleString('th-TH')}
                </p>
              </div>

              {/* Supplier Identity */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-sm text-teal-800">
                  ข้อมูลซัพพลายเออร์: {selectedSupplier.companyName} ({selectedSupplier.code})
                </p>
                <p>เลขประจำตัวผู้เสียภาษี: {selectedSupplier.taxId}</p>
                <p>เลขที่ใบอนุญาต: {selectedSupplier.licenseNumber || 'สมบูรณ์'}</p>
                <p>ผู้ติดต่อ: {selectedSupplier.contactPerson} ({selectedSupplier.phone})</p>
                <p>ที่อยู่แปลงปลูก/สถานที่ผลิต: {selectedSupplier.address}</p>
              </div>

              {/* Lots Genealogy Table */}
              <div className="space-y-1">
                <p className="font-bold text-xs text-slate-800">รายการ Lot รับเข้าเเละยอดคงเหลือ:</p>
                <table className="w-full text-left text-[11px] border border-slate-300">
                  <thead className="bg-slate-200 font-bold">
                    <tr>
                      <th className="p-1.5 border border-slate-300">Lot No.</th>
                      <th className="p-1.5 border border-slate-300">สายพันธุ์/สินค้า</th>
                      <th className="p-1.5 border border-slate-300">COA No.</th>
                      <th className="p-1.5 border border-slate-300">รับเข้า (g)</th>
                      <th className="p-1.5 border border-slate-300">คงเหลือ (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedLots.map((l) => (
                      <tr key={l.id} className="border-b border-slate-200">
                        <td className="p-1.5 font-mono font-bold border border-slate-300">{l.lotNumber}</td>
                        <td className="p-1.5 border border-slate-300">{l.strain}</td>
                        <td className="p-1.5 font-mono border border-slate-300">{l.coaNumber}</td>
                        <td className="p-1.5 font-mono border border-slate-300">{l.initialWeightGrams}</td>
                        <td className="p-1.5 font-mono font-bold text-teal-800 border border-slate-300">
                          {l.remainingWeightGrams}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-slate-300 flex justify-between text-[10px] text-slate-500 font-mono">
                <span>ลงชื่อพนักงานผู้รับรอง: ............................................</span>
                <span>ตราประทับสถานประกอบการ</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowPrintReportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>สั่งพิมพ์รายงาน (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
