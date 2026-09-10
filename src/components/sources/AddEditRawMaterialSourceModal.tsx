import React, { useState, useEffect } from 'react';
import { RawMaterialSource, CultivationType, BusinessCategory } from '../../types';
import { usePOS } from '../../context/POSContext';
import {
  X,
  Sprout,
  MapPin,
  Award,
  FileCheck2,
  Building,
  User,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AddEditRawMaterialSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<RawMaterialSource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  sourceToEdit?: RawMaterialSource | null;
}

const COMMON_CERTIFICATES = [
  'GACP (มาตรฐานการเพาะปลูกและเก็บเกี่ยวสมุนไพรควบคุม)',
  'GAP (การปฏิบัติทางการเกษตรที่ดีสำหรับพืชอาหาร)',
  'Organic Thailand (เกษตรอินทรีย์ มกอช.)',
  'อย. มาตรฐานสารบบอาหาร/แปรรูป',
  'GMP สมุนไพร / กฎหมาย',
  'HACCP / ISO 22000',
  'ใบรับรองแหล่งปลูกสมุนไพรควบคุม กรมการแพทย์แผนไทย',
];

const CULTIVATION_TYPES: { id: CultivationType; label: string; icon: string }[] = [
  { id: 'greenhouse', label: 'โรงเรือนปิดควบคุมสภาพแวดล้อม (Smart Greenhouse)', icon: '🏡' },
  { id: 'indoor_hydroponic', label: 'ปลูกในร่ม / ไฮโดรโปนิกส์ (Indoor Hydroponic)', icon: '💡' },
  { id: 'organic_soil', label: 'ปลูกลงดินแปลงอินทรีย์ธรรมชาติ (Organic Soil Outdoor)', icon: '🌱' },
  { id: 'wild_harvest', label: 'เก็บเกี่ยวตามธรรมชาติ / ป่าอนุรักษ์ (Wild Harvest)', icon: '🌲' },
  { id: 'gap_standard', label: 'แปลงเกษตรปลอดภัยมาตรฐาน GAP', icon: '🌾' },
  { id: 'factory_processed', label: 'โรงงานแปรรูป / โรงสกัดสารมาตรฐาน (Factory Extracted)', icon: '🏭' },
  { id: 'other', label: 'แหล่งกำเนิดอื่นๆ (Other)', icon: '📦' },
];

const QUALITY_GRADES = [
  'Medical Grade AAA (เกรดการแพทย์พรีเมียมสูงสุด)',
  'Medical Grade AA (เกรดการแพทย์มาตรฐาน)',
  'Premium Organic Grade A (อินทรีย์คัดพิเศษ)',
  'Standard Commercial (เกรดพาณิชย์ทั่วไป)',
  'Extract Grade (เกรดสกัดสารสำคัญ)',
  'Fresh Food Grade A (เกรดอาหารสดคุณภาพสูง)',
];

const THAI_PROVINCES = [
  'เชียงใหม่', 'เชียงราย', 'แม่ฮ่องสอน', 'ลำปาง', 'ลำพูน', 'น่าน', 'พะเยา', 'แพร่',
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'พระนครศรีอยุธยา', 'นครปฐม',
  'สุราษฎร์ธานี', 'นครศรีธรรมราช', 'ภูเก็ต', 'สงขลา', 'กระบี่', 'พังงา', 'ชุมพร',
  'นครราชสีมา', 'ขอนแก่น', 'อุบลราชธานี', 'อุดรธานี', 'สกลนคร', 'บุรีรัมย์',
  'ปราจีนบุรี', 'สระแก้ว', 'ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด',
  'กาญจนบุรี', 'ราชบุรี', 'เพชรบุรี', 'ประจวบคีรีขันธ์'
];

