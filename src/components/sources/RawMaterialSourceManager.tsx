import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { RawMaterialSource, BusinessCategory, CultivationType } from '../../types';
import { AddEditRawMaterialSourceModal } from './AddEditRawMaterialSourceModal';
import { PrintSourceTraceabilityModal } from './PrintSourceTraceabilityModal';
import {
  Sprout,
  Plus,
  Search,
  MapPin,
  Award,
  ShieldCheck,
  Building,
  Phone,
  User,
  Calendar,
  FlaskConical,
  Edit2,
  Trash2,
  Printer,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Layers,
  ChevronRight,
  Filter,
  Check,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const RawMaterialSourceManager: React.FC = () => {
  const {
    rawMaterialSources = [],
    addRawMaterialSource,
    updateRawMaterialSource,
    deleteRawMaterialSource,
    suppliers = [],
    cannabisLots = [],
    kratomBatches = [],
    businesses = [],
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cultivationFilter, setCultivationFilter] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<RawMaterialSource | null>(
    (rawMaterialSources || []).length > 0 ? rawMaterialSources[0] : null
  );

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [sourceToEdit, setSourceToEdit] = useState<RawMaterialSource | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [sourceToPrint, setSourceToPrint] = useState<RawMaterialSource | null>(null);

  // Filtered List
  const filteredSources = (rawMaterialSources || []).filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.materialName.toLowerCase().includes(q) ||
      s.province.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      (s.certNumber && s.certNumber.toLowerCase().includes(q)) ||
      (s.supplierName && s.supplierName.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesCultivation = cultivationFilter === 'all' || s.cultivationType === cultivationFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesCultivation;
  });

  const handleOpenAddModal = () => {
    setSourceToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (source: RawMaterialSource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSourceToEdit(source);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteSource = (source: RawMaterialSource, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        `คุณต้องการลบแหล่งที่มาวัตถุดิบ "${source.name}" (${source.code}) ออกจากระบบใช่หรือไม่?`
      )
    ) {
      deleteRawMaterialSource(source.id);
      if (selectedSource?.id === source.id) {
        setSelectedSource(null);
      }
    }
  };

  const handleOpenPrintModal = (source: RawMaterialSource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSourceToPrint(source);
    setIsPrintModalOpen(true);
  };

  const handleSaveSource = (data: Omit<RawMaterialSource, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (sourceToEdit) {
      updateRawMaterialSource(sourceToEdit.id, data);
      if (selectedSource?.id === sourceToEdit.id) {
        setSelectedSource({ ...sourceToEdit, ...data, updatedAt: new Date().toISOString() });
      }
    } else {
      const created = addRawMaterialSource(data);
      setSelectedSource(created);
    }
  };

  // Stats Calculations
  const totalCount = (rawMaterialSources || []).length;
  const certifiedCount = (rawMaterialSources || []).filter(
    (s) => (s.standardCertificates && s.standardCertificates.length > 0) || s.certNumber
  ).length;
  const medicalGradeCount = (rawMaterialSources || []).filter(
    (s) => s.qualityGrade?.toLowerCase().includes('medical') || s.qualityGrade?.toLowerCase().includes('aaa')
  ).length;
  const uniqueProvinces = new Set((rawMaterialSources || []).map((s) => s.province).filter(Boolean)).size;

  const getCultivationLabel = (type: CultivationType) => {
    switch (type) {
      case 'greenhouse':
        return { label: 'โรงเรือนปิด (Greenhouse)', icon: '🏡', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'indoor_hydroponic':
        return { label: 'ไฮโดรโปนิกส์ (Indoor)', icon: '💡', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'organic_soil':
        return { label: 'แปลงดินอินทรีย์ (Organic)', icon: '🌱', color: 'bg-lime-50 text-lime-800 border-lime-200' };
      case 'wild_harvest':
        return { label: 'เก็บเกี่ยวธรรมชาติ (Wild)', icon: '🌲', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'gap_standard':
        return { label: 'มาตรฐาน GAP ปลอดภัย', icon: '🌾', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'factory_processed':
        return { label: 'โรงงานแปรรูป (Factory)', icon: '🏭', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: 'ทั่วไป (Standard)', icon: '📦', color: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  };

  const getStatusBadge = (status: RawMaterialSource['status']) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ผ่านการรับรอง (Verified)</span>
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Check className="w-3 h-3 text-blue-600" />
            <span>ใช้งานปกติ (Active)</span>
          </span>
        );
      case 'quarantine':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>กักกันตรวจสอบ (Quarantine)</span>
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span>ระงับการใช้ (Inactive)</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: BusinessCategory) => {
    switch (cat) {
      case 'cannabis':
        return { label: 'กัญชาการแพทย์', icon: '🌿', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' };
      case 'kratom':
        return { label: 'กระท่อม & แปรรูป', icon: '🥤', color: 'bg-blue-500/10 text-blue-700 border-blue-300' };
      case 'food':
        return { label: 'อาหาร & ครัว', icon: '🍜', color: 'bg-amber-500/10 text-amber-700 border-amber-300' };
      case 'general':
        return { label: 'สินค้าทั่วไป', icon: '📦', color: 'bg-purple-500/10 text-purple-700 border-purple-300' };
      default: {
        const found = businesses.find((b) => b.id === cat);
        return {
          label: found?.name || cat,
          icon: found?.icon || '📦',
          color: 'bg-indigo-500/10 text-indigo-700 border-indigo-300',
        };
      }
    }
  };

  // Find related cannabis lots
  const relatedLots = selectedSource
    ? (cannabisLots || []).filter(
        (l) =>
          l.supplierId === selectedSource.supplierId ||
          l.strain?.toLowerCase().includes(selectedSource.materialName.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-7 rounded-2xl shadow-xl border border-emerald-800/30 flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex items-start space-x-4 relative z-10">
          <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-bold uppercase tracking-wider">
                GACP & GAP Traceability
              </span>
              <span className="text-xs text-slate-400 font-semibold">B.E. 2569 Standard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              ระบบบันทึกและตรวจสอบย้อนกลับแหล่งที่มาวัตถุดิบ (Raw Material Provenance)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              บันทึก ตรวจสอบ และติดตามแหล่งกำเนิดวัตถุดิบ แปลงปลูก ฟาร์มเกษตรกรอินทรีย์ ใบรับรองมาตรฐาน GACP/GAP และผลตรวจวิเคราะห์ห้องปฏิบัติการ
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มแหล่งที่มาวัตถุดิบ</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">แหล่งวัตถุดิบที่บันทึก</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900">{totalCount}</span>
              <span className="text-xs font-semibold text-slate-500">แห่ง</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">ผ่านการรับรอง GACP/GAP</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-teal-700">{certifiedCount}</span>
              <span className="text-xs font-semibold text-slate-500">ฟาร์ม</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">เกรดการแพทย์ Medical/AAA</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-indigo-700">{medicalGradeCount}</span>
              <span className="text-xs font-semibold text-slate-500">แหล่ง</span>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">ครอบคลุมจังหวัด</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-amber-700">{uniqueProvinces}</span>
              <span className="text-xs font-semibold text-slate-500">จังหวัด</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อฟาร์ม, รหัสแหล่ง, ชนิดวัตถุดิบ, จังหวัด, เลขใบรับรอง..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="verified">✅ ผ่านการรับรอง (Verified)</option>
              <option value="active">🟢 ใช้งานปกติ (Active)</option>
              <option value="quarantine">⚠️ กักกันตรวจสอบ (Quarantine)</option>
              <option value="inactive">⛔ ระงับการใช้ (Inactive)</option>
            </select>

            {/* Cultivation Filter */}
            <select
              value={cultivationFilter}
              onChange={(e) => setCultivationFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">รูปแบบการเพาะปลูกทั้งหมด</option>
              <option value="greenhouse">🏡 โรงเรือนปิด (Greenhouse)</option>
              <option value="indoor_hydroponic">💡 ไฮโดรโปนิกส์ (Indoor)</option>
              <option value="organic_soil">🌱 ดินอินทรีย์ (Organic)</option>
              <option value="wild_harvest">🌲 เก็บเกี่ยวธรรมชาติ (Wild)</option>
              <option value="gap_standard">🌾 มาตรฐาน GAP</option>
              <option value="factory_processed">🏭 โรงงานแปรรูป</option>
            </select>
          </div>
        </div>

        {/* Business Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({rawMaterialSources.length})
          </button>
          <button
            onClick={() => setCategoryFilter('cannabis')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              categoryFilter === 'cannabis'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <span>🌿</span>
            <span>กัญชาการแพทย์ ({rawMaterialSources.filter((s) => s.category === 'cannabis').length})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('kratom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              categoryFilter === 'kratom'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
            }`}
          >
            <span>🥤</span>
            <span>กระท่อม ({rawMaterialSources.filter((s) => s.category === 'kratom').length})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('food')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              categoryFilter === 'food'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <span>🍜</span>
            <span>อาหาร & ครัว ({rawMaterialSources.filter((s) => s.category === 'food').length})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              categoryFilter === 'general'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            <span>📦</span>
            <span>ทั่วไป ({rawMaterialSources.filter((s) => s.category === 'general').length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Master List & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Source Cards List (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {filteredSources.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลแหล่งที่มาวัตถุดิบ</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ลองปรับเงื่อนไขการค้นหา หรือกดปุ่ม "เพิ่มแหล่งที่มาวัตถุดิบ" เพื่อบันทึกข้อมูลแปลงเกษตรกรหรือผู้ผลิตใหม่
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                + บันทึกแหล่งวัตถุดิบใหม่
              </button>
            </div>
          ) : (
            filteredSources.map((source) => {
              const isSelected = selectedSource?.id === source.id;
              const cultivation = getCultivationLabel(source.cultivationType);
              const catBadge = getCategoryBadge(source.category);

              return (
                <div
                  key={source.id}
                  onClick={() => setSelectedSource(source)}
                  className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md scale-[1.008]'
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                          {source.code}
                        </span>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${catBadge.color}`}
                        >
                          <span>{catBadge.icon}</span>
                          <span>{catBadge.label}</span>
                        </span>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${cultivation.color}`}
                        >
                          <span>{cultivation.icon}</span>
                          <span>{cultivation.label}</span>
                        </span>
                        {getStatusBadge(source.status)}
                      </div>

                      {/* Source Name */}
                      <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {source.name}
                      </h3>

                      {/* Main Material Name */}
                      <p className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                        <span className="text-emerald-700 font-bold">ชนิดวัตถุดิบ:</span>
                        <span className="truncate">{source.materialName}</span>
                      </p>

                      {/* Location & Province */}
                      <div className="flex items-center space-x-3 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center space-x-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {source.province} ({source.location})
                          </span>
                        </span>
                        {source.qualityGrade && (
                          <span className="hidden sm:inline-block text-slate-400">|</span>
                        )}
                        {source.qualityGrade && (
                          <span className="hidden sm:inline-block font-semibold text-indigo-700 truncate">
                            {source.qualityGrade}
                          </span>
                        )}
                      </div>

                      {/* Standard Badges */}
                      {source.standardCertificates && source.standardCertificates.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {source.standardCertificates.map((cert, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 bg-emerald-50/80 border border-emerald-200 text-emerald-800 rounded-md text-[10px] font-semibold"
                            >
                              ✓ {cert}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-1 shrink-0">
                      <button
                        title="พิมพ์เอกสารรับรองย้อนกลับ / QR Pass"
                        onClick={(e) => handleOpenPrintModal(source, e)}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        title="แก้ไขข้อมูลแหล่งวัตถุดิบ"
                        onClick={(e) => handleOpenEditModal(source, e)}
                        className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="ลบแหล่งวัตถุดิบ"
                        onClick={(e) => handleDeleteSource(source, e)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Inspector Card (5 cols) */}
        <div className="lg:col-span-5">
          {selectedSource ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5 sticky top-32">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {selectedSource.code}
                    </span>
                    {getStatusBadge(selectedSource.status)}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-2">{selectedSource.name}</h2>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{selectedSource.materialName}</p>
                </div>

                <button
                  onClick={() => handleOpenEditModal(selectedSource)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </button>
              </div>

              {/* Cultivation & Location Block */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">รูปแบบการเพาะปลูก:</span>
                  <span className="font-bold text-slate-800">
                    {getCultivationLabel(selectedSource.cultivationType).label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">จังหวัด:</span>
                  <span className="font-bold text-slate-800">{selectedSource.province}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block mb-0.5">ที่ตั้งแปลง / โรงเรือน:</span>
                  <span className="text-slate-700 font-medium">{selectedSource.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="font-bold text-slate-500">ผู้ดูแลแปลง:</span>
                  <span className="font-bold text-slate-800">
                    {selectedSource.contactPerson} ({selectedSource.phone})
                  </span>
                </div>
                {selectedSource.supplierName && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">ซัพพลายเออร์ที่ผูกไว้:</span>
                    <span className="font-bold text-emerald-800">{selectedSource.supplierName}</span>
                  </div>
                )}
                {selectedSource.harvestSeason && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">รอบฤดูกาลเก็บเกี่ยว:</span>
                    <span className="font-bold text-slate-800">{selectedSource.harvestSeason}</span>
                  </div>
                )}
              </div>

              {/* Quality & Standards Block */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>มาตรฐานการรับรอง & ผลวิเคราะห์</span>
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-900">เกรดคุณภาพ:</span>
                    <span className="font-bold text-emerald-800">{selectedSource.qualityGrade || 'Medical Grade AAA'}</span>
                  </div>

                  {selectedSource.certNumber && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-bold">เลขที่ใบรับรอง:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedSource.certNumber}</span>
                    </div>
                  )}

                  {selectedSource.certExpiryDate && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-bold">วันหมดอายุใบรับรอง:</span>
                      <span className="font-bold text-slate-800">{selectedSource.certExpiryDate}</span>
                    </div>
                  )}

                  {selectedSource.testLabName && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-bold">ห้องแล็บตรวจวิเคราะห์:</span>
                      <span className="font-semibold text-slate-800">{selectedSource.testLabName}</span>
                    </div>
                  )}

                  {selectedSource.coaNumber && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-bold">เลขผลตรวจ COA:</span>
                      <span className="font-mono font-bold text-emerald-700">{selectedSource.coaNumber}</span>
                    </div>
                  )}

                  {selectedSource.standardCertificates && selectedSource.standardCertificates.length > 0 && (
                    <div className="pt-1">
                      <span className="text-slate-500 font-bold block mb-1">มาตรฐานที่ได้รับ:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedSource.standardCertificates.map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md font-semibold text-[11px]"
                          >
                            ✓ {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedSource.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                  <span className="font-bold">บันทึกการตรวจสอบคุณภาพ:</span>
                  <p className="text-slate-700">{selectedSource.notes}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenPrintModal(selectedSource)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์เอกสารกำกับแหล่งวัตถุดิบ & QR Code</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2">
              <Sprout className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold">เลือกรายการแหล่งวัตถุดิบเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddEditRawMaterialSourceModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveSource}
        sourceToEdit={sourceToEdit}
      />

      {/* Print Traceability Modal */}
      <PrintSourceTraceabilityModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        source={sourceToPrint}
      />
    </div>
  );
};
