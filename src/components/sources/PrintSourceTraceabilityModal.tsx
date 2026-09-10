import React from 'react';
import { RawMaterialSource } from '../../types';
import { usePOS } from '../../context/POSContext';
import { X, Printer, QrCode, CheckCircle2, ShieldCheck, Sprout, Building, MapPin, Calendar, Award } from 'lucide-react';

interface PrintSourceTraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: RawMaterialSource | null;
}

export const PrintSourceTraceabilityModal: React.FC<PrintSourceTraceabilityModalProps> = ({
  isOpen,
  onClose,
  source,
}) => {
  const { shopSettings } = usePOS();

  if (!isOpen || !source) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrData = JSON.stringify({
    sourceCode: source.code,
    sourceName: source.name,
    material: source.materialName,
    province: source.province,
    certNumber: source.certNumber || 'N/A',
    certExpiry: source.certExpiryDate || 'N/A',
    standards: source.standardCertificates,
    supplier: source.supplierName || 'Direct Farm',
    verifiedBy: shopSettings.shopName,
    complianceLaw: 'Thai Multi Business Regulatory Standards B.E. 2569',
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header - Screen only */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">พิมพ์เอกสารกำกับและรับรองแหล่งที่มาวัตถุดิบ (Traceability Certificate)</h3>
              <p className="text-xs text-slate-400">ใบรับรองแหล่งกำเนิดและมาตรฐานการตรวจสอบย้อนกลับ B.E. 2569</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 text-slate-800 space-y-6 print:p-0 print:m-0 print:text-black">
          {/* Header Section */}
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <div className="inline-flex items-center justify-center space-x-2 text-emerald-800 font-extrabold text-sm uppercase tracking-wider mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>ใบรับรองการตรวจสอบย้อนกลับแหล่งกำเนิดวัตถุดิบ</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">
              CERTIFICATE OF RAW MATERIAL ORIGIN & TRACEABILITY
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              ตามข้อกำหนดระบบควบคุมคุณภาพและการตรวจสอบย้อนกลับวัตถุดิบควบคุม B.E. 2569
            </p>
            <p className="text-xs text-slate-500 font-mono">
              สถานประกอบการ: {shopSettings.shopName} | เลขทะเบียน: {shopSettings.taxId || '0105568192083'}
            </p>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-3 gap-6 items-start">
            <div className="col-span-2 space-y-4">
              {/* Box 1: Source Info */}
              <div className="border border-slate-300 rounded-xl p-4 space-y-2 bg-slate-50/50 print:bg-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">รหัสแหล่งวัตถุดิบ:</span>
                  <span className="text-sm font-black text-emerald-800 font-mono px-2 py-0.5 bg-emerald-100 rounded-md">
                    {source.code}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500">ชื่อแหล่งปลูก/ผู้ผลิต:</span>
                  <p className="text-base font-black text-slate-900">{source.name}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500">ชนิดวัตถุดิบหลัก:</span>
                  <p className="text-sm font-bold text-slate-800">{source.materialName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="font-bold text-slate-500">จังหวัด:</span> {source.province}
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">เกรดคุณภาพ:</span> {source.qualityGrade || 'Medical Grade'}
                  </div>
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-500">ที่ตั้งแปลง/โรงเรือน:</span> {source.location}
                </div>
              </div>

              {/* Box 2: Standards & Testing */}
              <div className="border border-slate-300 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>มาตรฐานการรับรองและผลตรวจวิเคราะห์ห้องปฏิบัติการ</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-500">มาตรฐานที่ผ่านการรับรอง:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {source.standardCertificates && source.standardCertificates.length > 0 ? (
                        source.standardCertificates.map((c, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded font-semibold text-[11px]"
                          >
                            ✓ {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">มาตรฐานแปลงเกษตรปลอดภัย</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="font-bold text-slate-500">เลขที่ใบรับรอง:</span>{' '}
                      <span className="font-mono font-bold">{source.certNumber || 'GACP-CERT-VERIFIED'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">วันหมดอายุใบรับรอง:</span>{' '}
                      <span>{source.certExpiryDate || '2028-12-31'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold text-slate-500">ห้องแล็บตรวจวิเคราะห์:</span>{' '}
                      <span>{source.testLabName || 'กรมวิทยาศาสตร์การแพทย์'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">เลขผลตรวจ COA:</span>{' '}
                      <span className="font-mono font-bold">{source.coaNumber || 'COA-PASS-2569'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: QR Code & Verification Stamp */}
            <div className="col-span-1 border border-slate-300 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50 print:bg-transparent h-full">
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                  QR สแกนตรวจสอบย้อนหลัง
                </span>
                <div className="p-2 bg-white border border-slate-300 rounded-xl shadow-xs inline-block">
                  <img
                    src={qrUrl}
                    alt="Traceability QR"
                    className="w-36 h-36 mx-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  SCAN TO VERIFY ORIGIN
                </p>
              </div>

              <div className="w-full pt-4 border-t border-slate-200 text-center space-y-1">
                <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผ่านการตรวจรับรอง</span>
                </span>
                <p className="text-[10px] text-slate-500">
                  อัปเดตล่าสุด: {new Date(source.updatedAt || Date.now()).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier & Contact Info */}
          <div className="border border-slate-300 rounded-xl p-4 bg-white grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-500">ซัพพลายเออร์ที่จัดส่ง:</span>
              <p className="font-bold text-slate-900">{source.supplierName || 'จัดส่งโดยตรงจากฟาร์มเกษตรกร'}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500">ผู้ดูแลแปลง / ผู้รับผิดชอบ:</span>
              <p className="font-bold text-slate-900">{source.contactPerson} ({source.phone})</p>
            </div>
            <div>
              <span className="font-bold text-slate-500">รอบฤดูกาลเก็บเกี่ยว:</span>
              <p className="font-bold text-slate-900">{source.harvestSeason || 'หมุนเวียนรอบปกติ'}</p>
            </div>
          </div>

          {/* Inspection Notes & Declaration */}
          <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1 print:bg-transparent">
            <p className="font-bold text-slate-800">คำรับรองความถูกต้อง:</p>
            <p>
              ข้อมูลแหล่งกำเนิดและกระบวนการผลิตวัตถุดิบข้างต้นได้รับการตรวจสอบความถูกต้องและผ่านการตรวจประเมินคุณภาพตามเกณฑ์มาตรฐานทางกฎหมายว่าด้วยสมุนไพรควบคุมและอาหารปลอดภัยแห่งราชอาณาจักรไทย พ.ศ. 2569
            </p>
            {source.notes && (
              <p className="text-slate-600 italic pt-1">
                หมายเหตุเพิ่มเติม: {source.notes}
              </p>
            )}
          </div>

          {/* Signature Sign-offs */}
          <div className="grid grid-cols-2 gap-12 pt-6 text-center text-xs">
            <div className="space-y-8">
              <p className="font-bold text-slate-600">ลงนามผู้ตรวจสอบคุณภาพ / เภสัชกรประจำร้าน</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="text-slate-700">( ............................................................ )</p>
              <p className="text-slate-500 text-[11px]">วันที่ ..... / ..... / 2569</p>
            </div>
            <div className="space-y-8">
              <p className="font-bold text-slate-600">ลงนามผู้ดูแลแหล่งปลูก / ตัวแทนฟาร์ม</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="text-slate-700">( {source.contactPerson || '............................................................'} )</p>
              <p className="text-slate-500 text-[11px]">วันที่ ..... / ..... / 2569</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
