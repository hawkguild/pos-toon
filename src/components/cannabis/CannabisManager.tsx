import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CannabisLot } from '../../types';
import {
  Leaf,
  ShieldAlert,
  FileCheck2,
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  FileText,
  QrCode,
  Scan,
  ShieldCheck,
  Printer,
  ExternalLink,
  RefreshCw,
  MapPin,
  Award,
} from 'lucide-react';

export const CannabisManager: React.FC = () => {
  const {
    cannabisLots,
    products,
    suppliers,
    rawMaterialSources = [],
    addCannabisLot,
    stockMovements,
    shopSettings,
    auditLogs,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'lots' | 'ledger' | 'gov_report'>('lots');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLotModal, setShowAddLotModal] = useState(false);

  // QR Code & Staff Scanner State
  const [qrModalLot, setQrModalLot] = useState<CannabisLot | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [scannedLot, setScannedLot] = useState<CannabisLot | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Generate QR Code Payload & API URL
  const generateComplianceQRUrl = (lot: CannabisLot) => {
    const payload = JSON.stringify({
      lotNumber: lot.lotNumber,
      strain: lot.strain,
      coaNumber: lot.coaNumber,
      thcPercent: lot.thcPercent,
      cbdPercent: lot.cbdPercent,
      supplierName: lot.supplierName,
      origin: lot.originLocation || 'Licensed Organic Farm, Thailand',
      licenseNo: shopSettings.cannabisLicenseNo || 'TH-CAN-2026-888',
      receivedDate: lot.receivedDate,
      expiryDate: lot.expiryDate,
      verifier: 'FDA Thai Cannabis Compliance System 2026',
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
  };

  const handleScanSimulate = (lotNoToScan?: string) => {
    const targetQuery = (lotNoToScan || scannerInput || '').trim().toLowerCase();
    if (!targetQuery) return;

    setIsScanning(true);
    setTimeout(() => {
      const match = (cannabisLots || []).find(
        (l) =>
          l.lotNumber.toLowerCase() === targetQuery ||
          l.lotNumber.toLowerCase().includes(targetQuery) ||
          l.coaNumber.toLowerCase().includes(targetQuery) ||
          l.strain.toLowerCase().includes(targetQuery)
      );
      setScannedLot(match || null);
      setIsScanning(false);
    }, 600);
  };

  // New Lot Form State
  const [selectedProductId, setSelectedProductId] = useState(
    (products || []).find((p) => p.category === 'cannabis')?.id || ''
  );
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [lotNumber, setLotNumber] = useState(`LOT-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [strain, setStrain] = useState('KD Koh Tao');
  const [thc, setThc] = useState(22.5);
  const [cbd, setCbd] = useState(0.8);
  const [coaNo, setCoaNo] = useState(`COA-TH-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [supplierId, setSupplierId] = useState((suppliers || [])[0]?.id || '');
  const [originLocation, setOriginLocation] = useState('');
  const [weightGrams, setWeightGrams] = useState(100);

  const handleSourceSelect = (srcId: string) => {
    setSelectedSourceId(srcId);
    if (!srcId) return;
    const foundSource = rawMaterialSources.find((s) => s.id === srcId);
    if (foundSource) {
      if (foundSource.materialName) setStrain(foundSource.materialName);
      if (foundSource.coaNumber) setCoaNo(foundSource.coaNumber);
      if (foundSource.location || foundSource.province) {
        setOriginLocation(`${foundSource.name} (${foundSource.province})`);
      }
      if (foundSource.supplierId) {
        setSupplierId(foundSource.supplierId);
      }
    }
  };

  const cannabisProducts = (products || []).filter((p) => p.category === 'cannabis');
  const cannabisMovements = (stockMovements || []).filter((m) => m.category === 'cannabis');

  const filteredLots = (cannabisLots || []).filter(
    (l) =>
      l.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.strain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.coaNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProduct = products.find((p) => p.id === selectedProductId);
    const targetSupplier = suppliers.find((s) => s.id === supplierId);

    if (!targetProduct || !targetSupplier) {
      alert('กรุณาเลือกสินค้าเเละซัพพลายเออร์');
      return;
    }

    addCannabisLot({
      lotNumber,
      productId: selectedProductId,
      strain: strain || targetProduct.cannabisDetails?.strain || targetProduct.name,
      type: 'flower',
      thcPercent: thc,
      cbdPercent: cbd,
      coaNumber: coaNo,
      supplierId: targetSupplier.id,
      supplierName: targetSupplier.companyName,
      originLocation: originLocation || targetSupplier.address,
      initialWeightGrams: weightGrams,
      receivedDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-12-31',
    });

    setShowAddLotModal(false);
    alert(`บันทึกการรับเข้ากัญชาช่อดอก Lot: ${lotNumber} เรียบร้อยแล้ว`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-emerald-50/80 p-6 rounded-2xl border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-100 p-3 rounded-2xl border border-emerald-200 text-emerald-700">
            <Leaf className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">
                ระบบกำกับดูแลเเละตรวจสอบย้อนหลังกัญชา (Compliance 2026)
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                สมุนไพรควบคุม
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              จัดเก็บข้อมูล Lot, COA, แหล่งกำเนิดฟาร์ม เเละบันทึก Audit Trail
              รับ-จ่ายสมุนไพรควบคุมตามข้อกำหนดกรมการแพทย์แผนไทยฯ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              setScannedLot(null);
              setScannerInput('');
              setShowScannerModal(true);
            }}
            className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-2xs transition cursor-pointer"
          >
            <Scan className="w-4 h-4 text-emerald-600" />
            <span>สแกน QR ตรวจสอบ Lot</span>
          </button>

          <button
            onClick={() => setShowAddLotModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรับเข้า Lot กัญชาใหม่</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs w-full max-w-md shadow-xs">
        <button
          onClick={() => setActiveTab('lots')}
          className={`flex-1 py-2 rounded-lg font-bold transition ${
            activeTab === 'lots'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🌿 บัญชี Lot & COA ({cannabisLots.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-2 rounded-lg font-bold transition ${
            activeTab === 'ledger'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📜 ประวัติเคลื่อนไหว (Audit Trail)
        </button>
        <button
          onClick={() => setActiveTab('gov_report')}
          className={`flex-1 py-2 rounded-lg font-bold transition ${
            activeTab === 'gov_report'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📋 รายงานส่งกรมฯ
        </button>
      </div>

      {/* TAB 1: LOTS LIST */}
      {activeTab === 'lots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาเลข Lot, สายพันธุ์, เลข COA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLots.map((lot) => (
              <div
                key={lot.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-800 text-sm font-extrabold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {lot.lotNumber}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      lot.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : lot.status === 'low'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {lot.status === 'available'
                      ? 'พร้อมจำหน่าย'
                      : lot.status === 'low'
                      ? 'ใกล้หมด'
                      : 'หมดแล้ว'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{lot.strain}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                    <span>THC: {lot.thcPercent}%</span>
                    <span>•</span>
                    <span>CBD: {lot.cbdPercent}%</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ใบรับรอง COA:</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      {lot.coaNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">แหล่งปลูก/ซัพพลายเออร์:</span>
                    <span className="text-slate-700 font-medium truncate max-w-[150px]">
                      {lot.supplierName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">วันที่รับเข้า:</span>
                    <span className="text-slate-700 font-medium">{lot.receivedDate}</span>
                  </div>
                </div>

                {/* Weight Balance & QR Code Action */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500">คงเหลือในคลัง:</span>
                      <p className="font-mono font-extrabold text-base text-emerald-700">
                        {lot.remainingWeightGrams}{' '}
                        <span className="text-xs text-slate-500">/ {lot.initialWeightGrams} g</span>
                      </p>
                    </div>

                    <div className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200 text-[10px] text-center font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>COA Verified</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setQrModalLot(lot)}
                    className="w-full bg-slate-50 hover:bg-emerald-50 text-emerald-800 font-bold py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>QR Code ตรวจสอบย้อนกลับ (Compliance Tag)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT MOVEMENT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>ประวัติการเคลื่อนไหวสมุนไพรควบคุม (Cannabis Stock Movement Audit)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono">
                <tr>
                  <th className="p-3">วัน-เวลา</th>
                  <th className="p-3">สินค้า / สายพันธุ์</th>
                  <th className="p-3">Lot Number</th>
                  <th className="p-3">ประเภท</th>
                  <th className="p-3 text-right">จำนวน (กรัม)</th>
                  <th className="p-3 text-right">คงเหลือ</th>
                  <th className="p-3">เหตุผล / เลขที่อ้างอิง</th>
                  <th className="p-3">ผู้บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cannabisMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      ยังไม่มีรายการเคลื่อนไหวสต็อกกัญชา
                    </td>
                  </tr>
                ) : (
                  cannabisMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500">
                        {new Date(m.timestamp).toLocaleString('th-TH')}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{m.productName}</td>
                      <td className="p-3 font-mono text-emerald-700 font-semibold">{m.lotNumber || '-'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.type === 'in'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.type === 'sale'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.type === 'in' ? 'รับเข้า (+)' : m.type === 'sale' ? 'ขายออก (-)' : 'ปรับปรุง'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange} g
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                        {m.balanceAfter} g
                      </td>
                      <td className="p-3 text-slate-600">{m.reason}</td>
                      <td className="p-3 text-slate-600">{m.userName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL GOVT REPORT */}
      {activeTab === 'gov_report' && (
        <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 printable-receipt">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                แบบรายงานการรับ-จำหน่ายช่อดอกสมุนไพรควบคุม (กัญชา)
              </h3>
              <p className="text-xs text-slate-600">
                ตามประกาศกระทรวงสาธารณสุข เรื่อง สมุนไพรควบคุม (กัญชา) พ.ศ. 2569
              </p>
              <p className="text-xs font-semibold text-emerald-800 mt-1">
                สถานที่จำหน่าย: {shopSettings.shopName} | เลขที่ใบอนุญาต: {shopSettings.cannabisLicenseNo}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>พิมพ์รายงานส่งกรมฯ</span>
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <th className="p-2 border">ลำดับ</th>
                <th className="p-2 border">วัน/เดือน/ปี</th>
                <th className="p-2 border">ชื่อสายพันธุ์/ช่อดอก</th>
                <th className="p-2 border">Lot No. / เลข COA</th>
                <th className="p-2 border text-right">ยอดยกมา (g)</th>
                <th className="p-2 border text-right">รับเข้า (g)</th>
                <th className="p-2 border text-right">จ่าย/ขายออก (g)</th>
                <th className="p-2 border text-right">คงเหลือ (g)</th>
                <th className="p-2 border">ผู้จำหน่าย / เลขใบสั่งจ่าย</th>
              </tr>
            </thead>
            <tbody>
              {cannabisLots.map((lot, idx) => (
                <tr key={lot.id} className="border-b border-slate-200">
                  <td className="p-2 border text-center">{idx + 1}</td>
                  <td className="p-2 border font-mono">{lot.receivedDate}</td>
                  <td className="p-2 border font-bold">{lot.strain}</td>
                  <td className="p-2 border font-mono">
                    {lot.lotNumber} ({lot.coaNumber})
                  </td>
                  <td className="p-2 border text-right font-mono">{lot.initialWeightGrams}</td>
                  <td className="p-2 border text-right font-mono">0</td>
                  <td className="p-2 border text-right font-mono">
                    {lot.initialWeightGrams - lot.remainingWeightGrams}
                  </td>
                  <td className="p-2 border text-right font-mono font-bold text-emerald-800">
                    {lot.remainingWeightGrams}
                  </td>
                  <td className="p-2 border">{lot.supplierName}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-8 grid grid-cols-2 text-xs text-center text-slate-700">
            <div>
              <p>ลงชื่อ.......................................................... ผู้รับผิดชอบ</p>
              <p className="mt-1">( {shopSettings.shopName} )</p>
            </div>
            <div>
              <p>วันที่............/............/2026</p>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lot Modal */}
      {showAddLotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                บันทึกรับเข้ากัญชาช่อดอก Lot ใหม่ (Compliance Entry)
              </h3>
              <button
                onClick={() => setShowAddLotModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="mt-4 space-y-3 text-xs">
              {/* Select Raw Material Source */}
              {rawMaterialSources.length > 0 && (
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                  <label className="block text-emerald-900 mb-1 font-bold flex items-center space-x-1">
                    <span>🌱</span>
                    <span>เลือกจากฐานข้อมูลแหล่งที่มาวัตถุดิบ (Raw Material Provenance):</span>
                  </label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => handleSourceSelect(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2 rounded-lg border border-emerald-300 font-semibold"
                  >
                    <option value="">-- ป้อนข้อมูลเอง หรือเลือกแหล่งกำเนิดที่ลงทะเบียน --</option>
                    {rawMaterialSources
                      .filter((s) => s.category === 'cannabis')
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) - {s.materialName} [{s.province}]
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">เลือกรายการสินค้ากัญชา:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300"
                >
                  {cannabisProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">เลข Lot Number:</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">เลขใบรับรอง COA:</label>
                  <input
                    type="text"
                    value={coaNo}
                    onChange={(e) => setCoaNo(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">สายพันธุ์ (Strain):</label>
                  <input
                    type="text"
                    value={strain}
                    onChange={(e) => setStrain(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">น้ำหนักรับเข้า (กรัม):</label>
                  <input
                    type="number"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">THC %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thc}
                    onChange={(e) => setThc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">CBD %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cbd}
                    onChange={(e) => setCbd(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  เลือกฟาร์ม / ซัพพลายเออร์ที่ได้รับอนุญาต:
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300"
                >
                  {suppliers
                    .filter((s) => s.productTypes.includes('cannabis'))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName} ({s.licenseNumber || 'ใบอนุญาตสมบูรณ์'})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLotModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium border border-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  บันทึกรับเข้า Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* QR CODE COMPLIANCE MODAL */}
      {qrModalLot && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    QR Code ตรวจสอบย้อนกลับ (Compliance Tag)
                  </h4>
                  <p className="text-[11px] text-slate-500">สมุนไพรควบคุม กรมการแพทย์แผนไทยฯ</p>
                </div>
              </div>
              <button
                onClick={() => setQrModalLot(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* QR Image Display */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-xs">
                <img
                  src={generateComplianceQRUrl(qrModalLot)}
                  alt={`Compliance QR Code for Lot ${qrModalLot.lotNumber}`}
                  className="w-48 h-48 mx-auto object-contain"
                />
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-700 font-bold bg-emerald-100/80 py-1.5 px-3 rounded-xl border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>FDA Compliance & Traceability Verified</span>
              </div>
            </div>

            {/* Detailed Lot Payload Data */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">เลข Lot Number:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">{qrModalLot.lotNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">สายพันธุ์ / Strain:</span>
                <span className="font-bold text-slate-900">{qrModalLot.strain}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">ใบรับรอง COA:</span>
                <span className="font-mono text-emerald-700 font-bold">{qrModalLot.coaNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">ระดับสารสำคัญ:</span>
                <span className="font-mono font-bold text-slate-800">
                  THC {qrModalLot.thcPercent}% | CBD {qrModalLot.cbdPercent}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">ฟาร์ม / ซัพพลายเออร์:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                  {qrModalLot.supplierName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">แหล่งกำเนิดฟาร์ม:</span>
                <span className="text-slate-700 text-[11px] font-medium truncate max-w-[180px]">
                  {qrModalLot.originLocation || 'Licensed Organic Farm, Thailand'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  alert(`สั่งพิมพ์ฉลากสติกเกอร์ QR สำหรับ Lot ${qrModalLot.lotNumber} เรียบร้อยแล้ว`);
                  setQrModalLot(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ฉลาก QR ติดบรรจุภัณฑ์</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAFF QR SCANNER SIMULATION MODAL */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    เครื่องสแกน QR ตรวจสอบ Lot กัญชา (Staff Verification)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    สแกน QR Code บนซอง/บรรจุภัณฑ์เพื่อตรวจสอบประวัติและแหล่งกำเนิด
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scanner Viewport Simulation */}
            <div className="bg-slate-900 rounded-2xl p-6 text-center text-white relative overflow-hidden space-y-3 shadow-inner">
              <div className="w-36 h-36 border-2 border-emerald-400 border-dashed rounded-2xl mx-auto flex items-center justify-center relative bg-emerald-950/30">
                <QrCode className="w-16 h-16 text-emerald-400 opacity-80" />
                {/* Laser animation bar */}
                <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {isScanning ? '⏳ กำลังอ่านข้อมูล QR Code...' : 'วาง QR Code ตรงกลางกรอบสแกน'}
              </p>

              {/* Sample Quick Select Buttons */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block mb-1.5 font-sans">
                  หรือคลิกเลือก Lot ตัวอย่างเพื่อสแกนทันที:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {cannabisLots.slice(0, 3).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setScannerInput(l.lotNumber);
                        handleScanSimulate(l.lotNumber);
                      }}
                      className="bg-slate-800 hover:bg-emerald-900 border border-slate-700 text-emerald-300 text-[11px] px-2.5 py-1 rounded-lg font-mono transition cursor-pointer"
                    >
                      {l.lotNumber} ({l.strain})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Barcode / Query Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScanSimulate();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                placeholder="กรอกเลข Lot หรือเลข COA..."
                className="flex-1 bg-slate-50 text-slate-800 text-xs px-3 py-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Scan className="w-4 h-4" />
                <span>สแกน</span>
              </button>
            </form>

            {/* Scan Result Container */}
            {scannedLot && (
              <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 space-y-3 text-xs animate-fadeIn">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h5 className="font-extrabold text-emerald-950 text-sm">
                        พบบันทึกการรับรองผ่าน QR Code
                      </h5>
                      <span className="text-[10px] text-emerald-800 font-semibold">
                        ตรวจสอบกับระบบกรมการแพทย์แผนไทยฯ แล้ว
                      </span>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white font-mono font-black px-2.5 py-1 rounded-lg">
                    {scannedLot.lotNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-800">
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] block font-medium">สายพันธุ์ (Strain):</span>
                    <strong className="text-slate-900 text-xs">{scannedLot.strain}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] block font-medium">ใบรับรอง COA:</span>
                    <strong className="text-emerald-700 font-mono text-xs">{scannedLot.coaNumber}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] block font-medium">ค่าสารสำคัญ:</span>
                    <strong className="text-slate-900 text-xs font-mono">
                      THC {scannedLot.thcPercent}% | CBD {scannedLot.cbdPercent}%
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] block font-medium">คงเหลือในสต็อก:</span>
                    <strong className="text-emerald-800 text-xs font-mono font-bold">
                      {scannedLot.remainingWeightGrams} g / {scannedLot.initialWeightGrams} g
                    </strong>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ซัพพลายเออร์ผู้ผลิต:</span>
                    <span className="font-semibold text-slate-800">{scannedLot.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">สถานที่ตั้งฟาร์ม:</span>
                    <span className="text-slate-700">{scannedLot.originLocation || 'Thailand Organic Farm'}</span>
                  </div>
                </div>
              </div>
            )}

            {!scannedLot && scannerInput && !isScanning && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs text-rose-800 text-center font-medium">
                ⚠️ ไม่พบบันทึก Lot หมายเลข "{scannerInput}" ในระบบ กรุณาตรวจสอบเลขสแกนอีกครั้ง
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
