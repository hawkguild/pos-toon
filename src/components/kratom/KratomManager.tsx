import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { KratomBatch, KratomRecipeItem } from '../../types';
import {
  Coffee,
  Plus,
  Beaker,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  PackageCheck,
  AlertCircle,
  MapPin,
  Scale,
  Search,
  Filter,
  Truck,
  FileText,
  QrCode,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  Info,
  Clock,
  ChevronRight,
  Tag,
} from 'lucide-react';

export const KratomManager: React.FC = () => {
  const { kratomBatches = [], produceKratomBatch, products = [], shopSettings } = usePOS();
  
  // UI State
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [selectedInspectBatch, setSelectedInspectBatch] = useState<KratomBatch | null>(null);
  const [showQrModalBatch, setShowQrModalBatch] = useState<KratomBatch | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold_out' | 'expired'>('all');
  const [originFilter, setOriginFilter] = useState<string>('all');

  // New Batch Form State
  const [productName, setProductName] = useState('น้ำกระท่อมต้มสด 100% (เกรดพรีเมียม)');
  const [batchNo, setBatchNo] = useState(`KT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
  const [processingDate, setProcessingDate] = useState(new Date().toISOString().slice(0, 10));
  const [leafOrigin, setLeafOrigin] = useState('สุราษฎร์ธานี (สวนออร์แกนิค)');
  const [supplierName, setSupplierName] = useState('สุมิตร ฟาร์มกระท่อมสุราษฎร์');
  const [producedVolume, setProducedVolume] = useState(10); // Liters
  const [yieldBottles, setYieldBottles] = useState(20); // Bottles
  const [bottleSizeMl, setBottleSizeMl] = useState(500);

  // Raw Material Costs & Weight
  const [leafGrams, setLeafGrams] = useState(500);
  const [leafCost, setLeafCost] = useState(150);
  const [flavorCost, setFlavorCost] = useState(120); // มะนาว/น้ำเชื่อม
  const [packagingCost, setPackagingCost] = useState(30); // ขวดเเละฉลาก
  const [processingNotes, setProcessingNotes] = useState('ต้มอุณหภูมิ 95°C กรอง 3 ชั้น ใบสดคุณภาพสูง เกรด A');

  const totalCost = leafCost + flavorCost + packagingCost;
  const costPerLiter = producedVolume > 0 ? totalCost / producedVolume : 0;
  const costPerBottle = yieldBottles > 0 ? totalCost / yieldBottles : 0;
  const suggestedSellingPrice = 50; // THB
  const profitMarginPercent = costPerBottle > 0 ? ((suggestedSellingPrice - costPerBottle) / suggestedSellingPrice) * 100 : 0;

  // Filtered Batches
  const filteredBatches = (kratomBatches || []).filter((batch) => {
    const matchesSearch =
      batch.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.leafOrigin && batch.leafOrigin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (batch.supplierName && batch.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    const matchesOrigin = originFilter === 'all' || (batch.leafOrigin && batch.leafOrigin.includes(originFilter));

    return matchesSearch && matchesStatus && matchesOrigin;
  });

  // KPI Calculations
  const totalActiveBatches = (kratomBatches || []).filter((b) => b.status === 'active').length;
  const totalLeafWeightGrams = (kratomBatches || []).reduce((acc, b) => acc + (b.leafWeightGrams || 0), 0);
  const totalLeafWeightKg = (totalLeafWeightGrams / 1000).toFixed(2);
  const totalVolumeLiters = (kratomBatches || []).reduce((acc, b) => acc + (b.producedVolumeLiters || 0), 0);
  const totalBottles = (kratomBatches || []).reduce((acc, b) => acc + (b.yieldBottles || 0), 0);
  const avgYieldLiterPerKg = totalLeafWeightGrams > 0 ? (totalVolumeLiters / (totalLeafWeightGrams / 1000)).toFixed(1) : '20.0';

  const handleProduceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipe: KratomRecipeItem[] = [
      {
        ingredientId: 'ing-kt-leaf',
        ingredientName: `ใบกระท่อมสด (${leafOrigin})`,
        quantityNeeded: leafGrams,
        unit: 'g',
      },
      {
        ingredientId: 'ing-water',
        ingredientName: 'น้ำกรอง RO Standard',
        quantityNeeded: producedVolume,
        unit: 'L',
      },
      {
        ingredientId: 'ing-packaging',
        ingredientName: `ขวดบรรจุ ${bottleSizeMl}ml พร้อมฉลาก อย.`,
        quantityNeeded: yieldBottles,
        unit: 'pcs',
      },
    ];

    produceKratomBatch({
      batchNo,
      productName,
      producedVolumeLiters: producedVolume,
      yieldBottles,
      bottleSizeMl,
      leafWeightGrams: leafGrams,
      leafOrigin,
      processingDate,
      processingWeightKg: leafGrams / 1000,
      supplierName,
      notes: processingNotes,
      totalCostThb: totalCost,
      costPerLiterThb: costPerLiter,
      costPerBottleThb: costPerBottle,
      fdaCompliantLabel: true,
      recipe,
    });

    setShowProduceModal(false);
    // Refresh batch generator number for next batch
    setBatchNo(`KT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5 text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-blue-800 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-400/30 text-blue-300 shrink-0">
            <Coffee className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-lg sm:text-xl font-bold tracking-wide">
                จัดการ Batch น้ำกระท่อม & ระบบย้อนกลับแหล่งกำเนิด (Kratom Batch Management)
              </h2>
              <span className="bg-blue-500/20 text-blue-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                อย. Compliant
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              บันทึกเเหล่งที่มา (Origin), วันที่ต้มเเปรรูป, น้ำหนักใบสด (Kg), คำนวณต้นทุน/ลิตร เเละตัดสต็อกอัตโนมัติ
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowProduceModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all active:scale-95 cursor-pointer self-start lg:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ต้มผลิต Batch ใหม่</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Batches ทั้งหมด</p>
            <p className="text-2xl font-black text-slate-900">{totalActiveBatches} <span className="text-xs font-medium text-slate-500">ชุด</span></p>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
            <Beaker className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">น้ำหนักใบสดที่ใช้รวม</p>
            <p className="text-2xl font-black text-emerald-700">{totalLeafWeightKg} <span className="text-xs font-medium text-slate-500">กก. ({totalLeafWeightGrams}g)</span></p>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ปริมาตรผลิตสะสม</p>
            <p className="text-2xl font-black text-blue-800">{totalVolumeLiters} <span className="text-xs font-medium text-slate-500">ลิตร ({totalBottles} ขวด)</span></p>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
            <Coffee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">อัตราได้สกัดเฉลี่ย</p>
            <p className="text-2xl font-black text-amber-700">{avgYieldLiterPerKg} <span className="text-xs font-medium text-slate-500">ลิตร/กก.</span></p>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตาม Batch No., ชื่อสินค้า, แหล่งที่มา (Origin), หรือผู้จัดส่ง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Origin filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">ทุกแหล่งที่มา (Origin)</option>
              <option value="สุราษฎร์">สุราษฎร์ธานี</option>
              <option value="นครศรี">นครศรีธรรมราช</option>
              <option value="ชุมพร">ชุมพร</option>
              <option value="พัทลุง">พัทลุง</option>
            </select>
          </div>

          {/* Status filter pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({kratomBatches.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ใช้งานอยู่
            </button>
            <button
              onClick={() => setStatusFilter('sold_out')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                statusFilter === 'sold_out'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              จำหน่ายหมด
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
              title="การแสดงผลแบบการ์ด"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
              title="การแสดงผลแบบตาราง"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Content Section */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <Beaker className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-base">ไม่พบข้อมูล Batch ตามเงื่อนไขค้นหา</h4>
          <p className="text-xs text-slate-500">ลองเปลี่ยนคำค้นหาหรือกดต้มผลิต Batch ใหม่</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-blue-800 text-sm font-black bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {batch.batchNo}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border uppercase ${
                      batch.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : batch.status === 'sold_out'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {batch.status === 'active' ? '🟢 พร้อมขาย' : batch.status === 'sold_out' ? '🟡 สินค้าหมด' : '🔴 หมดอายุ'}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{batch.productName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    ปริมาตรผลิต: <span className="text-slate-900 font-extrabold">{batch.producedVolumeLiters} ลิตร</span>{' '}
                    ({batch.yieldBottles} ขวด @ {batch.bottleSizeMl}ml)
                  </p>
                </div>

                {/* Batch Origin & Processing Details Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 text-xs space-y-2">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">แหล่งที่มา (Origin):</span>
                      <span className="font-bold text-slate-900">{batch.leafOrigin || 'สุราษฎร์ธานี (สวนออร์แกนิค)'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <div>
                        <span className="text-slate-400 text-[10px] block">วันที่ต้ม/แปรรูป:</span>
                        <span className="font-mono font-bold text-slate-800">{batch.processingDate || batch.productionDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-slate-400 text-[10px] block">น้ำหนักใบสดที่ใช้:</span>
                        <span className="font-mono font-bold text-emerald-800">
                          {batch.leafWeightGrams} g ({(batch.leafWeightGrams / 1000).toFixed(2)} kg)
                        </span>
                      </div>
                    </div>
                  </div>

                  {batch.supplierName && (
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>ฟาร์ม: <strong className="text-slate-800">{batch.supplierName}</strong></span>
                    </div>
                  )}
                </div>

                {/* Recipe & Cost Calculation */}
                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">ต้นทุนรวม Batch:</span>
                    <span className="font-mono text-amber-700 font-extrabold">฿{batch.totalCostThb.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">ต้นทุน/ลิตร:</span>
                    <span className="font-mono text-emerald-700 font-bold">฿{batch.costPerLiterThb.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">ต้นทุน/ขวด:</span>
                    <span className="font-mono text-emerald-700 font-bold">฿{batch.costPerBottleThb.toFixed(2)}</span>
                  </div>
                </div>

                {/* FDA Compliance Label Check */}
                <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-200 text-[10px] text-blue-900 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    ติดฉลากเตือนตาม อย.
                  </span>
                  <span className="font-mono text-blue-950 font-bold">อย. {shopSettings.kratomFdaNo}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setSelectedInspectBatch(batch)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดู Traceability</span>
                </button>
                <button
                  onClick={() => setShowQrModalBatch(batch)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold p-1.5 rounded-xl text-xs border border-blue-200 transition cursor-pointer"
                  title="แสดง QR Code ตรวจสอบย้อนกลับ"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="p-3">เลข Batch No.</th>
                  <th className="p-3">ชื่อสินค้า/สูตร</th>
                  <th className="p-3">📍 แหล่งที่มา (Origin)</th>
                  <th className="p-3">📅 วันที่ต้ม/แปรรูป</th>
                  <th className="p-3">⚖️ น้ำหนักใบสด (g/kg)</th>
                  <th className="p-3">🥛 ผลผลิต (ลิตร/ขวด)</th>
                  <th className="p-3 text-right">ต้นทุน/ขวด</th>
                  <th className="p-3 text-center">สถานะ</th>
                  <th className="p-3 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-black text-blue-700">{batch.batchNo}</td>
                    <td className="p-3 font-bold text-slate-900">{batch.productName}</td>
                    <td className="p-3 text-slate-700 font-medium">{batch.leafOrigin || 'สุราษฎร์ธานี'}</td>
                    <td className="p-3 font-mono text-slate-600">{batch.processingDate || batch.productionDate}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">
                      {batch.leafWeightGrams} g ({(batch.leafWeightGrams / 1000).toFixed(2)} kg)
                    </td>
                    <td className="p-3 font-mono text-slate-800">
                      {batch.producedVolumeLiters}L ({batch.yieldBottles} ขวด)
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ฿{batch.costPerBottleThb.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${
                          batch.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setSelectedInspectBatch(batch)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>รายละเอียด</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCE BATCH MODAL */}
      {showProduceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 sm:p-6 text-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-700">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">ต้มผลิต Batch น้ำกระท่อมสด ใหม่</h3>
                  <p className="text-[11px] text-slate-500">บันทึกแหล่งที่มา (Origin), วันที่ต้ม, น้ำหนักใบสด (Kg) และสูตรผสม</p>
                </div>
              </div>
              <button
                onClick={() => setShowProduceModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProduceSubmit} className="space-y-3.5 text-xs">
              {/* Product Name */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">ชื่อสูตร / เครื่องดื่ม:</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Batch No & Processing Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">เลข Batch No.:</label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 p-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> วันที่ต้ม/แปรรูป:
                  </label>
                  <input
                    type="date"
                    value={processingDate}
                    onChange={(e) => setProcessingDate(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Origin & Supplier Tracking */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/80 space-y-2">
                <h5 className="font-bold text-blue-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  ระบบบันทึกแหล่งที่มาวัตถุดิบ (Origin & Farm Source)
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] font-semibold mb-1">
                      แหล่งที่มา / จังหวัดที่ปลูก (Leaf Origin):
                    </label>
                    <input
                      type="text"
                      list="origin-presets"
                      placeholder="เช่น สุราษฎร์ธานี (สวนออร์แกนิค)"
                      value={leafOrigin}
                      onChange={(e) => setLeafOrigin(e.target.value)}
                      className="w-full bg-white text-slate-800 p-2 rounded-lg border border-slate-300 font-medium"
                      required
                    />
                    <datalist id="origin-presets">
                      <option value="สุราษฎร์ธานี (สวนกระท่อมก้านแดงออร์แกนิค)" />
                      <option value="นครศรีธรรมราช (วิสาหกิจชุมชนพืชสมุนไพร)" />
                      <option value="ชุมพร (ฟาร์มสมุนไพรพรีเมียม)" />
                      <option value="พัทลุง (แหล่งปลูกธรรมชาติดั้งเดิม)" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-semibold mb-1">
                      ชื่อฟาร์ม / ซัพพลายเออร์จัดส่ง:
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น สุมิตร ฟาร์มสุราษฎร์"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full bg-white text-slate-800 p-2 rounded-lg border border-slate-300 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Production Volume & Bottle Yield */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">ปริมาตรต้ม (ลิตร):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={producedVolume}
                    onChange={(e) => setProducedVolume(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono font-extrabold text-blue-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">จำนวนบรรจุ (ขวด):</label>
                  <input
                    type="number"
                    value={yieldBottles}
                    onChange={(e) => setYieldBottles(parseInt(e.target.value) || 0)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono font-extrabold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">ขนาดขวด (ml):</label>
                  <input
                    type="number"
                    value={bottleSizeMl}
                    onChange={(e) => setBottleSizeMl(parseInt(e.target.value) || 0)}
                    className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Ingredients & Cost Calculation */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  น้ำหนักใบกระท่อมสด & คำนวณต้นทุนผลิต:
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-slate-500 text-[10px] font-medium block mb-0.5">
                      น้ำหนักใบกระท่อม (g):
                    </label>
                    <input
                      type="number"
                      value={leafGrams}
                      onChange={(e) => setLeafGrams(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-slate-800 p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-emerald-700"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      = {(leafGrams / 1000).toFixed(2)} Kg
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-500 text-[10px] font-medium block mb-0.5">
                      ค่าใบกระท่อม (฿):
                    </label>
                    <input
                      type="number"
                      value={leafCost}
                      onChange={(e) => setLeafCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-slate-800 p-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 text-[10px] font-medium block mb-0.5">
                      ค่าน้ำ/เครื่องปรุง (฿):
                    </label>
                    <input
                      type="number"
                      value={flavorCost}
                      onChange={(e) => setFlavorCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-slate-800 p-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 text-[10px] font-medium block mb-0.5">
                      ค่าขวด/บรรจุภัณฑ์ (฿):
                    </label>
                    <input
                      type="number"
                      value={packagingCost}
                      onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-slate-800 p-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Auto Calculated Summary Banner */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-slate-700 shadow-2xs">
                  <div className="flex justify-between font-bold text-sm">
                    <span>ต้นทุนรวมทั้ง Batch:</span>
                    <span className="font-mono text-amber-700">฿{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
                    <span>ต้นทุนเฉลี่ย/ลิตร: <strong>฿{costPerLiter.toFixed(2)}</strong></span>
                    <span>ต้นทุนเฉลี่ย/ขวด: <strong className="text-emerald-700">฿{costPerBottle.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Processing Notes */}
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">หมายเหตุ / ควบคุมคุณภาพการต้มสกัด (QC Notes):</label>
                <input
                  type="text"
                  value={processingNotes}
                  onChange={(e) => setProcessingNotes(e.target.value)}
                  className="w-full bg-white text-slate-800 p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProduceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer"
                >
                  บันทึกต้มผลิต & ตัดสต็อกวัตถุดิบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT BATCH TRACEABILITY MODAL */}
      {selectedInspectBatch && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    รายงานตรวจสอบย้อนกลับ Batch ({selectedInspectBatch.batchNo})
                  </h3>
                  <p className="text-[11px] text-slate-500">Traceability & Provenance Report</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInspectBatch(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-blue-900 text-sm">{selectedInspectBatch.productName}</span>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 rounded-md font-bold text-blue-700 border border-blue-200">
                    {selectedInspectBatch.batchNo}
                  </span>
                </div>
                <div className="text-slate-600 space-y-1 text-[11px]">
                  <p>📍 <strong>แหล่งที่มา (Origin):</strong> {selectedInspectBatch.leafOrigin || 'สุราษฎร์ธานี'}</p>
                  <p>🚚 <strong>ฟาร์ม/ผู้จัดส่ง:</strong> {selectedInspectBatch.supplierName || 'สุมิตร ฟาร์มกระท่อม'}</p>
                  <p>📅 <strong>วันที่ต้มแปรรูป:</strong> {selectedInspectBatch.processingDate || selectedInspectBatch.productionDate}</p>
                  <p>⚖️ <strong>น้ำหนักใบสดที่ใช้:</strong> {selectedInspectBatch.leafWeightGrams} g ({(selectedInspectBatch.leafWeightGrams / 1000).toFixed(2)} kg)</p>
                  <p>🥛 <strong>ปริมาตรผลผลิต:</strong> {selectedInspectBatch.producedVolumeLiters} ลิตร ({selectedInspectBatch.yieldBottles} ขวด)</p>
                </div>
              </div>

              {/* Recipe breakdown */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-slate-800 text-xs">ส่วนผสมตามสูตร (Recipe Components):</h5>
                <ul className="space-y-1 pl-1">
                  {(selectedInspectBatch.recipe || []).map((r, idx) => (
                    <li key={idx} className="flex justify-between text-slate-700">
                      <span>• {r.ingredientName}</span>
                      <span className="font-mono font-bold">{r.quantityNeeded} {r.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Costs & Compliance */}
              <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                <div className="bg-slate-100 p-2 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-sans">ต้นทุนรวม</p>
                  <p className="font-bold text-slate-900">฿{selectedInspectBatch.totalCostThb.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-emerald-900">
                  <p className="text-[10px] text-emerald-700 font-sans">ต้นทุน/ขวด</p>
                  <p className="font-bold">฿{selectedInspectBatch.costPerBottleThb.toFixed(2)}</p>
                </div>
              </div>

              {selectedInspectBatch.notes && (
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <strong>หมายเหตุ QC:</strong> {selectedInspectBatch.notes}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedInspectBatch(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE PREVIEW MODAL */}
      {showQrModalBatch && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 text-center space-y-4 text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900">QR Code ตรวจสอบย้อนกลับ</h4>
              <button onClick={() => setShowQrModalBatch(null)} className="text-slate-400 font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block mx-auto">
              {/* Simulated QR Code SVG */}
              <div className="w-36 h-36 bg-slate-900 p-2 rounded-lg text-white mx-auto flex items-center justify-center relative">
                <div className="w-full h-full border-2 border-white/30 rounded flex flex-col items-center justify-center p-2">
                  <QrCode className="w-20 h-20 text-white" />
                  <span className="text-[9px] font-mono font-bold mt-1 text-emerald-400">FDA VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-mono font-black text-blue-800 text-sm">{showQrModalBatch.batchNo}</p>
              <p className="text-slate-600 font-bold">{showQrModalBatch.productName}</p>
              <p className="text-[11px] text-slate-500">📍 แหล่งที่มา: {showQrModalBatch.leafOrigin || 'สุราษฎร์ธานี'}</p>
            </div>

            <button
              onClick={() => {
                alert(`พิมพ์ฉลากติดขวด Batch ${showQrModalBatch.batchNo} เรียบร้อยแล้ว`);
                setShowQrModalBatch(null);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-xl text-xs transition cursor-pointer"
            >
              พิมพ์ฉลากติดขวด (Print Batch Tag)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


