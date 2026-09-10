import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CustomBusiness } from '../../types';
import { BUSINESS_COLORS, getBusinessBadgeStyle, getBusinessStyle } from '../../utils/businessColorUtils';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Store,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  FileText,
  Tag,
  ToggleLeft,
  ToggleRight,
  Info,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';

interface PresetCategory {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  licenseFieldLabel?: string;
  licenseValue?: string;
}

const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'cannabis',
    name: 'กัญชาทางการแพทย์ (Medical Cannabis)',
    shortName: 'กัญชา',
    icon: '🌿',
    color: 'emerald',
    description: 'ช่อดอก, น้ำมันสกัด, โรลสำเร็จรูป, อุปกรณ์ และสมุนไพรควบคุม',
    licenseFieldLabel: 'ใบอนุญาตจำหน่ายสมุนไพรควบคุม (กัญชา)',
    licenseValue: 'นภ.102/2569',
  },
  {
    id: 'kratom',
    name: 'กระท่อม & เครื่องดื่มแปรรูป (Kratom)',
    shortName: 'กระท่อม',
    icon: '🥤',
    color: 'blue',
    description: 'น้ำกระท่อมต้มพร้อมดื่ม, ใบสด, และผลิตภัณฑ์แปรรูป',
    licenseFieldLabel: 'เลขสารบบอาหาร อย. (กระท่อม)',
    licenseValue: 'อย. 10-1-08869-5-0012',
  },
  {
    id: 'general',
    name: 'สินค้าทั่วไป & เบ็ดเตล็ด (General Goods)',
    shortName: 'สินค้าทั่วไป',
    icon: '📦',
    color: 'purple',
    description: 'ของใช้, บรรจุภัณฑ์, อุปกรณ์เสริม, และสินค้าขายปลีกทั่วไป',
    licenseFieldLabel: 'ทะเบียนพาณิชย์ / เลขผู้เสียภาษี',
    licenseValue: '0105568192083',
  },
  {
    id: 'cigarette',
    name: 'บุหรี่ & ผลิตภัณฑ์ยาสูบ (Cigarettes & Tobacco)',
    shortName: 'บุหรี่',
    icon: '🚬',
    color: 'rose',
    description: 'บุหรี่ซอง, ยาเส้น, ไฟแช็ก, กระดาษมวน และอุปกรณ์สำหรับสูบ',
    licenseFieldLabel: 'ใบอนุญาตขายยาสูบ (กรมสรรพสามิต)',
    licenseValue: 'ยส. 102/2569',
  },
  {
    id: 'syrup',
    name: 'ไซรัป & ส่วนผสมเครื่องดื่ม (Syrup & Flavor Mixers)',
    shortName: 'ไซรัป',
    icon: '🧪',
    color: 'amber',
    description: 'ไซรัปแต่งกลิ่น, ฝาแดง, น้ำหวานเข้มข้น, น้ำเชื่อม และสารแต่งกลิ่นรส',
    licenseFieldLabel: 'เลขสารบบ อย. ผลิตภัณฑ์อาหาร/เครื่องดื่ม',
    licenseValue: 'อย. 10-1-08869-5-0088',
  },
  {
    id: 'food',
    name: 'อาหาร & เครื่องดื่มครัว (Food & Kitchen)',
    shortName: 'อาหาร',
    icon: '🍜',
    color: 'orange',
    description: 'อาหารจานเดียว, อาหารตามสั่ง, ขนม, กับแกล้ม และอาหารครัว',
    licenseFieldLabel: 'ใบอนุญาตจัดตั้งสถานที่จำหน่ายอาหาร',
    licenseValue: 'กทม.010556819',
  },
  {
    id: 'cafe',
    name: 'คาเฟ่ & เบเกอรี่ (Cafe & Bakery)',
    shortName: 'คาเฟ่',
    icon: '☕',
    color: 'amber',
    description: 'กาแฟสด, ชาเขียว, ชานม, ขนมปัง, เค้ก และเบเกอรี่',
  },
  {
    id: 'beverage',
    name: 'เครื่องดื่ม & แอลกอฮอล์ (Beverages & Bar)',
    shortName: 'เครื่องดื่ม',
    icon: '🍻',
    color: 'indigo',
    description: 'เบียร์, ไวน์, สุรา, โซดา, น้ำอัดลม และน้ำดื่ม',
    licenseFieldLabel: 'ใบอนุญาตขายสุรา (กรมสรรพสามิต)',
    licenseValue: 'สร. 404/2569',
  },
  {
    id: 'spa',
    name: 'บริการสปา & นวดเพื่อสุขภาพ (Spa & Wellness)',
    shortName: 'สปา/นวด',
    icon: '💆',
    color: 'teal',
    description: 'นวดแผนไทย, นวดน้ำมัน, ประคบสมุนไพร, สปาเท้า และบริการเพื่อสุขภาพ',
    licenseFieldLabel: 'ใบอนุญาตสถานประกอบการเพื่อสุขภาพ',
    licenseValue: 'สบส. 102/2569',
  },
  {
    id: 'pharmacy',
    name: 'ยา & เวชภัณฑ์ (Pharmacy & Health)',
    shortName: 'ยา/เวชภัณฑ์',
    icon: '💊',
    color: 'sky',
    description: 'ยาสามัญประจำบ้าน, วิตามิน, อาหารเสริม และอุปกรณ์ปฐมพยาบาล',
    licenseFieldLabel: 'ใบอนุญาตขายยาแผนปัจจุบัน',
    licenseValue: 'ขย. 204/2569',
  },
];