export const AddEditRawMaterialSourceModal: React.FC<AddEditRawMaterialSourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sourceToEdit,
}) => {
  const { suppliers = [], businesses = [] } = usePOS();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'cannabis' as BusinessCategory,
    materialName: '',
    cultivationType: 'greenhouse' as CultivationType,
    location: '',
    province: 'เชียงใหม่',
    standardCertificates: [] as string[],
    certNumber: '',
    certExpiryDate: '',
    contactPerson: '',
    phone: '',
    supplierId: '',
    supplierName: '',
    qualityGrade: 'Medical Grade AAA (เกรดการแพทย์พรีเมียมสูงสุด)',
    testLabName: 'กรมวิทยาศาสตร์การแพทย์ กระทรวงสาธารณสุข',
    coaNumber: '',
    status: 'verified' as RawMaterialSource['status'],
    notes: '',
    harvestSeason: 'ฤดูเก็บเกี่ยว Q1/2569',
  });

  const [customCertInput, setCustomCertInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (sourceToEdit) {
      setFormData({
        code: sourceToEdit.code || '',
        name: sourceToEdit.name || '',
        category: sourceToEdit.category || 'cannabis',
        materialName: sourceToEdit.materialName || '',
        cultivationType: sourceToEdit.cultivationType || 'greenhouse',
        location: sourceToEdit.location || '',
        province: sourceToEdit.province || 'เชียงใหม่',
        standardCertificates: sourceToEdit.standardCertificates || [],
        certNumber: sourceToEdit.certNumber || '',
        certExpiryDate: sourceToEdit.certExpiryDate || '',
        contactPerson: sourceToEdit.contactPerson || '',
        phone: sourceToEdit.phone || '',
        supplierId: sourceToEdit.supplierId || '',
        supplierName: sourceToEdit.supplierName || '',
        qualityGrade: sourceToEdit.qualityGrade || 'Medical Grade AAA (เกรดการแพทย์พรีเมียมสูงสุด)',
        testLabName: sourceToEdit.testLabName || 'กรมวิทยาศาสตร์การแพทย์ กระทรวงสาธารณสุข',
        coaNumber: sourceToEdit.coaNumber || '',
        status: sourceToEdit.status || 'verified',
        notes: sourceToEdit.notes || '',
        harvestSeason: sourceToEdit.harvestSeason || 'ฤดูเก็บเกี่ยว Q1/2569',
      });
    } else {
      // Auto generate code
      const randomNo = Math.floor(100 + Math.random() * 900);
      setFormData({
        code: `RMS-${randomNo}`,
        name: '',
        category: 'cannabis',
        materialName: '',
        cultivationType: 'greenhouse',
        location: '',
        province: 'เชียงใหม่',
        standardCertificates: ['GACP (มาตรฐานการเพาะปลูกและเก็บเกี่ยวสมุนไพรควบคุม)'],
        certNumber: `GACP-TH-2569-${randomNo}`,
        certExpiryDate: '2028-12-31',
        contactPerson: '',
        phone: '',
        supplierId: suppliers[0]?.id || '',
        supplierName: suppliers[0]?.companyName || '',
        qualityGrade: 'Medical Grade AAA (เกรดการแพทย์พรีเมียมสูงสุด)',
        testLabName: 'กรมวิทยาศาสตร์การแพทย์ กระทรวงสาธารณสุข',
        coaNumber: `COA-TH-2026-${randomNo}`,
        status: 'verified',
        notes: '',
        harvestSeason: 'ฤดูเก็บเกี่ยวรอบปัจจุบัน 2569',
      });
    }
    setErrors({});
  }, [sourceToEdit, isOpen, suppliers]);

  if (!isOpen) return null;

  const handleSupplierChange = (supId: string) => {
    const found = suppliers.find((s) => s.id === supId);
    setFormData((prev) => ({
      ...prev,
      supplierId: supId,
      supplierName: found?.companyName || '',
    }));
  };

  const toggleCertificate = (cert: string) => {
    setFormData((prev) => {
      const exists = prev.standardCertificates.includes(cert);
      if (exists) {
        return { ...prev, standardCertificates: prev.standardCertificates.filter((c) => c !== cert) };
      } else {
        return { ...prev, standardCertificates: [...prev.standardCertificates, cert] };
      }
    });
  };

  const handleAddCustomCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCertInput.trim() && !formData.standardCertificates.includes(customCertInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        standardCertificates: [...prev.standardCertificates, customCertInput.trim()],
      }));
      setCustomCertInput('');
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) errs.name = 'กรุณาระบุชื่อฟาร์ม / แหล่งปลูก / ผู้ผลิต';
    if (!formData.code.trim()) errs.code = 'กรุณาระบุรหัสแหล่งวัตถุดิบ';
    if (!formData.materialName.trim()) errs.materialName = 'กรุณาระบุชนิดวัตถุดิบหลัก';
    if (!formData.location.trim()) errs.location = 'กรุณาระบุที่ตั้งแปลงปลูก/สถานที่ผลิต';
    if (!formData.contactPerson.trim()) errs.contactPerson = 'กรุณาระบุชื่อผู้ดูแลหรือผู้ติดต่อ';
    if (!formData.phone.trim()) errs.phone = 'กรุณาระบุเบอร์โทรศัพท์ติดต่อ';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {sourceToEdit ? 'แก้ไขบันทึกแหล่งที่มาวัตถุดิบ' : 'บันทึกแหล่งที่มาวัตถุดิบใหม่ (Traceability Origin)'}
              </h2>
              <p className="text-xs text-emerald-200/80">
                ระบบตรวจสอบย้อนกลับแหล่งกำเนิดวัตถุดิบ มาตรฐานกระทรวงสาธารณสุขและเกษตร B.E. 2569
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Basic Info */}
          <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>ข้อมูลพื้นฐานแหล่งวัตถุดิบ / ฟาร์มต้นกำเนิด</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Source Code */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสแหล่งวัตถุดิบ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="เช่น RMS-CNB-001"
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.code ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>}
              </div>

              {/* Source Name */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อฟาร์ม / แหล่งปลูก / ผู้ผลิต <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น ฟาร์มกัญชาออร์แกนิคแม่ริม เชียงใหม่"
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              {/* Business Category */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมวดหมู่ธุรกิจ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as BusinessCategory })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cannabis">🌿 กัญชาทางการแพทย์ (Cannabis)</option>
                  <option value="kratom">🥤 กระท่อม & เครื่องดื่ม (Kratom)</option>
                  <option value="food">🍜 อาหาร & เครื่องดื่มครัว (Food)</option>
                  <option value="general">📦 สินค้าทั่วไป / อุปกรณ์ (General)</option>
                  {businesses.filter((b) => !['cannabis', 'kratom', 'food', 'general'].includes(b.id)).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.icon} {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Name */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อชนิดวัตถุดิบหลัก / สายพันธุ์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  placeholder="เช่น ช่อดอกกัญชาแห้งสายพันธุ์ KD Koh Tao, ใบกระท่อมสดก้านแดง"
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.materialName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.materialName && <p className="text-[11px] text-rose-500 mt-1">{errors.materialName}</p>}
              </div>

              {/* Cultivation Type */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รูปแบบการเพาะปลูก / แหล่งผลิต
                </label>
                <select
                  value={formData.cultivationType}
                  onChange={(e) => setFormData({ ...formData, cultivationType: e.target.value as CultivationType })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {CULTIVATION_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality Grade */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เกรดคุณภาพ (Quality Grade)
                </label>
                <select
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {QUALITY_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Location & Contact */}
          <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>สถานที่ตั้งแปลงปลูก และข้อมูลผู้ดูแล</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Province */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  จังหวัด <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {THAI_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address / Location details */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ที่ตั้งแปลงปลูก / โรงเรือน (ตำบล, อำเภอ, พิกัด) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="เช่น 128 ม.3 ต.แม่แรม อ.แม่ริม"
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                    errors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.location && <p className="text-[11px] text-rose-500 mt-1">{errors.location}</p>}
              </div>

              {/* Contact Person */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อผู้ดูแลแปลง / ผู้ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="เช่น คุณธนภัทร สุขเกษม"
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                      errors.contactPerson ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.contactPerson && <p className="text-[11px] text-rose-500 mt-1">{errors.contactPerson}</p>}
              </div>

              {/* Phone */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="เช่น 089-111-2233"
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                      errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Linked Supplier */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เชื่อมโยงกับซัพพลายเออร์ (Supplier)
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- ไม่ระบุซัพพลายเออร์ --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Harvest Season */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รอบการเก็บเกี่ยว / ฤดูกาล
                </label>
                <input
                  type="text"
                  value={formData.harvestSeason}
                  onChange={(e) => setFormData({ ...formData, harvestSeason: e.target.value })}
                  placeholder="เช่น ฤดูเก็บเกี่ยว Q1/2569 หรือ เก็บเกี่ยวทุก 15 วัน"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Standards, Certifications & Lab Test */}
          <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>มาตรฐานการรับรองแปลง & ผลตรวจวิเคราะห์ห้องปฏิบัติการ</span>
            </h3>

            {/* Standard Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                มาตรฐานการเพาะปลูก/รับรองคุณภาพที่ได้รับ
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_CERTIFICATES.map((cert) => {
                  const isChecked = formData.standardCertificates.includes(cert);
                  return (
                    <button
                      type="button"
                      key={cert}
                      onClick={() => toggleCertificate(cert)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{cert}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Cert */}
              <div className="mt-3 flex items-center space-x-2">
                <input
                  type="text"
                  value={customCertInput}
                  onChange={(e) => setCustomCertInput(e.target.value)}
                  placeholder="เพิ่มมาตรฐานอื่นๆ..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCert}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
                >
                  + เพิ่มมาตรฐาน
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
              {/* Certificate Number */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลขที่ใบรับรอง / เลขแปลง GAP/GACP
                </label>
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.certNumber}
                    onChange={(e) => setFormData({ ...formData, certNumber: e.target.value })}
                    placeholder="เช่น GACP-CM-2569-0118"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Certificate Expiry */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วันหมดอายุใบรับรอง
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={formData.certExpiryDate}
                    onChange={(e) => setFormData({ ...formData, certExpiryDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Lab Name */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อห้องปฏิบัติการตรวจวิเคราะห์ (Testing Lab)
                </label>
                <div className="relative">
                  <FlaskConical className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.testLabName}
                    onChange={(e) => setFormData({ ...formData, testLabName: e.target.value })}
                    placeholder="เช่น กรมวิทยาศาสตร์การแพทย์, Central Lab"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* COA Number */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลขที่ผลวิเคราะห์ COA ประจำแหล่ง
                </label>
                <input
                  type="text"
                  value={formData.coaNumber}
                  onChange={(e) => setFormData({ ...formData, coaNumber: e.target.value })}
                  placeholder="เช่น COA-TH-2026-881"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  สถานะการตรวจสอบแปลง / แหล่งผลิต
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RawMaterialSource['status'] })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="verified">✅ ตรวจสอบและผ่านการรับรองแล้ว (Verified)</option>
                  <option value="active">🟢 ใช้งานปกติ (Active)</option>
                  <option value="quarantine">⚠️ อยู่ระหว่างตรวจสอบ / กักกัน (Quarantine)</option>
                  <option value="inactive">⛔ ระงับใช้งานชั่วคราว (Inactive)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="sm:col-span-12">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บันทึกการตรวจสอบคุณภาพและเงื่อนไขพิเศษ
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="เช่น ปลูกด้วยระบบปิด ปราศจากสารเคมี โลหะหนักผ่านเกณฑ์มาตรฐานกระทรวงสาธารณสุข..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{sourceToEdit ? 'บันทึกการแก้ไข' : 'บันทึกแหล่งที่มาวัตถุดิบ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
