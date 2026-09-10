import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { getBusinessBadgeStyle } from '../../utils/businessColorUtils';
import { AddEditProductModal } from './AddEditProductModal';
import { ManagerAuthModal } from '../common/ManagerAuthModal';
import {
  Package,
  Leaf,
  Coffee,
  Utensils,
  Search,
  Plus,
  AlertTriangle,
  History,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  Trash2,
  ImageIcon,
  RefreshCw,
  Store,
  Lock,
  Key,
  ShieldAlert,
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const {
    products,
    updateProduct,
    deleteProduct,
    adjustStock,
    stockMovements,
    currentUser,
    isSyncing,
    pendingSyncCount,
    lastSyncTime,
    businesses,
    units,
  } = usePOS();

  const isCashier = currentUser?.role === 'cashier';
  const [isManagerUnlocked, setIsManagerUnlocked] = useState(false);
  const [showManagerUnlockModal, setShowManagerUnlockModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'out_of_stock' | 'disabled' | 'low_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit Product Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [productToEditModal, setProductToEditModal] = useState<Product | null>(null);

  // Stock Adjustment Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newQty, setNewQty] = useState<number>(0);
  const [reason, setReason] = useState('สินค้าเสียหาย/ชื้น');

  // Status Counters
  const totalCount = (products || []).length;
  const availableCount = (products || []).filter((p) => p.status === 'available' && p.stockQuantity > 0).length;
  const outOfStockCount = (products || []).filter((p) => p.status === 'out_of_stock' || p.stockQuantity <= 0).length;
  const disabledCount = (products || []).filter((p) => p.status === 'disabled').length;
  const lowStockCount = (products || []).filter(
    (p) => p.status !== 'disabled' && p.status !== 'out_of_stock' && p.stockQuantity > 0 && p.stockQuantity < p.minStockAlert
  ).length;

  const filteredProducts = (products || []).filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    const isOut = p.status === 'out_of_stock' || p.stockQuantity <= 0;
    const isDisabled = p.status === 'disabled';
    const isLow = !isOut && !isDisabled && p.stockQuantity < p.minStockAlert;

    let matchesStatus = true;
    if (selectedStatus === 'available') {
      matchesStatus = p.status === 'available' && p.stockQuantity > 0;
    } else if (selectedStatus === 'out_of_stock') {
      matchesStatus = isOut;
    } else if (selectedStatus === 'disabled') {
      matchesStatus = isDisabled;
    } else if (selectedStatus === 'low_stock') {
      matchesStatus = isLow;
    }

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setProductToEditModal(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setProductToEditModal(prod);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteProduct = (prod: Product) => {
    if (window.confirm(`คุณต้องการลบรายการเมนู/สินค้า "${prod.name}" ใช่หรือไม่?`)) {
      deleteProduct(prod.id);
    }
  };

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!reason.trim()) {
      alert('กรุณาระบุเหตุผลการปรับปรุงสต็อก (Mandatory Reason)');
      return;
    }

    adjustStock(
      editingProduct.id,
      newQty,
      reason,
      editingProduct.cannabisDetails?.activeLotId
    );

    setEditingProduct(null);
    alert('ปรับปรุงสต็อกเเละบันทึก Audit Log เรียบร้อยแล้ว');
  };

  // Helper to find unit display
  const getUnitSymbol = (unitKey: string) => {
    const found = units.find((u) => u.id === unitKey || u.symbol === unitKey);
    return found ? found.symbol : unitKey;
  };

  // Helper to find business details
  const getBusinessInfo = (bizKey: string) => {
    const found = businesses.find((b) => b.id === bizKey);
    if (found) return found;
    return {
      id: bizKey,
      name: bizKey,
      icon: '📦',
      color: 'slate',
    };
  };

  if (isCashier && !isManagerUnlocked) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 my-8 space-y-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-slate-100 text-slate-700 rounded-3xl flex items-center justify-center mx-auto border-2 border-slate-300 shadow-xs">
            <Lock className="w-10 h-10 text-slate-600" />
          </div>

          <div className="space-y-2">
            <span className="text-xs bg-slate-100 text-slate-900 font-extrabold px-3 py-1 rounded-full border border-slate-300">
              🔒 สิทธิ์การเข้าถึงถูกจำกัด (Cashier Access Restricted)
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              ระบบคลังสินค้า & ปรับสต็อกสินค้า
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              ตามระเบียบข้อที่ 1 และ 4: สิทธิ์พนักงานแคชเชียร์ <strong>ห้ามแก้ไขราคาสินค้า, สร้างสินค้าใหม่, หรือจัดการคลังสินค้า</strong>
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 text-left space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>การขออนุมัติจากผู้จัดการ (Manager Authorization)</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              หากมีความจำเป็นต้องตรวจนับสต็อกหรือแก้ไขสินค้า กรุณาให้ <strong>ผู้จัดการร้าน (Manager)</strong>, <strong>เจ้าหน้าที่คลัง (Warehouse)</strong> หรือ <strong>Super Admin</strong> ใส่รหัส PIN เพื่อปลดล็อก
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setShowManagerUnlockModal(true)}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/30 transition cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>ใส่รหัส PIN ผู้จัดการเพื่อปลดล็อกชั่วคราว</span>
            </button>
          </div>
        </div>

        <ManagerAuthModal
          isOpen={showManagerUnlockModal}
          onClose={() => setShowManagerUnlockModal(false)}
          onSuccess={() => {
            setIsManagerUnlocked(true);
          }}
          actionTitle="ขออนุมัติจัดการคลังสินค้า (Inventory Authorization)"
          actionDescription="ตามกฎข้อที่ 1 และ 4: แคชเชียร์ห้ามจัดการคลังสินค้าหรือแก้ไขราคาสินค้า ยกเว้นได้รับอนุมัติจากผู้จัดการร้าน"
          requiredRoleLabel="ผู้จัดการร้าน (Manager) หรือ Admin"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 p-3 rounded-2xl border border-indigo-200 text-indigo-700">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              ระบบคลังสินค้าเเละจัดการเมนู (Multi-Business Warehouse & Menu Management)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              จัดกลุ่มคลังสินค้าตามประเภทธุรกิจ ({businesses.filter((b) => b.enabled).map((b) => `${b.icon || '📦'} ${b.name}`).join(' | ')}) พร้อมระบบเพิ่มเมนู ปรับสต็อก และตัดยอดอัตโนมัติ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มเมนู/สินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            selectedStatus === 'all'
              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>ทั้งหมด</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('available')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            selectedStatus === 'available'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50/50'
          }`}
        >
          <span>🟢 พร้อมขาย</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedStatus === 'available' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {availableCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('out_of_stock')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            selectedStatus === 'out_of_stock'
              ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50/50'
          }`}
        >
          <span>🔴 สินค้าหมด</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedStatus === 'out_of_stock' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'}`}>
            {outOfStockCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('disabled')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            selectedStatus === 'disabled'
              ? 'bg-slate-600 border-slate-600 text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>⚪ ระงับการขาย</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedStatus === 'disabled' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {disabledCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('low_stock')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            selectedStatus === 'low_stock'
              ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50/50'
          }`}
        >
          <span>⚠️ สต็อกต่ำ</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedStatus === 'low_stock' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
            {lowStockCount}
          </span>
        </button>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ทั้งหมด ({products.length})
          </button>

          {businesses
            .filter((b) => b.enabled)
            .map((b) => {
              const count = products.filter((p) => p.category === b.id).length;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedCategory(b.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    selectedCategory === b.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{b.icon || '📦'}</span>
                  <span>{b.shortName || b.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">SKU / รหัส</th>
                <th className="p-3">ชื่อสินค้า / เมนู</th>
                <th className="p-3">ประเภทธุรกิจ</th>
                <th className="p-3 text-right">ราคาขาย</th>
                <th className="p-3 text-right">ต้นทุน</th>
                <th className="p-3 text-right">คงเหลือ</th>
                <th className="p-3 text-center">สถานะ</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isOut = prod.status === 'out_of_stock' || prod.stockQuantity <= 0;
                  const isDisabled = prod.status === 'disabled';
                  const isLow = !isOut && !isDisabled && prod.stockQuantity < prod.minStockAlert;
                  const bizInfo = getBusinessInfo(prod.category);
                  const badgeStyle = getBusinessBadgeStyle(bizInfo.color);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-slate-600 text-[11px]">
                        {prod.code}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 text-base">
                              {bizInfo.icon || '📦'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{prod.name}</div>
                            {prod.subcategory && (
                              <div className="text-[10px] text-slate-400 font-medium">
                                {prod.subcategory}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeStyle}`}>
                          <span>{bizInfo.icon || '📦'}</span>
                          <span>{bizInfo.name}</span>
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                        ฿{prod.price.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        ฿{prod.cost.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-sm text-slate-900">
                        {prod.stockQuantity} {getUnitSymbol(prod.stockUnit)}
                      </td>
                      <td className="p-3 text-center">
                        <select
                          value={prod.status || (isOut ? 'out_of_stock' : 'available')}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'available' | 'out_of_stock' | 'disabled';
                            updateProduct(prod.id, { status: newStatus });
                          }}
                          className={`px-2 py-1 rounded-xl text-[11px] font-bold border cursor-pointer focus:outline-none transition shadow-2xs ${
                            isDisabled
                              ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                              : isOut
                              ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          }`}
                          title="ปรับเปลี่ยนสถานะสต็อกได้ทันที"
                        >
                          <option value="available">🟢 พร้อมขาย {isLow ? '(สต็อกต่ำ)' : ''}</option>
                          <option value="out_of_stock">🔴 สินค้าหมด (Out of stock)</option>
                          <option value="disabled">⚪ ระงับการขาย (Disabled)</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            title="แก้ไขรายละเอียดและรูปภาพเมนู"
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-indigo-200 inline-flex items-center space-x-1 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setNewQty(prod.stockQuantity);
                            }}
                            title="ปรับจำนวนสต็อก"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 inline-flex items-center space-x-1 transition cursor-pointer"
                          >
                            <Package className="w-3.5 h-3.5 text-slate-600" />
                            <span>ปรับสต็อก</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            title="ลบรายการสินค้า"
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1 rounded-lg text-xs font-semibold border border-rose-200 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 text-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <span>ปรับปรุงจำนวนสต็อกสินค้า (Stock Adjustment)</span>
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{editingProduct.name}</div>
              <div className="text-slate-500 font-mono text-[11px]">SKU: {editingProduct.code}</div>
              <div className="text-slate-600 font-bold">
                สต็อกปัจจุบัน: {editingProduct.stockQuantity} {getUnitSymbol(editingProduct.stockUnit)}
              </div>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  จำนวนคงเหลือใหม่ที่นับได้ (New Physical Quantity):
                </label>
                <input
                  type="number"
                  min="0"
                  value={newQty}
                  onChange={(e) => setNewQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white text-slate-900 font-mono font-bold text-base p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  เหตุผลในการปรับปรุงยอดสต็อก (Mandatory Audit Reason):
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ตรวจนับสต็อกประจำงวด (Stock Count)">ตรวจนับสต็อกประจำงวด (Stock Count)</option>
                  <option value="สินค้าเสียหาย / แตกหัก / เสื่อมสภาพ">สินค้าเสียหาย / แตกหัก / เสื่อมสภาพ</option>
                  <option value="สินค้าหมดอายุ (Expired)">สินค้าหมดอายุ (Expired)</option>
                  <option value="สูญหาย / คลาดเคลื่อนจากหน้าร้าน">สูญหาย / คลาดเคลื่อนจากหน้าร้าน</option>
                  <option value="รับสินค้าเพิ่มจากซัพพลายเออร์">รับสินค้าเพิ่มจากซัพพลายเออร์</option>
                  <option value="ใช้ชิม / ตัวอย่างสาธิต (Sample/Testing)">ใช้ชิม / ตัวอย่างสาธิต (Sample/Testing)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center space-x-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกยอดสต็อก</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AddEditProductModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        productToEdit={productToEditModal}
      />
    </div>
  );
};
