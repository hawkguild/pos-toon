import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Customer, MembershipTier, CustomerPointLog } from '../../types';
import {
  LOYALTY_TIERS,
  LOYALTY_REWARDS_CATALOG,
  calculateMembershipTier,
  getTierProgression,
} from '../../lib/loyalty';
import {
  Users,
  Plus,
  Search,
  Award,
  Phone,
  Calendar,
  Edit3,
  Trash2,
  ShieldCheck,
  HeartPulse,
  X,
  Check,
  FileText,
  Hash,
  DollarSign,
  UserCheck,
  Gift,
  History,
  TrendingUp,
  Sparkles,
  Sliders,
  ChevronRight,
  Info,
  Crown,
  Medal,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const CustomerManager: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    adjustCustomerPoints,
    redeemCustomerReward,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | MembershipTier>('all');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Loyalty Modals
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [selectedCustomerForReward, setSelectedCustomerForReward] = useState<Customer | null>(null);
  const [selectedCustomerForAdjustment, setSelectedCustomerForAdjustment] = useState<Customer | null>(null);
  const [showTierInfoGuide, setShowTierInfoGuide] = useState(false);

  // Adjustment Form State
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('แต้มสะสมพิเศษเนื่องในวันเกิด');

  // Member Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [points, setPoints] = useState<number>(0);
  const [totalSpend, setTotalSpend] = useState<number>(0);
  const [membershipTier, setMembershipTier] = useState<MembershipTier>('Bronze');
  const [medicalNote, setMedicalNote] = useState('');

  // Filtered list
  const filteredCustomers = (customers || []).filter((c) => {
    const tier = c.membershipTier || calculateMembershipTier(c.totalSpend || 0);
    const matchesTier = selectedTierFilter === 'all' || tier === selectedTierFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.memberCode && c.memberCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTier && matchesSearch;
  });

  // Totals & Tier Breakdown
  const totalMembers = (customers || []).length;
  const grandTotalPoints = (customers || []).reduce((acc, c) => acc + (c.points || 0), 0);
  const grandTotalSpend = (customers || []).reduce((acc, c) => acc + (c.totalSpend || 0), 0);
  const vipCount = (customers || []).filter(
    (c) => (c.membershipTier || calculateMembershipTier(c.totalSpend || 0)) === 'VIP'
  ).length;
  const goldCount = (customers || []).filter(
    (c) => (c.membershipTier || calculateMembershipTier(c.totalSpend || 0)) === 'Gold'
  ).length;

  // Calculate Age helper
  const calculateAge = (dateString?: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) ? null : age;
  };

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setMemberCode(`CUST-${Math.floor(1000 + Math.random() * 9000)}`);
    setBirthDate('1995-01-01');
    setPoints(0);
    setTotalSpend(0);
    setMembershipTier('Bronze');
    setMedicalNote('');
    setShowModal(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setPhone(cust.phone);
    setMemberCode(cust.memberCode || '');
    setBirthDate(cust.birthDate || '1995-01-01');
    setPoints(cust.points || 0);
    setTotalSpend(cust.totalSpend || 0);
    setMembershipTier(cust.membershipTier || calculateMembershipTier(cust.totalSpend || 0));
    setMedicalNote(cust.medicalHistoryNote || '');
    setShowModal(true);
  };

  // Save (Add or Update)
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    const calculatedTier = calculateMembershipTier(Number(totalSpend) || 0);
    const tierToSave = membershipTier || calculatedTier;

    if (editingCustomer) {
      // Update existing
      updateCustomer(editingCustomer.id, {
        name: name.trim(),
        phone: phone.trim(),
        memberCode: memberCode.trim(),
        birthDate,
        points: Number(points) || 0,
        totalSpend: Number(totalSpend) || 0,
        membershipTier: tierToSave,
        medicalHistoryNote: medicalNote.trim(),
      });
      alert(`อัปเดตข้อมูลสมาชิก "${name.trim()}" เรียบร้อยแล้ว`);
    } else {
      // Add new
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        memberCode: memberCode.trim(),
        birthDate,
        points: Number(points) || 0,
        totalSpend: Number(totalSpend) || 0,
        membershipTier: tierToSave,
        medicalHistoryNote: medicalNote.trim(),
        pointHistory: [
          {
            id: 'pt-init-' + Date.now(),
            timestamp: new Date().toISOString(),
            type: 'earn',
            pointsChange: Number(points) || 0,
            balanceAfter: Number(points) || 0,
            reason: 'แต้มเริ่มต้นลงทะเบียนสมาชิก',
            recordedBy: 'ระบบ',
          },
        ],
      });
      alert(`เพิ่มสมาชิกใหม่ "${name.trim()}" เรียบร้อยแล้ว`);
    }

    setShowModal(false);
  };

  // Confirm Delete
  const handleDelete = (id: string) => {
    const success = deleteCustomer(id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  // Execute Point Adjustment
  const handleExecutePointAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForAdjustment) return;
    const delta = adjustType === 'add' ? Math.abs(adjustAmount) : -Math.abs(adjustAmount);
    const res = adjustCustomerPoints(selectedCustomerForAdjustment.id, delta, adjustReason);
    alert(res.message);
    if (res.success) {
      if (res.customer) {
        setSelectedCustomerForAdjustment(res.customer);
      }
      setSelectedCustomerForAdjustment(null);
    }
  };

  // Execute Reward Redemption
  const handleRedeemReward = (rewardId: string, rewardName: string) => {
    if (!selectedCustomerForReward) return;
    if (window.confirm(`ยืนยันให้สมาชิก "${selectedCustomerForReward.name}" แลกรับ "${rewardName}" หรือไม่?`)) {
      const res = redeemCustomerReward(selectedCustomerForReward.id, rewardId);
      alert(res.message);
      if (res.success) {
        // Update local reference
        const updated = (customers || []).find((c) => c.id === selectedCustomerForReward.id);
        if (updated) setSelectedCustomerForReward(updated);
        else setSelectedCustomerForReward(null);
      }
    }
  };

  // Render Tier Badge helper
  const renderTierBadge = (tier: MembershipTier) => {
    const config = LOYALTY_TIERS[tier] || LOYALTY_TIERS.Bronze;
    return (
      <span
        className={`inline-flex items-center space-x-1 font-bold text-xs px-2.5 py-0.5 rounded-full border shadow-xs ${config.badgeColor}`}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
        <span className="text-[10px] font-mono opacity-80">({config.multiplier}x)</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 p-6 rounded-3xl text-white shadow-lg border border-red-800/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-red-500/20 p-3.5 rounded-2xl border border-red-500/30 text-red-300">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Customer & Loyalty Tier System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ระบบสมาชิก & แต้มสะสมระดับ Tier
            </h2>
            <p className="text-xs text-rose-200/80 mt-1">
              จัดการสมาชิก ระบบสะสมแต้มตาม Tier (Bronze, Silver, Gold, VIP) ประวัติคะแนน และการแลกของรางวัล
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTierInfoGuide(true)}
            className="bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-1.5 border border-white/20 transition cursor-pointer"
          >
            <Info className="w-4 h-4 text-amber-300" />
            <span>เกณฑ์ระดับ Tier & สิทธิประโยชน์</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-red-900/30 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสมาชิกใหม่</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">สมาชิกทั้งหมด</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalMembers} คน</p>
            <p className="text-[11px] text-slate-400 mt-0.5">VIP: {vipCount} | Gold: {goldCount}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">แต้มสะสมรวมทั้งระบบ</p>
            <p className="text-2xl font-black text-amber-600 font-mono mt-1">
              {grandTotalPoints.toLocaleString()} <span className="text-sm font-normal">แต้ม</span>
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">50 บาท = 1 แต้ม (x Tier)</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">ยอดซื้อสะสมรวมสมาชิก</p>
            <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
              ฿{grandTotalSpend.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              เฉลี่ย ฿{totalMembers > 0 ? Math.round(grandTotalSpend / totalMembers).toLocaleString() : 0}/คน
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">สมาชิกระดับพรีเมียม (Gold+)</p>
            <p className="text-2xl font-black text-purple-600 font-mono mt-1">
              {vipCount + goldCount} คน
            </p>
            <p className="text-[11px] text-purple-700 font-medium mt-0.5">ตัวคูณแต้ม 1.5x - 2.0x</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Crown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tier Filter Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Tier Filter Buttons */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-bold px-2 py-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>ระดับ Tier:</span>
          </span>
          <button
            onClick={() => setSelectedTierFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              selectedTierFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({totalMembers})
          </button>
          <button
            onClick={() => setSelectedTierFilter('VIP')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center space-x-1 ${
              selectedTierFilter === 'VIP'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 hover:bg-purple-100/60'
            }`}
          >
            <span>👑 VIP ({vipCount})</span>
          </button>
          <button
            onClick={() => setSelectedTierFilter('Gold')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center space-x-1 ${
              selectedTierFilter === 'Gold'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-100/60'
            }`}
          >
            <span>🥇 Gold ({goldCount})</span>
          </button>
          <button
            onClick={() => setSelectedTierFilter('Silver')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center space-x-1 ${
              selectedTierFilter === 'Silver'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🥈 Silver</span>
          </button>
          <button
            onClick={() => setSelectedTierFilter('Bronze')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center space-x-1 ${
              selectedTierFilter === 'Bronze'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <span>🥉 Bronze</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาด้วย ชื่อ, เบอร์โทรศัพท์ หรือ รหัสสมาชิก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 shadow-xs transition font-medium"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            พบสมาชิก <span className="font-bold text-slate-800">{filteredCustomers.length}</span> รายการ
          </div>
        </div>

        {/* Customer Cards Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">ไม่พบข้อมูลสมาชิกที่ค้นหา</p>
            <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือกด "เพิ่มสมาชิกใหม่"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((c) => {
              const age = calculateAge(c.birthDate);
              const isOver20 = age !== null && age >= 20;
              const currentTier = c.membershipTier || calculateMembershipTier(c.totalSpend || 0);
              const progression = getTierProgression(c.totalSpend || 0);

              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xs hover:border-red-300 hover:shadow-md transition relative group flex flex-col justify-between"
                >
                  <div>
                    {/* Top Tag, Tier Badge & Points */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-1">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="font-mono text-slate-700 text-[11px] font-black bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {c.memberCode}
                        </span>
                        {renderTierBadge(currentTier)}
                      </div>

                      {/* Points pill with click to view history */}
                      <button
                        onClick={() => setSelectedCustomerForHistory(c)}
                        title="ดูประวัติแต้มสะสม"
                        className="text-amber-800 hover:bg-amber-100 font-extrabold text-xs font-mono flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 transition cursor-pointer shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{c.points || 0} แต้ม</span>
                      </button>
                    </div>

                    {/* Member Details */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900 text-base">{c.name}</h4>
                        {age !== null && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isOver20
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {age} ปี {isOver20 ? '(20+ ผ่าน)' : '(ต่ำกว่า 20)'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-red-500" /> {c.phone}
                      </p>
                    </div>

                    {/* Tier Progression Progress Bar */}
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span className="font-medium">ยอดซื้อสะสม:</span>
                        <span className="font-mono text-emerald-700 font-extrabold">
                          ฿{(c.totalSpend || 0).toLocaleString()}
                        </span>
                      </div>

                      {progression.nextTier && progression.nextTierConfig ? (
                        <div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-red-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${progression.percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                            <span>สะสมสู่ {progression.nextTierConfig.label} ({progression.percentage}%)</span>
                            <span className="font-bold text-amber-700 font-mono">
                              อีก ฿{progression.spendRemaining.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-purple-700 font-bold flex items-center justify-between">
                          <span>👑 ระดับสูงสุด (VIP Master)</span>
                          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono">
                            แต้ม x2.0 ทุกบิล
                          </span>
                        </div>
                      )}

                      {c.medicalHistoryNote && (
                        <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700 space-y-0.5">
                          <span className="font-bold text-red-700 flex items-center gap-1">
                            <HeartPulse className="w-3 h-3 text-red-500" /> โน้ตสุขภาพ:
                          </span>
                          <p className="text-slate-600 bg-white p-1.5 rounded-lg border border-slate-200 text-[10px] italic leading-relaxed line-clamp-2">
                            {c.medicalHistoryNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                    {/* Loyalty Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setSelectedCustomerForReward(c)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition flex items-center space-x-1 cursor-pointer"
                        title="แลกของรางวัล"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-600" />
                        <span>แลกของ</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCustomerForAdjustment(c);
                          setAdjustAmount(50);
                          setAdjustType('add');
                          setAdjustReason('แต้มสะสมพิเศษ');
                        }}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition flex items-center space-x-1 cursor-pointer"
                        title="ปรับแต่งแต้มพิเศษ"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      </button>

                      <button
                        onClick={() => setSelectedCustomerForHistory(c)}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition flex items-center space-x-1 cursor-pointer"
                        title="ดูประวัติแต้ม"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>

                    {/* Edit / Delete Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-bold border border-slate-200 hover:border-red-200 transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>

                      <button
                        onClick={() => setShowDeleteConfirm(c.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-xl text-xs font-bold border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                        title="ลบสมาชิก"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POINT HISTORY MODAL */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 text-slate-800 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    ประวัติแต้มสะสม: {selectedCustomerForHistory.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    รหัส: {selectedCustomerForHistory.memberCode} | เบอร์: {selectedCustomerForHistory.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-red-500/10 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-900">ยอดแต้มสะสมคงเหลือปัจจุบัน</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-3xl font-black text-amber-800 font-mono">
                    {selectedCustomerForHistory.points || 0}
                  </span>
                  <span className="text-xs font-bold text-amber-700">แต้ม</span>
                </div>
              </div>
              <div className="text-right">
                {renderTierBadge(
                  selectedCustomerForHistory.membershipTier ||
                    calculateMembershipTier(selectedCustomerForHistory.totalSpend || 0)
                )}
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  ยอดซื้อรวม: ฿{(selectedCustomerForHistory.totalSpend || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-bold text-slate-700 mb-2">รายการความเคลื่อนไหวแต้ม:</h4>
              {(!selectedCustomerForHistory.pointHistory || selectedCustomerForHistory.pointHistory.length === 0) ? (
                <div className="p-8 text-center text-slate-400 border border-dashed rounded-2xl">
                  ยังไม่มีประวัติการทำรายการคะแนน
                </div>
              ) : (
                selectedCustomerForHistory.pointHistory.map((log: CustomerPointLog) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-start space-x-2.5">
                      <div
                        className={`p-1.5 rounded-lg border mt-0.5 ${
                          log.type === 'earn'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : log.type === 'redeem'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : log.type === 'refund'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {log.type === 'earn' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : log.type === 'redeem' ? (
                          <Gift className="w-4 h-4" />
                        ) : log.type === 'refund' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <Sliders className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{log.reason}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>{new Date(log.timestamp).toLocaleString('th-TH')}</span>
                          {log.orderNo && <span>| บิล: {log.orderNo}</span>}
                          {log.recordedBy && <span>| โดย: {log.recordedBy}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono font-black text-sm block ${
                          log.pointsChange > 0
                            ? 'text-emerald-600'
                            : log.pointsChange < 0
                            ? 'text-rose-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {log.pointsChange > 0 ? `+${log.pointsChange}` : log.pointsChange} แต้ม
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        คงเหลือ: {log.balanceAfter}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedCustomerForAdjustment(selectedCustomerForHistory);
                  setSelectedCustomerForHistory(null);
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center space-x-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ปรับแต้มพิเศษ</span>
              </button>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REWARD REDEMPTION CATALOG MODAL */}
      {selectedCustomerForReward && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    แคตตาล็อกแลกของรางวัล: {selectedCustomerForReward.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    แต้มคงเหลือปัจจุบัน: <span className="font-black text-amber-700 text-sm">{selectedCustomerForReward.points || 0}</span> แต้ม
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerForReward(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
              {LOYALTY_REWARDS_CATALOG.map((reward) => {
                const canRedeem = (selectedCustomerForReward.points || 0) >= reward.pointsRequired;
                return (
                  <div
                    key={reward.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                      canRedeem
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl">{reward.icon}</span>
                        <span className="font-mono font-black text-xs text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                          {reward.pointsRequired} แต้ม
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{reward.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{reward.description}</p>
                    </div>

                    <button
                      onClick={() => handleRedeemReward(reward.id, reward.name)}
                      disabled={!canRedeem}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                        canRedeem
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{canRedeem ? 'แลกรับรางวัลนี้' : `ต้องการอีก ${reward.pointsRequired - (selectedCustomerForReward.points || 0)} แต้ม`}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomerForReward(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POINT ADJUSTMENT MODAL */}
      {selectedCustomerForAdjustment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    ปรับปรุงแต้มพิเศษ (Manual Adjustment)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedCustomerForAdjustment.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerForAdjustment(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePointAdjustment} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">แต้มคงเหลือปัจจุบัน:</span>
                <span className="font-mono font-black text-amber-700 text-base">
                  {selectedCustomerForAdjustment.points || 0} แต้ม
                </span>
              </div>

              {/* Action Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มแต้ม (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('deduct')}
                  className={`py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                    adjustType === 'deduct'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>-</span>
                  <span>หักแต้ม (-)</span>
                </button>
              </div>

              {/* Point Amount */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">จำนวนแต้มที่ต้องการปรับ:</label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-red-500 font-mono font-bold text-base"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">เหตุผลการปรับแต้ม (Audit Trail):</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="เช่น ชดเชยบริการ, กิจกรรมหน้าร้าน, แต้มวันเกิด"
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForAdjustment(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกการปรับแต้ม</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIER INFORMATION GUIDE MODAL */}
      {showTierInfoGuide && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    เกณฑ์สมาชิกระดับ Tier & ตัวคูณแต้มสะสม
                  </h3>
                  <p className="text-xs text-slate-500">
                    การคำนวณแต้มพื้นฐาน: ยอดชำระสุทธิทุก 50 บาท = 1 แต้ม (คูณด้วยตัวคูณ Tier)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTierInfoGuide(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(Object.keys(LOYALTY_TIERS) as MembershipTier[]).map((tierKey) => {
                const tier = LOYALTY_TIERS[tierKey];
                return (
                  <div
                    key={tierKey}
                    className={`p-4 rounded-2xl border ${tier.badgeColor} space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{tier.icon}</span>
                        <div>
                          <h4 className={`font-black text-sm ${tier.textColor}`}>
                            {tier.label} ({tierKey})
                          </h4>
                          <p className="text-xs text-slate-600">
                            เกณฑ์ยอดซื้อสะสม: ฿{tier.minSpend.toLocaleString()}+
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-xs bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-slate-800 shadow-xs">
                        ตัวคูณ {tier.multiplier}x แต้ม
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-[11px] font-bold text-slate-700 mb-1">สิทธิประโยชน์พิเศษ:</p>
                      <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                        {tier.perks.map((perk, i) => (
                          <li key={i}>{perk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTierInfoGuide(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {editingCustomer ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น คุณสมชาย เข็มทอง"
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 0812345678"
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-red-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span>รหัสสมาชิก:</span>
                  </label>
                  <input
                    type="text"
                    value={memberCode}
                    onChange={(e) => setMemberCode(e.target.value)}
                    placeholder="เช่น CUST-101"
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-red-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>วันเกิด (ตรวจอายุ 20+):</span>
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Editable Points, Total Spend & Membership Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-red-50/50 rounded-2xl border border-red-100">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>แต้มสะสม:</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ยอดซื้อสะสม (บาท):</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalSpend}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setTotalSpend(val);
                      setMembershipTier(calculateMembershipTier(val));
                    }}
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center space-x-1">
                    <Crown className="w-3.5 h-3.5 text-purple-600" />
                    <span>ระดับ Tier:</span>
                  </label>
                  <select
                    value={membershipTier}
                    onChange={(e) => setMembershipTier(e.target.value as MembershipTier)}
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="Bronze">🥉 Bronze (x1.0)</option>
                    <option value="Silver">🥈 Silver (x1.2)</option>
                    <option value="Gold">🥇 Gold (x1.5)</option>
                    <option value="VIP">👑 VIP (x2.0)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold flex items-center space-x-1">
                  <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                  <span>โน้ตประวัติสุขภาพ / ใบสั่งแพทย์ / ข้อควรระวัง:</span>
                </label>
                <textarea
                  value={medicalNote}
                  onChange={(e) => setMedicalNote(e.target.value)}
                  placeholder="เช่น ประวัตินอนไม่หลับ, มีโรคประจำตัว, หรือต้องการใช้กัญชาควบคุมแบบผ่อนคลาย"
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-red-500 h-24 text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 cursor-pointer transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold rounded-xl shadow-md shadow-red-600/20 flex items-center space-x-1.5 cursor-pointer transition"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกข้อมูลสมาชิก</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-slate-800 shadow-2xl space-y-4 text-center">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">ยืนยันการลบสมาชิก?</h3>
              <p className="text-xs text-slate-500 mt-1">
                การลบสมาชิกนี้ จะไม่สามารถดึงข้อมูลแต้มหรือประวัติกลับมาได้
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                ยืนยันลบสมาชิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