const EMOJI_PRESETS = [
  '🌿', '🥤', '📦', '🚬', '🧪', '🍜', '☕', '🍻', '💆', '💊',
  '🍯', '🧃', '🍫', '🍓', '🧊', '💨', '🧁', '🥨', '🍰', '👕',
  '🧴', '🛠️', '✂️', '🛍️', '🏋️', '🍇', '🍞', '🚗', '💅', '🐾',
  '🌸', '🍦', '🍣', '🍔', '🍕', '🍵', '🌺', '💈', '📱', '🕯️'
];

export const BusinessCategorySettings: React.FC = () => {
  const { businesses, addBusiness, updateBusiness, deleteBusiness, products } = usePOS();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<CustomBusiness | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<CustomBusiness | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formIcon, setFormIcon] = useState('📦');
  const [formColor, setFormColor] = useState('emerald');
  const [formDescription, setFormDescription] = useState('');
  const [formLicenseLabel, setFormLicenseLabel] = useState('');
  const [formLicenseValue, setFormLicenseValue] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingBusiness(null);
    setFormId('');
    setFormName('');
    setFormShortName('');
    setFormIcon('📦');
    setFormColor('emerald');
    setFormDescription('');
    setFormLicenseLabel('');
    setFormLicenseValue('');
    setFormEnabled(true);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (b: CustomBusiness) => {
    setEditingBusiness(b);
    setFormId(b.id);
    setFormName(b.name);
    setFormShortName(b.shortName || b.name);
    setFormIcon(b.icon || '📦');
    setFormColor(b.color || 'emerald');
    setFormDescription(b.description || '');
    setFormLicenseLabel(b.licenseFieldLabel || '');
    setFormLicenseValue(b.licenseValue || '');
    setFormEnabled(b.enabled);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleApplyPreset = (preset: PresetCategory) => {
    // Check if category ID already exists
    const exists = businesses.some((b) => b.id === preset.id);
    if (exists) {
      showToast(`หมวดหมู่ "${preset.shortName}" มีอยู่ในระบบแล้ว`);
      return;
    }

    addBusiness({
      id: preset.id,
      name: preset.name,
      shortName: preset.shortName,
      icon: preset.icon,
      color: preset.color,
      description: preset.description,
      licenseFieldLabel: preset.licenseFieldLabel || '',
      licenseValue: preset.licenseValue || '',
      enabled: true,
    });

    showToast(`เพิ่มหมวดการขาย "${preset.shortName}" สำเร็จ!`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('กรุณากรอกชื่อประเภทธุรกิจ');
      return;
    }

    if (editingBusiness) {
      updateBusiness(editingBusiness.id, {
        name: formName.trim(),
        shortName: formShortName.trim() || formName.trim(),
        icon: formIcon,
        color: formColor,
        description: formDescription.trim(),
        licenseFieldLabel: formLicenseLabel.trim(),
        licenseValue: formLicenseValue.trim(),
        enabled: formEnabled,
      });
      showToast(`อัปเดตหมวดการขาย "${formShortName.trim() || formName.trim()}" เรียบร้อยแล้ว`);
    } else {
      const added = addBusiness({
        id: formId.trim() || undefined,
        name: formName.trim(),
        shortName: formShortName.trim() || formName.trim(),
        icon: formIcon,
        color: formColor,
        description: formDescription.trim(),
        licenseFieldLabel: formLicenseLabel.trim(),
        licenseValue: formLicenseValue.trim(),
        enabled: formEnabled,
      });
      showToast(`เพิ่มหมวดการขาย "${added.shortName || added.name}" เรียบร้อยแล้ว`);
    }

    setIsAddModalOpen(false);
  };

  const openDeleteModal = (b: CustomBusiness) => {
    setBusinessToDelete(b);
    // Find default target to reassign if other businesses exist
    const otherBiz = businesses.find((x) => x.id !== b.id);
    setReassignTargetId(otherBiz ? otherBiz.id : 'none');
  };

  const confirmDeleteBusiness = () => {
    if (!businessToDelete) return;
    const deletedName = businessToDelete.shortName || businessToDelete.name;
    const targetReassign = reassignTargetId !== 'none' ? reassignTargetId : undefined;

    deleteBusiness(businessToDelete.id, targetReassign);
    showToast(`ลบหมวดการขาย "${deletedName}" เรียบร้อยแล้ว`);
    setBusinessToDelete(null);
  };

  const toggleBusinessStatus = (b: CustomBusiness) => {
    updateBusiness(b.id, { enabled: !b.enabled });
    showToast(`${!b.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} หมวด "${b.shortName || b.name}" แล้ว`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between shadow-md text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Store className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              จัดการหมวดการขาย & ประเภทธุรกิจ (Sales Categories)
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {businesses.length} หมวด
            </span>
          </div>
          <p className="text-xs text-slate-500">
            เพิ่ม ลบ หรือแก้ไขหมวดการขาย (เช่น กัญชา, กระท่อม, สินค้าทั่วไป, บุหรี่, ไซรัป, อาหาร ฯลฯ) เพื่อใช้แยกปุ่มใน POS และคลังสินค้า
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/20 flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มหมวดการขายใหม่</span>
        </button>
      </div>

      {/* Quick Add Presets Carousel / Badges */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/70 border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-extrabold text-xs text-slate-800">
              แม่แบบหมวดหมู่ยอดนิยม (กดเพื่อเพิ่มเข้าสู่ระบบทันที):
            </span>
          </div>
          <span className="text-[11px] text-slate-500">คลิกที่ปุ่มเพื่อเพิ่ม 1-Click</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_CATEGORIES.map((preset) => {
            const isAlreadyAdded = businesses.some((b) => b.id === preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  isAlreadyAdded
                    ? 'bg-white/90 text-slate-500 border-slate-200 opacity-70 hover:opacity-100 shadow-2xs'
                    : 'bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-sm active:scale-95'
                }`}
                title={isAlreadyAdded ? `มีหมวด "${preset.shortName}" ในระบบแล้ว` : `กดเพื่อเพิ่มหมวด "${preset.shortName}"`}
              >
                <span className="text-base">{preset.icon}</span>
                <span>{preset.shortName}</span>
                {isAlreadyAdded ? (
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                    มีแล้ว
                  </span>
                ) : (
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold border border-emerald-300">
                    + เพิ่ม
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businesses.map((b) => {
          const productCount = (products || []).filter((p) => p.category === b.id).length;
          const badgeStyle = getBusinessBadgeStyle(b.color);

          return (
            <div
              key={b.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs transition hover:shadow-md space-y-3 relative ${
                b.enabled ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-center w-12 h-12">
                    {b.icon || '📦'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{b.name}</h4>
                      {!b.enabled && (
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          ปิดใช้งานใน POS
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        ID: {b.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeStyle}`}>
                        {BUSINESS_COLORS[b.color]?.name?.split(' ')[0] || b.color}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        สินค้า {productCount} รายการ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => toggleBusinessStatus(b)}
                    title={b.enabled ? 'คลิกเพื่อปิดใช้งานใน POS' : 'คลิกเพื่อเปิดใช้งานใน POS'}
                    className="p-1.5 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    {b.enabled ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(b)}
                    title="แก้ไขข้อมูลหมวดหมู่"
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 transition rounded-lg cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(b)}
                    title="ลบหมวดการขายนี้"
                    className="p-1.5 text-rose-500 hover:bg-rose-50 transition rounded-lg cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {b.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {b.description}
                </p>
              )}

              {(b.licenseFieldLabel || b.licenseValue) && (
                <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80 text-xs flex items-center justify-between text-emerald-950">
                  <span className="font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{b.licenseFieldLabel || 'เลขที่ใบอนุญาต'}:</span>
                  </span>
                  <span className="font-mono font-bold text-[11px] text-emerald-800">
                    {b.licenseValue || '-'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{formIcon}</span>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {editingBusiness ? 'แก้ไขหมวดการขาย' : 'เพิ่มหมวดการขายใหม่'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {editingBusiness ? `รหัสธุรกิจ: ${editingBusiness.id}` : 'สร้างหมวดหมู่ธุรกิจใหม่สำหรับร้านค้าของคุณ'}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อหมวดการขาย (Full Name) <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!editingBusiness && !formShortName) {
                        setFormShortName(e.target.value);
                      }
                      if (!editingBusiness && !formId) {
                        setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                      }
                    }}
                    placeholder="เช่น บุหรี่ & ยาสูบ หรือ ไซรัปแต่งกลิ่น"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-bold focus:bg-white focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อสั้นปุ่ม POS:
                  </label>
                  <input
                    type="text"
                    value={formShortName}
                    onChange={(e) => setFormShortName(e.target.value)}
                    placeholder="เช่น บุหรี่ หรือ ไซรัป"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-bold focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รหัสอ้างอิงระบบ (Slug / ID) {editingBusiness && '(ไม่สามารถแก้ไข ID หลักได้)'}:
                </label>
                <input
                  type="text"
                  disabled={!!editingBusiness}
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  placeholder="เช่น cigarette, syrup, cannabis, kratom, general"
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:bg-white focus:border-emerald-500 disabled:opacity-60"
                />
              </div>

              {/* Emoji Icon Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ไอคอน / สัญลักษณ์ Emoji:
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="📦"
                    className="w-16 text-center text-xl bg-slate-50 p-2 rounded-xl border border-slate-300"
                    maxLength={4}
                  />
                  <span className="text-[11px] text-slate-500">
                    เลือกจากปุ่มลัดด้านล่าง หรือพิมพ์ Emoji ที่ต้องการ:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-24 overflow-y-auto">
                  {EMOJI_PRESETS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setFormIcon(em)}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition cursor-pointer ${
                        formIcon === em
                          ? 'bg-emerald-500 text-white shadow-xs scale-110'
                          : 'hover:bg-white hover:shadow-2xs text-slate-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  โทนสีประจำธุรกิจ (Theme Color):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(BUSINESS_COLORS).map(([key, opt]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormColor(key)}
                      className={`p-2 rounded-xl border flex items-center space-x-2 transition cursor-pointer text-left ${
                        formColor === key
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${opt.dotBg}`} />
                      <span className="text-[11px] font-bold truncate">{opt.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ตัวอย่างปุ่มบนหน้า POS (Live Button Preview):
                </span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center space-x-2 ${getBusinessStyle(
                      formColor,
                      true
                    )}`}
                  >
                    <span className="text-base">{formIcon || '📦'}</span>
                    <span>{formShortName || formName || 'ชื่อหมวดหมู่'}</span>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 bg-white border-slate-200 text-slate-700`}
                  >
                    <span className="text-sm">{formIcon || '📦'}</span>
                    <span>{formShortName || formName || 'ชื่อหมวดหมู่'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  คำอธิบายเพิ่มเติม / รายละเอียดสินค้าในกลุ่มนี้:
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="เช่น บุหรี่ซอง, ยาเส้น, ไฟแช็ก, ไซรัปฝาแดง, ส่วนผสมเครื่องดื่ม"
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:border-emerald-500 font-medium"
                />
              </div>

              {/* License Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">
                    ชื่อหัวข้อใบอนุญาต (ถ้ามี):
                  </label>
                  <input
                    type="text"
                    value={formLicenseLabel}
                    onChange={(e) => setFormLicenseLabel(e.target.value)}
                    placeholder="เช่น ใบอนุญาตขายยาสูบ หรือ เลข อย."
                    className="w-full bg-white text-slate-900 p-2 rounded-xl border border-emerald-300 text-xs focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-950 mb-1">
                    เลขที่ใบอนุญาต / เลข อย.:
                  </label>
                  <input
                    type="text"
                    value={formLicenseValue}
                    onChange={(e) => setFormLicenseValue(e.target.value)}
                    placeholder="เช่น ยส. 102/2569 หรือ อย. 10-1-08869-5-0088"
                    className="w-full bg-white text-slate-900 p-2 rounded-xl border border-emerald-300 font-mono text-xs focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="bizEnabled"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="bizEnabled" className="font-bold text-slate-700 cursor-pointer">
                  เปิดใช้งานในเมนูขายสินค้า (POS) เเละคลังสินค้า
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingBusiness ? 'บันทึกการแก้ไข' : 'บันทึกหมวดการขาย'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {businessToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-2 border-rose-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 pb-2 border-b border-rose-100">
              <div className="p-2.5 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  ยืนยันการลบหมวดการขาย
                </h3>
                <p className="text-[11px] text-slate-500">Category Deletion & Reassignment</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-center w-12 h-12">
                  {businessToDelete.icon || '📦'}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {businessToDelete.name} ({businessToDelete.shortName || businessToDelete.id})
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {businessToDelete.id}
                  </div>
                </div>
              </div>

              {/* Product Impact Check */}
              {(() => {
                const affectedProducts = (products || []).filter(
                  (p) => p.category === businessToDelete.id
                );
                const count = affectedProducts.length;

                return count > 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                    <div className="font-bold flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>พบสินค้าในหมวดนี้ {count} รายการ</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      กรุณาเลือกวิธีการจัดการสินค้าที่มีอยู่ในหมวดนี้:
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {businesses
                        .filter((b) => b.id !== businessToDelete.id)
                        .map((target) => (
                          <label
                            key={target.id}
                            className="flex items-center space-x-2 p-1.5 bg-white rounded-lg border border-amber-200 cursor-pointer text-xs"
                          >
                            <input
                              type="radio"
                              name="reassign"
                              value={target.id}
                              checked={reassignTargetId === target.id}
                              onChange={(e) => setReassignTargetId(e.target.value)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-base">{target.icon || '📦'}</span>
                            <span className="font-bold text-slate-800">
                              ย้ายสินค้าทั้งหมด ({count} รายการ) ไปหมวด "{target.shortName || target.name}"
                            </span>
                          </label>
                        ))}

                      <label className="flex items-center space-x-2 p-1.5 bg-white rounded-lg border border-amber-200 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="reassign"
                          value="none"
                          checked={reassignTargetId === 'none'}
                          onChange={(e) => setReassignTargetId(e.target.value)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-600">
                          ไม่ย้ายหมวดสินค้า (คงรหัสหมวดเดิมไว้ สินค้าจะยังแสดงในหน้ารวม)
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>ไม่มีสินค้าอยู่ในหมวดนี้ สามารถลบได้อย่างปลอดภัย</span>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setBusinessToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteBusiness}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 text-xs flex items-center space-x-1.5 transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบหมวดนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
