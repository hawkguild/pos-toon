import React, { useState, useEffect } from 'react';
import { Supplier, BusinessCategory } from '../../types';
import { Truck, X, Save, AlertCircle } from 'lucide-react';

interface AddEditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierData: Omit<Supplier, 'id'>) => void;
  supplierToEdit?: Supplier | null;
}

export const AddEditSupplierModal: React.FC<AddEditSupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  supplierToEdit,
}) => {
  const [code, setCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [productTypes, setProductTypes] = useState<BusinessCategory[]>(['cannabis']);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (supplierToEdit) {
      setCode(supplierToEdit.code || '');
      setCompanyName(supplierToEdit.companyName || '');
      setContactPerson(supplierToEdit.contactPerson || '');
      setPhone(supplierToEdit.phone || '');
      setTaxId(supplierToEdit.taxId || '');
      setAddress(supplierToEdit.address || '');
      setProductTypes(supplierToEdit.productTypes || ['cannabis']);
      setLicenseNumber(supplierToEdit.licenseNumber || '');
      setLicenseExpiry(supplierToEdit.licenseExpiry || '');
      setStatus(supplierToEdit.status || 'active');
    } else {
      // Auto-generate code
      setCode(`SUP-${Math.floor(100 + Math.random() * 900)}`);
      setCompanyName('');
      setContactPerson('');
      setPhone('');
      setTaxId('');
      setAddress('');
      setProductTypes(['cannabis']);
      setLicenseNumber('');
      setLicenseExpiry('2026-12-31');
      setStatus('active');
    }
    setError('');
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleCategory = (cat: BusinessCategory) => {
    if (productTypes.includes(cat)) {
      if (productTypes.length > 1) {
        setProductTypes(productTypes.filter((c) => c !== cat));
      }
    } else {
      setProductTypes([...productTypes, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('กรุณาระบุชื่อบริษัท / ซัพพลายเออร์');
      return;
    }
    if (!contactPerson.trim()) {
      setError('กรุณาระบุชื่อผู้ติดต่อ');
      return;
    }
    if (!phone.trim()) {
      setError('กรุณาระบุเบอร์โทรศัพท์');
      return;
    }

    onSave({
      code: code || `SUP-${Date.now().toString().slice(-4)}`,
      companyName,
      contactPerson,
      phone,
      taxId: taxId || '-',
      address: address || '-',
      productTypes,
      licenseNumber: licenseNumber || 'ใบอนุญาตสมบูรณ์',
      licenseExpiry: licenseExpiry || '2026-12-31',
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-xl w-full text-slate-800 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {supplierToEdit ? 'แก้ไขข้อมูลซัพพลายเออร์' : 'เพิ่มซัพพลายเออร์ใหม่'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                รหัสซัพพลายเออร์ (Code):
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">สถานะ:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="active">Active (ใช้งานปกติ)</option>
                <option value="inactive">Inactive (ระงับการใช้งาน)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              ชื่อบริษัท / ฟาร์ม / ซัพพลายเออร์ *:
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="เช่น บริษัท ฟาร์มกัญชาออร์แกนิค ไทย จำกัด"
              className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                ชื่อผู้ติดต่อ *:
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="เช่น คุณกมลวรรณ"
                className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                เบอร์โทรศัพท์ *:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081-999-8888"
                className="w-full bg-slate-50 text-slate-900 text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                เลขประจำตัวผู้เสียภาษี (Tax ID):
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="0105568000123"
                className="w-full bg-slate-50 text-slate-900 text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                เลขที่ใบอนุญาต (GACP/สมุนไพร):
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="กัญ-เชียงใหม่-102/2568"
                className="w-full bg-slate-50 text-slate-900 text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              วันหมดอายุใบอนุญาต:
            </label>
            <input
              type="date"
              value={licenseExpiry}
              onChange={(e) => setLicenseExpiry(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              ประเภทสินค้าที่ส่งมอบ (เลือกได้หลายประเภท):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cannabis', label: '🌿 กัญชา (Cannabis)' },
                { id: 'kratom', label: '🥤 กระท่อม (Kratom)' },
                { id: 'food', label: '🍜 อาหาร & เครื่องดื่ม' },
                { id: 'general', label: '📦 อุปกรณ์ทั่วไป' },
              ].map((item) => {
                const isSelected = productTypes.includes(item.id as BusinessCategory);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleCategory(item.id as BusinessCategory)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-start space-x-2 transition ${
                      isSelected
                        ? 'bg-teal-50 text-teal-800 border-teal-400 ring-1 ring-teal-400/30'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              ที่อยู่ / สถานที่ผลิต / ฟาร์ม:
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ที่อยู่สถานประกอบการ หรือ แปลงปลูก"
              className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกข้อมูลซัพพลายเออร์</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
