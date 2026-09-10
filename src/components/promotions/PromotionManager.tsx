import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Promotion, PromotionType, BusinessCategory } from '../../types';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Percent,
  Gift,
  ShoppingBag,
  Layers,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Zap,
} from 'lucide-react';

interface PromotionManagerProps {
  onClose?: () => void;
}

export const PromotionManager: React.FC<PromotionManagerProps> = () => {
  const {
    promotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    products,
    businesses,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: '',
    code: '',
    type: 'bundle_price',
    description: '',
    enabled: true,
    isAutoApply: true,
    applicableType: 'category',
    applicableCategories: ['syrup', 'kratom', 'general'],
    applicableProductIds: [],
    bundleQuantity: 3,
    bundlePrice: 100,
    buyQuantity: 2,
    getFreeQuantity: 1,
    discountPercent: 10,
    discountAmount: 50,
    minQuantity: 3,
    minOrderAmount: 0,
    startDate: '',
    endDate: '',
    badgeColor: 'emerald',
    icon: '⚡',
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Analytics Metrics
  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter((p) => p.enabled).length;
  const totalUsage = promotions.reduce((sum, p) => sum + (p.timesUsed || 0), 0);
  const totalDiscountGiven = promotions.reduce((sum, p) => sum + (p.totalDiscountGiven || 0), 0);

  // Quick Preset Templates
  const applyPreset = (presetType: string) => {
    if (presetType === '3for100') {
      setFormData({
        name: 'โปรโมชั่น 3 ชิ้น 100 บาท',
        code: '3FOR100',
        type: 'bundle_price',
        description: 'เลือกซื้อสินค้า 3 ชิ้นในราคาพิเศษเพียง 100 บาท (คละได้)',
        enabled: true,
        isAutoApply: true,
        applicableType: 'category',
        applicableCategories: ['syrup', 'kratom', 'general'],
        bundleQuantity: 3,
        bundlePrice: 100,
        badgeColor: 'emerald',
        icon: '⚡',
      });
    } else if (presetType === 'buy2get1') {
      setFormData({
        name: 'โปรซื้อ 2 แถม 1 ฟรี',
        code: 'BUY2GET1',
        type: 'buy_x_get_y',
        description: 'ซื้อ 2 ชิ้น รับฟรีทันที 1 ชิ้น (ซื้อ 3 จ่าย 2)',
        enabled: true,
        isAutoApply: true,
        applicableType: 'category',
        applicableCategories: ['kratom'],
        buyQuantity: 2,
        getFreeQuantity: 1,
        badgeColor: 'amber',
        icon: '🎁',
      });
    } else if (presetType === '10pct') {
      setFormData({
        name: 'โปรลด 10% เมื่อซื้อครบ 200 บาท',
        code: 'DISC10',
        type: 'percentage',
        description: 'รับส่วนลด 10% ทันทีเมื่อมียอดสั่งซื้อครบ 200 บาท',
        enabled: true,
        isAutoApply: true,
        applicableType: 'all',
        minOrderAmount: 200,
        discountPercent: 10,
        badgeColor: 'purple',
        icon: '🏷️',
      });
    } else if (presetType === 'bill500off50') {
      setFormData({
        name: 'โปรเปิดบิลครบ 500 บาท ลดทันที 50 บาท',
        code: 'BILL500',
        type: 'cart_threshold',
        description: 'ยอดซื้อรวมทั้งบิลครบ 500 บาท รับส่วนลดท้ายบิลทันที 50 บาท',
        enabled: true,
        isAutoApply: true,
        applicableType: 'all',
        minOrderAmount: 500,
        discountAmount: 50,
        badgeColor: 'rose',
        icon: '💸',
      });
    } else if (presetType === 'weed3g500') {
      setFormData({
        name: 'โปรเซ็ตช่อดอกกัญชา 3 กรัม 500 บาท',
        code: 'WEED3G',
        type: 'bundle_price',
        description: 'ช่อดอกกัญชา 3 กรัม เหมาเพียง 500 บาท',
        enabled: true,
        isAutoApply: true,
        applicableType: 'category',
        applicableCategories: ['cannabis'],
        bundleQuantity: 3,
        bundlePrice: 500,
        badgeColor: 'teal',
        icon: '🌿',
      });
    } else if (presetType === 'tiered10off') {
      setFormData({
        name: 'โปรซื้อ 3 ชิ้นขึ้นไป ลดชิ้นละ 10 บาท',
        code: 'TIER3',
        type: 'tiered_qty',
        description: 'เมื่อซื้อสินค้าชนิดนี้ตั้งแต่ 3 ชิ้นขึ้นไป รับส่วนลดชิ้นละ 10 บาท',
        enabled: true,
        isAutoApply: true,
        applicableType: 'category',
        applicableCategories: ['cigarette', 'general'],
        minQuantity: 3,
        discountAmount: 10,
        badgeColor: 'blue',
        icon: '🪜',
      });
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPromotion(null);
    setFormData({
      name: 'โปรโมชั่น 3 ชิ้น 100 บาท',
      code: '3FOR100',
      type: 'bundle_price',
      description: 'เลือกซื้อสินค้า 3 ชิ้นในราคาพิเศษเพียง 100 บาท (คละได้)',
      enabled: true,
      isAutoApply: true,
      applicableType: 'category',
      applicableCategories: ['syrup', 'kratom', 'general'],
      applicableProductIds: [],
      bundleQuantity: 3,
      bundlePrice: 100,
      buyQuantity: 2,
      getFreeQuantity: 1,
      discountPercent: 10,
      discountAmount: 50,
      minQuantity: 3,
      minOrderAmount: 0,
      startDate: '',
      endDate: '',
      badgeColor: 'emerald',
      icon: '⚡',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      ...promo,
      applicableCategories: promo.applicableCategories || [],
      applicableProductIds: promo.applicableProductIds || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('กรุณาระบุชื่อโปรโมชั่น');
      return;
    }

    if (formData.type === 'bundle_price') {
      if (!formData.bundleQuantity || formData.bundleQuantity < 1) {
        alert('กรุณาระบุจำนวนชิ้นในชุดโปรโมชั่น (อย่างน้อย 1 ชิ้น)');
        return;
      }
      if (formData.bundlePrice === undefined || formData.bundlePrice < 0) {
        alert('กรุณาระบุราคาชุดเหมา');
        return;
      }
    } else if (formData.type === 'buy_x_get_y') {
      if (!formData.buyQuantity || !formData.getFreeQuantity) {
        alert('กรุณาระบุจำนวนที่ซื้อ และจำนวนที่แถมฟรี');
        return;
      }
    } else if (formData.type === 'percentage') {
      if (!formData.discountPercent || formData.discountPercent <= 0 || formData.discountPercent > 100) {
        alert('กรุณาระบุเปอร์เซ็นต์ส่วนลดระหว่าง 1 - 100%');
        return;
      }
    } else if (formData.type === 'fixed_amount') {
      if (!formData.discountAmount || formData.discountAmount <= 0) {
        alert('กรุณาระบุจำนวนเงินส่วนลด');
        return;
      }
    }

    if (editingPromotion) {
      updatePromotion(editingPromotion.id, formData);
    } else {
      addPromotion(formData as any);
    }

    setIsModalOpen(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered Promotions
  const filteredPromotions = promotions.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || p.type === filterType;
    const matchesCategory =
      filterCategory === 'all' ||
      p.applicableType === 'all' ||
      (p.applicableCategories && p.applicableCategories.includes(filterCategory));

    return matchesSearch && matchesType && matchesCategory;
  });

  const getBadgeColorClasses = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'teal':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatPromoRuleSummary = (p: Promotion) => {
    switch (p.type) {
      case 'bundle_price':
        return `⚡ ชุดเหมา ${p.bundleQuantity} ชิ้น เพียง ฿${p.bundlePrice?.toLocaleString()}`;
      case 'buy_x_get_y':
        return `🎁 ซื้อ ${p.buyQuantity} แถม ${p.getFreeQuantity} ฟรี`;
      case 'percentage':
        return `🏷️ ส่วนลด ${p.discountPercent}%${p.minOrderAmount ? ` (ขั้นต่ำ ฿${p.minOrderAmount})` : ''}`;
      case 'fixed_amount':
        return `💸 ลดทันที ฿${p.discountAmount?.toLocaleString()}${p.minOrderAmount ? ` (ขั้นต่ำ ฿${p.minOrderAmount})` : ''}`;
      case 'tiered_qty':
        return `🪜 ซื้อครบ ${p.minQuantity} ชิ้น ลดชิ้นละ ฿${p.discountAmount}`;
      case 'cart_threshold':
        return `🛒 ยอดบิลครบ ฿${p.minOrderAmount?.toLocaleString()} ลด ฿${p.discountAmount?.toLocaleString() || `${p.discountPercent}%`}`;
      default:
        return p.description || 'โปรโมชั่นพิเศษ';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">โปรโมชั่นที่เปิดใช้งาน</span>
            <div className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <span>{activePromotions}</span>
              <span className="text-xs font-bold text-slate-400">/ {totalPromotions} รายการ</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">จำนวนครั้งที่ลูกค้าใช้สิทธิ์</span>
            <div className="text-2xl font-black text-slate-900">{totalUsage.toLocaleString()} <span className="text-xs font-bold text-slate-400">ครั้ง</span></div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">ยอดส่วนลดที่มอบให้ลูกค้า</span>
            <div className="text-2xl font-black text-rose-600">฿{totalDiscountGiven.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">ระบบคำนวณอัตโนมัติ</span>
            <div className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl inline-block">
              Auto Real-time POS
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-5">
        {/* Top Actions & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">จัดการโปรโมชั่นและส่วนลด (Promotion Hub)</h2>
              <p className="text-xs text-slate-500">
                ตั้งค่าโปรโมชั่น 3 ชิ้น 100 บาท, ซื้อแถม, ลดเปอร์เซ็นต์, และระบบคำนวณอัตโนมัติหน้าร้าน
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างโปรโมชั่นใหม่</span>
          </button>
        </div>

        {/* Quick Preset Buttons Bar */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>เทมเพลตโปรโมชั่นยอดนิยม (กดเพื่อสร้างด่วน):</span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => {
                applyPreset('3for100');
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <span>⚡ 3 ชิ้น 100 บาท (ยอดนิยม)</span>
            </button>
            <button
              onClick={() => {
                applyPreset('buy2get1');
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 hover:border-amber-300 border border-slate-200 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <span>🎁 ซื้อ 2 แถม 1 ฟรี</span>
            </button>
            <button
              onClick={() => {
                applyPreset('weed3g500');
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-800 hover:border-teal-300 border border-slate-200 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <span>🌿 ช่อดอกกัญชา 3 กรัม 500 บ.</span>
            </button>
            <button
              onClick={() => {
                applyPreset('bill500off50');
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 hover:border-rose-300 border border-slate-200 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <span>💸 ครบ 500 ลด 50 บาท</span>
            </button>
            <button
              onClick={() => {
                applyPreset('10pct');
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 hover:border-purple-300 border border-slate-200 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <span>🏷️ ลด 10% เมื่อครบ 200 บ.</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโปร, รหัสโค้ด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">ทุกประเภทโปรโมชั่น</option>
              <option value="bundle_price">⚡ ชุดเหมา (เช่น 3 ชิ้น 100)</option>
              <option value="buy_x_get_y">🎁 ซื้อ X แถม Y</option>
              <option value="percentage">🏷️ ลดเปอร์เซ็นต์ (%)</option>
              <option value="fixed_amount">💸 ลดจำนวนเงิน (บาท)</option>
              <option value="tiered_qty">🪜 ซื้อราคาส่ง/ขั้นบันได</option>
              <option value="cart_threshold">🛒 ลดท้ายบิล</option>
            </select>

            {/* Filter by Category */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">ทุกหมวดหมู่สินค้า</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Promotions List Cards */}
        {filteredPromotions.length === 0 ? (
          <div className="p-10 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
            <Tag className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-bold text-sm text-slate-700">ไม่พบโปรโมชั่นที่ตรงกับเงื่อนไข</div>
            <p className="text-xs text-slate-500">คุณสามารถสร้างโปรโมชั่นใหม่ได้ทันทีโดยกดปุ่ม &quot;สร้างโปรโมชั่นใหม่&quot;</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างโปรโมชั่นแรก</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPromotions.map((promo) => {
              const isEnabled = promo.enabled;
              return (
                <div
                  key={promo.id}
                  className={`p-4 rounded-3xl border transition shadow-xs flex flex-col justify-between space-y-3 ${
                    isEnabled
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Icon, Name, Toggle */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg border shadow-2xs ${getBadgeColorClasses(
                            promo.badgeColor
                          )}`}
                        >
                          {promo.icon || '🏷️'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-extrabold text-sm text-slate-900">{promo.name}</h3>
                            {promo.code && (
                              <button
                                onClick={() => handleCopyCode(promo.code!)}
                                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1 transition cursor-pointer"
                                title="คัดลอกโค้ด"
                              >
                                <span>{promo.code}</span>
                                {copiedCode === promo.code ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 text-slate-400" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{promo.description}</p>
                        </div>
                      </div>

                      {/* On/Off Toggle Button */}
                      <button
                        onClick={() => togglePromotion(promo.id)}
                        className={`p-1 rounded-full transition cursor-pointer ${
                          isEnabled ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-500'
                        }`}
                        title={isEnabled ? 'ปิดการใช้งาน' : 'เปิดใช้งาน'}
                      >
                        {isEnabled ? (
                          <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                        ) : (
                          <XCircle className="w-6 h-6 fill-slate-100" />
                        )}
                      </button>
                    </div>

                    {/* Promotion Rules Pill */}
                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">{formatPromoRuleSummary(promo)}</span>
                      {promo.isAutoApply ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          ⚡ คำนวณอัตโนมัติ
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                          🔑 กรอกโค้ด
                        </span>
                      )}
                    </div>

                    {/* Applicable Scope details */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-600">เป้าหมาย:</span>
                      {promo.applicableType === 'all' && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                          ทุกสินค้าในร้าน
                        </span>
                      )}
                      {promo.applicableType === 'category' &&
                        promo.applicableCategories?.map((catId) => {
                          const b = businesses.find((biz) => biz.id === catId);
                          return (
                            <span
                              key={catId}
                              className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700"
                            >
                              {b?.icon} {b?.shortName || catId}
                            </span>
                          );
                        })}
                      {promo.applicableType === 'specific_products' && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                          เฉพาะสินค้าที่เลือก ({promo.applicableProductIds?.length || 0} รายการ)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Stats & Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                      <span>
                        ใช้แล้ว: <strong className="text-slate-800">{promo.timesUsed || 0}</strong> ครั้ง
                      </span>
                      <span>
                        ลดรวม: <strong className="text-rose-600">฿{(promo.totalDiscountGiven || 0).toLocaleString()}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(promo)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                        title="แก้ไขโปรโมชั่น"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`ยืนยันการลบโปรโมชั่น "${promo.name}"?`)) {
                            deletePromotion(promo.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="ลบโปรโมชั่น"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Promotion Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่ (Promotion Builder)'}
                  </h3>
                  <p className="text-xs text-slate-500">กำหนดเงื่อนไขโปรโมชั่น ส่วนลด และหมวดหมู่สินค้าที่ร่วมรายการ</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Promotion Type Selector */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 block">ประเภทโปรโมชั่น (Promotion Type):</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'bundle_price' })}
                    className={`p-3 rounded-2xl border text-left flex flex-col space-y-1 transition cursor-pointer ${
                      formData.type === 'bundle_price'
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center space-x-1">
                      <span>⚡ ชุดเหมา (3 ชิ้น 100)</span>
                    </div>
                    <span className="text-[10px] text-slate-500">ซื้อ X ชิ้น ในราคาเหมา Y บาท</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'buy_x_get_y' })}
                    className={`p-3 rounded-2xl border text-left flex flex-col space-y-1 transition cursor-pointer ${
                      formData.type === 'buy_x_get_y'
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center space-x-1">
                      <span>🎁 ซื้อ X แถม Y ฟรี</span>
                    </div>
                    <span className="text-[10px] text-slate-500">เช่น ซื้อ 2 แถม 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'percentage' })}
                    className={`p-3 rounded-2xl border text-left flex flex-col space-y-1 transition cursor-pointer ${
                      formData.type === 'percentage'
                        ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 text-purple-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center space-x-1">
                      <span>🏷️ ส่วนลดเปอร์เซ็นต์ (%)</span>
                    </div>
                    <span className="text-[10px] text-slate-500">ลด 10%, 20% เมื่อยอดครบ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'fixed_amount' })}
                    className={`p-3 rounded-2xl border text-left flex flex-col space-y-1 transition cursor-pointer ${
                      formData.type === 'fixed_amount'
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-blue-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center space-x-1">
                      <span>💸 ส่วนลดเงินสด (บาท)</span>
                    </div>
                    <span className="text-[10px] text-slate-500">ลดทันที 50 บาท</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'tiered_qty' })}
                    className={`p-3 rounded-2xl border text-left flex flex-col space-y-1 transition cursor-pointer ${
                      formData.type === 'tiered_qty'
                        ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20 text-teal-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center space-x-1">
                      <span>🪜 ซื้อราคาส่ง/ขั้นบันได</span>
                    </div>
                    <span className="text-[10px] text-slate-500">ซื้อ 3 ชิ้นขึ้นไป ลดชิ้นละ 10 บ.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'cart_threshold' })}
                    className={`p-3 rounded-2xl border text-left flex flex-col space-y-1 transition cursor-pointer ${
                      formData.type === 'cart_threshold'
                        ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 text-rose-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center space-x-1">
                      <span>🛒 ส่วนลดท้ายบิล</span>
                    </div>
                    <span className="text-[10px] text-slate-500">ยอดบิลครบ 500 ลด 50 บ.</span>
                  </button>
                </div>
              </div>

              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">ชื่อโปรโมชั่น *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น โปรโมชั่น 3 ชิ้น 100 บาท"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">รหัสโค้ดโปรโมชั่น (Promo Code)</label>
                  <input
                    type="text"
                    placeholder="เช่น 3FOR100 หรือเว้นว่าง"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white"
                  />
                </div>
              </div>

              {/* Type-Specific Parameters Card */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
                <span className="font-extrabold text-xs text-emerald-950 block">
                  ⚙️ ตั้งค่าตัวเลขเงื่อนไขโปรโมชั่น:
                </span>

                {/* 1. Bundle Price (3 for 100) */}
                {formData.type === 'bundle_price' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">จำนวนชิ้นในชุด (ชิ้น) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.bundleQuantity || 3}
                        onChange={(e) =>
                          setFormData({ ...formData, bundleQuantity: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base"
                      />
                      <span className="text-[10px] text-slate-500">เช่น 3 ชิ้น</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">ราคาเหมาทั้งชุด (บาท) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.bundlePrice || 100}
                        onChange={(e) =>
                          setFormData({ ...formData, bundlePrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base text-emerald-700"
                      />
                      <span className="text-[10px] text-slate-500">เช่น 100 บาท (เหมา 3 ชิ้น 100 บ.)</span>
                    </div>
                  </div>
                )}

                {/* 2. Buy X Get Y */}
                {formData.type === 'buy_x_get_y' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">ซื้อจำนวน (ชิ้น) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.buyQuantity || 2}
                        onChange={(e) =>
                          setFormData({ ...formData, buyQuantity: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base"
                      />
                      <span className="text-[10px] text-slate-500">เช่น ซื้อ 2 ชิ้น</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">แถมฟรีจำนวน (ชิ้น) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.getFreeQuantity || 1}
                        onChange={(e) =>
                          setFormData({ ...formData, getFreeQuantity: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base text-amber-700"
                      />
                      <span className="text-[10px] text-slate-500">เช่น แถมฟรี 1 ชิ้น (ซื้อ 2 แถม 1)</span>
                    </div>
                  </div>
                )}

                {/* 3. Percentage */}
                {formData.type === 'percentage' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">เปอร์เซ็นต์ส่วนลด (%) *</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={formData.discountPercent || 10}
                        onChange={(e) =>
                          setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base text-purple-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minOrderAmount || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Fixed Amount & Tiered */}
                {(formData.type === 'fixed_amount' || formData.type === 'cart_threshold') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">ส่วนลด (บาท) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.discountAmount || 50}
                        onChange={(e) =>
                          setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base text-rose-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minOrderAmount || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Tiered Qty */}
                {formData.type === 'tiered_qty' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">จำนวนซื้อขั้นต่ำ (ชิ้น) *</label>
                      <input
                        type="number"
                        min="2"
                        required
                        value={formData.minQuantity || 3}
                        onChange={(e) =>
                          setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 2 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">ลดชิ้นละ (บาท) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.discountAmount || 10}
                        onChange={(e) =>
                          setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-base text-teal-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Target Products / Category Selection */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-700 block">ขอบเขตสินค้าที่ร่วมรายการ:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, applicableType: 'all' })}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      formData.applicableType === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ทุกสินค้าในร้าน
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, applicableType: 'category' })}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      formData.applicableType === 'category'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    เฉพาะหมวดหมู่ที่เลือก
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, applicableType: 'specific_products' })}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      formData.applicableType === 'specific_products'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    เลือกสินค้าเฉพาะรายการ
                  </button>
                </div>

                {/* If Category is selected */}
                {formData.applicableType === 'category' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 block">เลือกหมวดหมู่ที่ร่วมรายการ (คละสินค้าได้):</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {businesses.map((b) => {
                        const isChecked = (formData.applicableCategories || []).includes(b.id);
                        return (
                          <label
                            key={b.id}
                            className={`p-2 rounded-xl border flex items-center space-x-2 transition cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = formData.applicableCategories || [];
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    applicableCategories: [...current, b.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    applicableCategories: current.filter((c) => c !== b.id),
                                  });
                                }
                              }}
                              className="rounded text-emerald-600"
                            />
                            <span>
                              {b.icon} {b.shortName || b.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* If Specific Products is selected */}
                {formData.applicableType === 'specific_products' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 max-h-48 overflow-y-auto">
                    <span className="text-[11px] font-bold text-slate-600 block">เลือกสินค้าที่ร่วมรายการ:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {products.map((p) => {
                        const isChecked = (formData.applicableProductIds || []).includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`p-2 rounded-xl border flex items-center justify-between space-x-2 transition cursor-pointer text-xs ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const current = formData.applicableProductIds || [];
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      applicableProductIds: [...current, p.id],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      applicableProductIds: current.filter((id) => id !== p.id),
                                    });
                                  }
                                }}
                                className="rounded text-emerald-600"
                              />
                              <span className="truncate">{p.name}</span>
                            </div>
                            <span className="text-slate-400 font-mono text-[10px]">฿{p.price}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Auto Apply Toggle & Enabled Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-extrabold text-slate-800 block">คำนวณอัตโนมัติ (Auto-Apply)</span>
                    <span className="text-[10px] text-slate-500">ตรวจจับและลดราคาทันทีเมื่อสินค้าในตะกร้าตรงเงื่อนไข</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isAutoApply ?? true}
                    onChange={(e) => setFormData({ ...formData, isAutoApply: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                </label>

                <label className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-extrabold text-slate-800 block">สถานะเปิดใช้งาน (Enabled)</span>
                    <span className="text-[10px] text-slate-500">เปิดให้ลูกค้าได้รับสิทธิ์โปรโมชั่นนี้</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enabled ?? true}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                </label>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">คำอธิบายโปรโมชั่น / ข้อความแสดงบนใบเสร็จ</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ซื้อไซรัปหรือน้ำกระท่อม 3 ชิ้น 100 บาท ประหยัดทันที 20 บาท"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Badge Color & Icon */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ไอคอนโปรโมชั่น</label>
                  <select
                    value={formData.icon || '⚡'}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="⚡">⚡ สายฟ้า (โปรด่วน / 3 ชิ้น 100)</option>
                    <option value="🎁">🎁 ของขวัญ (ซื้อแถม)</option>
                    <option value="🏷️">🏷️ ป้ายราคา (ลด %)</option>
                    <option value="🌿">🌿 สมุนไพร / กัญชา</option>
                    <option value="🥤">🥤 เครื่องดื่ม / กระท่อม</option>
                    <option value="🍜">🍜 อาหารและครัว</option>
                    <option value="💸">💸 เงินสดลดทันที</option>
                    <option value="🚬">🚬 ยาสูบ / บุหรี่</option>
                    <option value="🧪">🧪 ไซรัป / ฝาแดง</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">โทนสีป้าย</label>
                  <select
                    value={formData.badgeColor || 'emerald'}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="emerald">เขียว (Emerald)</option>
                    <option value="amber">ส้มทอง (Amber)</option>
                    <option value="rose">ชมพูแดง (Rose)</option>
                    <option value="blue">น้ำเงิน (Blue)</option>
                    <option value="purple">ม่วง (Purple)</option>
                    <option value="teal">เขียวอมฟ้า (Teal)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-md transition cursor-pointer"
                >
                  {editingPromotion ? 'บันทึกการแก้ไข' : 'บันทึกและเปิดใช้งานโปรโมชั่น'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
