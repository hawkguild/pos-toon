import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { UnitDefinition } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Scale,
  Layers,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  PackageCheck,
  Sparkles,
} from 'lucide-react';

const CATEGORY_HINT_PRESETS = [
  'น้ำหนัก (Weight)',
  'เครื่องดื่ม / บรรจุภัณฑ์',
  'อาหารครัว',
  'นับชิ้นทั่วไป',
  'แพ็คเกจรวม',
  'สมุนไพร / ยาสูบ',
  'ปริมาตรของเหลว',
  'บริการ / เวลา',
  'ยาและเวชภัณฑ์',
  'อื่นๆ',
];

export const UnitSettings: React.FC = () => {
  const { units, addUnit, updateUnit, deleteUnit, products } = usePOS();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitDefinition | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formSymbol, setFormSymbol] = useState('');
  const [formCategoryHint, setFormCategoryHint] = useState('นับชิ้นทั่วไป');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingUnit(null);
    setFormId('');
    setFormName('');
    setFormSymbol('');
    setFormCategoryHint('นับชิ้นทั่วไป');
    setFormEnabled(true);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (u: UnitDefinition) => {
    setEditingUnit(u);
    setFormId(u.id);
    setFormName(u.name);
    setFormSymbol(u.symbol);
    setFormCategoryHint(u.categoryHint || 'ทั่วไป');
    setFormEnabled(u.enabled);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSymbol.trim()) {
      setFormError('กรุณากรอกชื่อหน่วยนับ และสัญลักษณ์/คำย่อ');
      return;
    }

    if (editingUnit) {
      updateUnit(editingUnit.id, {
        name: formName.trim(),
        symbol: formSymbol.trim(),
        categoryHint: formCategoryHint.trim(),
        enabled: formEnabled,
      });
    } else {
      addUnit({
        id: formId.trim() || undefined,
        name: formName.trim(),
        symbol: formSymbol.trim(),
        categoryHint: formCategoryHint.trim(),
        enabled: formEnabled,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (u: UnitDefinition) => {
    const productCount = (products || []).filter((p) => p.stockUnit === u.id || p.stockUnit === u.symbol).length;
    let confirmMsg = `คุณต้องการลบหน่วยนับ "${u.name}" ใช่หรือไม่?`;
    if (productCount > 0) {
      confirmMsg = `⚠️ มีสินค้าที่ใช้หน่วยนับนี้จำนวน ${productCount} รายการ!\n\nคุณแน่ใจหรือไม่ว่าต้องการลบหน่วยนับ "${u.name}"?`;
    }
    if (window.confirm(confirmMsg)) {
      deleteUnit(u.id);
    }
  };

  const toggleUnitStatus = (u: UnitDefinition) => {
    updateUnit(u.id, { enabled: !u.enabled });
  };

  // Group units by category hint
  const groupedUnits: Record<string, UnitDefinition[]> = {};
  units.forEach((u) => {
    const grp = u.categoryHint || 'ทั่วไป';
    if (!groupedUnits[grp]) groupedUnits[grp] = [];
    groupedUnits[grp].push(u);
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Scale className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              จัดการหน่วยนับสินค้า (Units of Measure - UOM)
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {units.length} หน่วยนับ
            </span>
          </div>
          <p className="text-xs text-slate-500">
            กำหนดหน่วยนับสำหรับตัดสต็อกและแสดงผลในใบเสร็จ (เช่น กรัม, กิโลกรัม, ขวด, จาน, แก้ว, กล่อง, กระป๋อง, ชุด, มวน, ซอง, ลิตร, มล.)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหน่วยนับใหม่</span>
        </button>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {units.map((u) => {
          const productCount = (products || []).filter(
            (p) => p.stockUnit === u.id || p.stockUnit === u.symbol
          ).length;

          return (
            <div
              key={u.id}
              className={`bg-white border rounded-2xl p-4 shadow-xs transition hover:shadow-sm space-y-2.5 flex flex-col justify-between ${
                u.enabled ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-extrabold flex items-center justify-center text-sm font-mono shadow-2xs">
                    {u.symbol}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-extrabold text-xs text-slate-900">{u.name}</h4>
                      {!u.enabled && (
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                          ปิด
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono font-bold">
                        รหัส: {u.id}
                      </span>
                      {u.categoryHint && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                          {u.categoryHint}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => toggleUnitStatus(u)}
                    title={u.enabled ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                    className="p-1 text-slate-400 hover:text-slate-700 transition rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    {u.enabled ? (
                      <ToggleRight className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(u)}
                    title="แก้ไขหน่วยนับ"
                    className="p-1 text-indigo-600 hover:bg-indigo-50 transition rounded-md cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    title="ลบหน่วยนับ"
                    className="p-1 text-rose-500 hover:bg-rose-50 transition rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>ใช้งานในคลัง:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                  {productCount} รายการ
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Unit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Scale className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {editingUnit ? 'แก้ไขหน่วยนับสินค้า' : 'เพิ่มหน่วยนับสินค้าใหม่'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {editingUnit ? `รหัสหน่วยนับ: ${editingUnit.id}` : 'สร้างหน่วยนับสำหรับสต็อกและการคำนวณราคา'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ชื่อหน่วยนับแสดงผล (Full Name) <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingUnit && !formSymbol) {
                      setFormSymbol(e.target.value.split(' ')[0]);
                    }
                    if (!editingUnit && !formId) {
                      setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                    }
                  }}
                  placeholder="เช่น แก้ว (Cup), กระป๋อง (Can), กล่อง (Box)"
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-bold focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    สัญลักษณ์ / คำย่อ (Symbol) <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    placeholder="เช่น แก้ว, กล่อง, pack, kg"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-bold font-mono focus:bg-white focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รหัสอ้างอิง (ID / Code):
                  </label>
                  <input
                    type="text"
                    disabled={!!editingUnit}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="เช่น cup, can, box, kg"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:bg-white focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Category Hint with Presets */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ประเภทหน่วยนับ (Category Hint):
                </label>
                <input
                  type="text"
                  value={formCategoryHint}
                  onChange={(e) => setFormCategoryHint(e.target.value)}
                  placeholder="เช่น เครื่องดื่ม, อาหาร, บรรจุภัณฑ์"
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 mb-2 focus:bg-white focus:border-blue-500 font-medium"
                />
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_HINT_PRESETS.map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => setFormCategoryHint(hint)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition cursor-pointer ${
                        formCategoryHint === hint
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="unitEnabled"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="unitEnabled" className="font-bold text-slate-700 cursor-pointer">
                  เปิดใช้งานสำหรับสินค้าในคลัง
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUnit ? 'บันทึกการแก้ไข' : 'บันทึกหน่วยนับ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
