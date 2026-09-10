import React, { useState, useEffect, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product, BusinessCategory, Customer } from '../../types';
import {
  Leaf,
  Coffee,
  Utensils,
  Package,
  Search,
  Plus,
  Minus,
  Trash2,
  UserCheck,
  ShieldCheck,
  CreditCard,
  QrCode,
  DollarSign,
  ArrowRight,
  Barcode,
  Camera,
  Sparkles,
  FileText,
  AlertCircle,
  Tag,
  Keyboard,
  HelpCircle,
  Command,
  CornerDownLeft,
  X,
  Sparkle,
  History,
  RotateCcw,
  Lock,
  Percent,
  Gift,
  Tags,
  Zap,
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { AddEditProductModal } from '../inventory/AddEditProductModal';
import { PromptPayQRCard } from './PromptPayQRCard';
import { CameraScannerModal } from '../common/CameraScannerModal';
import { OrderHistoryReturnsModal } from './OrderHistoryReturnsModal';
import { ManagerAuthModal } from '../common/ManagerAuthModal';
import { PromotionSelectModal } from './PromotionSelectModal';
import { QuickActionsModal } from './QuickActionsModal';
import { getBusinessBadgeStyle } from '../../utils/businessColorUtils';

export const POSTerminal: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartDiscount,
    updateCartNotes,
    clearCart,
    customers,
    shopSettings,
    cannabisLots,
    kratomBatches,
    businesses,
    units,
    currentUser,
    promotions,
    appliedPromotions,
    selectedPromoCodes,
    applyPromoCode,
    removePromoCode,
    upsellSuggestions,
  } = usePOS();

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  
  // Element Refs for keyboard focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const customerSelectRef = useRef<HTMLSelectElement>(null);

  // Keyboard shortcut feedback toast & modal
  const [shortcutToast, setShortcutToast] = useState<string | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerShortcutToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setShortcutToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setShortcutToast(null);
    }, 2200);
  };
  
  // Cart-level selections
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ageVerified, setAgeVerified] = useState(true);
  const [patientNote, setPatientNote] = useState('');
  const [prescriptionRef, setPrescriptionRef] = useState('');
  
  // Cannabis weight modal selector
  const [selectedCannabisProduct, setSelectedCannabisProduct] = useState<Product | null>(null);
  const [customGramWeight, setCustomGramWeight] = useState<number>(1);
  const [selectedLotId, setSelectedLotId] = useState<string>('');

  // Payment & Receipt Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [showQuickQrModal, setShowQuickQrModal] = useState(false);
  const [quickQrRefNo, setQuickQrRefNo] = useState('');

  // Add Menu Modal State & Access Control
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [isManagerAuthForAddMenuOpen, setIsManagerAuthForAddMenuOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isQuickActionsModalOpen, setIsQuickActionsModalOpen] = useState(false);

  const handleOpenAddMenu = () => {
    if (currentUser?.role === 'cashier') {
      setIsManagerAuthForAddMenuOpen(true);
    } else {
      setIsAddMenuModalOpen(true);
    }
  };

  // Filter Products
  const filteredProducts = (products || []).filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cannabisDetails?.strain?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Cart Totals
  const subtotal = (cart || []).reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalDiscount = (cart || []).reduce((acc, item) => acc + item.discount, 0);
  const netTotal = (cart || []).reduce((acc, item) => acc + item.subtotal, 0);
  const taxAmount = (netTotal * shopSettings.vatPercent) / (100 + shopSettings.vatPercent);

  // Cannabis Items in Cart check
  const hasCannabisInCart = (cart || []).some((item) => item.category === 'cannabis');
  const totalCannabisWeightGrams = (cart || [])
    .filter((item) => item.category === 'cannabis')
    .reduce((acc, item) => acc + item.quantity, 0);

  // Keyboard shortcut event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. Checkout: Ctrl + Enter / Cmd + Enter
      if (isCtrlOrMeta && e.key === 'Enter') {
        e.preventDefault();
        if (showPaymentModal) return;
        if (cart.length === 0) {
          triggerShortcutToast('⚠️ กรุณาเลือกสินค้าลงตะกร้าก่อนชำระเงิน');
          return;
        }
        if (hasCannabisInCart && !ageVerified) {
          triggerShortcutToast('⚠️ กรุณายืนยันการตรวจสอบอายุ 20+ สำหรับกัญชา');
          return;
        }
        setShowPaymentModal(true);
        triggerShortcutToast('⚡ [Ctrl+Enter] เข้าสู่ขั้นตอนชำระเงิน (Checkout)');
        return;
      }

      // 2. Clear Cart: Ctrl + Delete / Ctrl + Backspace / Cmd + Delete / Cmd + Backspace
      if (isCtrlOrMeta && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        if (cart.length > 0) {
          clearCart();
          triggerShortcutToast('🗑️ [Ctrl+Del] ล้างรายการในตะกร้าเรียบร้อย');
        } else {
          triggerShortcutToast('ℹ️ ตะกร้าสินค้าว่างอยู่แล้ว');
        }
        return;
      }

      // 3. Quick PromptPay QR: Ctrl + Q / Alt + Q
      if ((isCtrlOrMeta || e.altKey) && (e.key === 'q' || e.key === 'Q' || e.key === 'ๆ')) {
        e.preventDefault();
        if (cart.length === 0) {
          triggerShortcutToast('⚠️ กรุณาเลือกสินค้าลงตะกร้าก่อนสร้าง QR');
          return;
        }
        if (hasCannabisInCart && !ageVerified) {
          triggerShortcutToast('⚠️ กรุณายืนยันการตรวจสอบอายุ 20+ สำหรับกัญชา');
          return;
        }
        setShowQuickQrModal((prev) => !prev);
        triggerShortcutToast('📱 [Ctrl+Q] สแกน Thai QR PromptPay');
        return;
      }

      // 4. Focus Product Search: F2 / Ctrl+K / '/' (when not typing in an input)
      if (
        e.key === 'F2' ||
        (isCtrlOrMeta && (e.key === 'k' || e.key === 'K')) ||
        (!isInputFocused && e.key === '/')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        triggerShortcutToast('🔍 [F2] ค้นหาเมนู / สินค้า');
        return;
      }

      // 5. Focus Barcode / SKU Scanner: F3 / Ctrl+B
      if (
        e.key === 'F3' ||
        (isCtrlOrMeta && (e.key === 'b' || e.key === 'B'))
      ) {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
        triggerShortcutToast('🏷️ [F3] สแกน Barcode / SKU');
        return;
      }

      // 6. Quick Actions Modal: F4 / Alt + Q / Ctrl + M
      if (
        e.key === 'F4' ||
        (e.altKey && (e.key === 'q' || e.key === 'Q' || e.key === 'ๆ')) ||
        (isCtrlOrMeta && (e.key === 'm' || e.key === 'M'))
      ) {
        e.preventDefault();
        setIsQuickActionsModalOpen((prev) => !prev);
        triggerShortcutToast('⚡ [F4] เมนูด่วนหน้าร้าน POS (Quick Actions)');
        return;
      }

      // 6.1 Select Customer: Alt + C
      if (
        (e.altKey && (e.key === 'c' || e.key === 'C'))
      ) {
        e.preventDefault();
        customerSelectRef.current?.focus();
        triggerShortcutToast('👤 [Alt+C] เลือกลูกค้า / สมาชิก');
        return;
      }

      // 7. Toggle Keyboard Shortcuts Help: F1 / '?' (when not in input)
      if (
        e.key === 'F1' ||
        (!isInputFocused && e.key === '?')
      ) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // 8. Category Switching: Alt + 1-9
      if (e.altKey && ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        e.preventDefault();
        const activeBusinesses = (businesses || []).filter((b) => b.enabled);
        const categories: string[] = ['all', ...activeBusinesses.map((b) => b.id)];
        const catLabels = ['ทั้งหมด', ...activeBusinesses.map((b) => `${b.icon || '📦'} ${b.shortName || b.name}`)];
        const index = parseInt(e.key, 10) - 1;
        if (categories[index] !== undefined) {
          setSelectedCategory(categories[index]);
          triggerShortcutToast(`📂 [Alt+${e.key}] หมวด: ${catLabels[index]}`);
        }
        return;
      }

      // 9. Escape key: Close open modals / blur focus
      if (e.key === 'Escape') {
        if (isQuickActionsModalOpen) {
          setIsQuickActionsModalOpen(false);
        } else if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
        } else if (showQuickQrModal) {
          setShowQuickQrModal(false);
        } else if (selectedCannabisProduct) {
          setSelectedCannabisProduct(null);
        } else if (isCameraScannerOpen) {
          setIsCameraScannerOpen(false);
        } else if (isAddMenuModalOpen) {
          setIsAddMenuModalOpen(false);
        } else if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [
    cart,
    showPaymentModal,
    hasCannabisInCart,
    ageVerified,
    isQuickActionsModalOpen,
    isShortcutsModalOpen,
    showQuickQrModal,
    selectedCannabisProduct,
    isCameraScannerOpen,
    isAddMenuModalOpen,
    clearCart,
  ]);

  // Barcode Handler
  const handleScanCode = (code: string) => {
    const query = code.trim().toLowerCase();
    if (!query) return;
    const foundProduct = products.find(
      (p) => p.code.toLowerCase() === query
    );
    if (foundProduct) {
      if (foundProduct.category === 'cannabis') {
        setSelectedCannabisProduct(foundProduct);
        setSelectedLotId(foundProduct.cannabisDetails?.activeLotId || '');
      } else {
        addToCart(foundProduct, 1);
      }
      setIsCameraScannerOpen(false);
    } else {
      alert(`ไม่พบสินค้ารหัส Barcode / SKU: ${code}`);
    }
  };

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleScanCode(barcodeInput);
    setBarcodeInput('');
  };

  const handleAddCannabisWithWeight = () => {
    if (!selectedCannabisProduct || customGramWeight <= 0) return;
    addToCart(selectedCannabisProduct, customGramWeight, selectedLotId);
    setSelectedCannabisProduct(null);
    setCustomGramWeight(1);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[calc(100vh-8rem)]">
      {/* LEFT & CENTER: Product Catalog & Category Nav (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-3.5">
        {/* Top Search, Barcode Scanner & Hotkeys Bar */}
        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Search Input with Hotkey Ref */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="ค้นหาชื่อสินค้า, สายพันธุ์, รหัส (F2 หรือ /)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs pl-9 pr-14 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400 transition"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none hidden sm:inline-block">
              F2
            </span>
          </div>

          {/* Barcode Form with Hotkey Ref */}
          <form onSubmit={handleBarcodeSearch} className="flex items-center space-x-1.5">
            <div className="relative">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="สแกน Barcode (F3)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="bg-slate-50 text-slate-800 text-xs pl-9 pr-10 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400 w-32 sm:w-36 font-mono transition"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs pointer-events-none hidden sm:inline-block">
                F3
              </span>
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              สแกน
            </button>
            <button
              type="button"
              onClick={() => setIsCameraScannerOpen(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs flex items-center space-x-1 cursor-pointer"
              title="เปิดกล้องสแกน Barcode / QR Code"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">กล้อง</span>
            </button>
          </form>

          {/* Quick Actions Button (Kitchen / Shift / Drawer / Promos) */}
          <button
            type="button"
            onClick={() => setIsQuickActionsModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
            title="เมนูด่วนหน้าร้าน POS (F4 / Alt+Q)"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>เมนูด่วน</span>
            <span className="text-[9px] font-mono bg-black/20 text-white px-1 py-0.2 rounded font-bold">
              F4
            </span>
          </button>

          {/* Hotkeys Cheat Sheet Trigger */}
          <button
            type="button"
            onClick={() => setIsShortcutsModalOpen(true)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-2 rounded-xl text-xs font-semibold transition shadow-2xs flex items-center space-x-1.5 flex-shrink-0"
            title="ดูรายการคีย์ลัดทั้งหมด (F1 หรือ ?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">คีย์ลัด</span>
            <span className="text-[9px] font-mono bg-white border border-slate-300 text-slate-500 px-1 rounded">
              F1
            </span>
          </button>

          {/* Order History & Returns Button (Refunds) */}
          <button
            type="button"
            onClick={() => setIsOrderHistoryOpen(true)}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
            title="ประวัติบิล / คืนสินค้า / ขอเงินคืน (Refund)"
          >
            <History className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">ประวัติบิล/คืนสินค้า</span>
            {currentUser?.role === 'cashier' && (
              <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> PIN
              </span>
            )}
          </button>

          {/* Add Menu Button with Role Guard */}
          <button
            type="button"
            onClick={handleOpenAddMenu}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1 flex-shrink-0 cursor-pointer"
            title={currentUser?.role === 'cashier' ? 'เพิ่มเมนูใหม่ (ต้องใช้รหัส PIN ผู้จัดการอนุมัติ)' : 'เพิ่มเมนู / สินค้าใหม่พร้อมรูปภาพ'}
          >
            {currentUser?.role === 'cashier' ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">เพิ่มเมนู</span>
          </button>
        </div>

        {/* Dynamic Business Categories + All Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ทั้งหมด ({products.length})</span>
            <span className="text-[9px] font-mono opacity-60 ml-1">Alt+1</span>
          </button>

          {(businesses || [])
            .filter((b) => b.enabled)
            .map((b, idx) => {
              const isSelected = selectedCategory === b.id;
              const count = products.filter((p) => p.category === b.id).length;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedCategory(b.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{b.icon || '📦'}</span>
                  <span>{b.shortName || b.name}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>({count})</span>
                  {idx < 8 && <span className="text-[9px] font-mono opacity-60 ml-0.5">Alt+{idx + 2}</span>}
                </button>
              );
            })}
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-1 max-h-[calc(100vh-18rem)]">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">ไม่พบรายการสินค้าตรงกับคำค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.status === 'out_of_stock' || product.stockQuantity <= 0;
                const isDisabled = product.status === 'disabled';
                const isUnavailable = isOutOfStock || isDisabled;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (isUnavailable) return;
                      if (product.category === 'cannabis') {
                        setSelectedCannabisProduct(product);
                        setSelectedLotId(product.cannabisDetails?.activeLotId || '');
                      } else {
                        addToCart(product, 1);
                      }
                    }}
                    className={`group bg-white border rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer relative overflow-hidden shadow-xs ${
                      isUnavailable
                        ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                        : 'border-slate-200 hover:border-emerald-500/60 hover:shadow-md'
                    }`}
                  >
                    {/* Badge Tags */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                        {product.code}
                      </span>
                      {isDisabled ? (
                        <span className="bg-slate-200 text-slate-700 border border-slate-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          ⚪ ระงับการขาย
                        </span>
                      ) : isOutOfStock ? (
                        <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          🔴 สินค้าหมด
                        </span>
                      ) : product.category === 'cannabis' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                          THC {product.cannabisDetails?.thcPercent}%
                        </span>
                      ) : product.category === 'kratom' ? (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                          Batch อย.
                        </span>
                      ) : product.category === 'food' ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                          ครัวร้อน
                        </span>
                      ) : null}
                    </div>

                    {/* Product Image & Info */}
                    <div className="flex space-x-2.5 items-center my-1">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 flex-shrink-0">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700 transition">
                          {product.name}
                        </h4>
                        {product.cannabisDetails?.strain && (
                          <p className="text-[10px] text-emerald-700 truncate font-medium">
                            {product.cannabisDetails.strain}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          คงเหลือ:{' '}
                          <span
                            className={`font-semibold ${
                              product.stockQuantity < product.minStockAlert
                                ? 'text-amber-600'
                                : 'text-slate-700'
                            }`}
                          >
                            {product.stockQuantity} {product.stockUnit}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-extrabold text-emerald-700">
                          ฿{product.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400"> /{product.stockUnit}</span>
                      </div>

                      <button
                        disabled={isUnavailable}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition shadow-xs ${
                          isUnavailable
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart & Checkout Panel (5 Cols) */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative">
        {/* Cart Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">รายการขาย (Cart)</h3>
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-200 font-mono font-semibold">
                {cart.length} รายการ
              </span>
            </div>

            {/* Cart Header Actions */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsPromotionModalOpen(true)}
                className={`text-xs font-semibold flex items-center space-x-1 px-2 py-1 rounded-lg border transition ${
                  appliedPromotions.length > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="เลือกหรือใส่โค้ดโปรโมชั่น"
              >
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>โปรโมชั่น</span>
                {appliedPromotions.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {appliedPromotions.length}
                  </span>
                )}
              </button>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition"
                  title="ล้างตะกร้าสินค้า (Ctrl + Delete)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างตะกร้า</span>
                  <span className="text-[9px] font-mono bg-white border border-rose-300 text-rose-600 px-1 py-0.2 rounded hidden sm:inline">
                    Ctrl+Del
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Upsell Suggestion Banner */}
          {upsellSuggestions && upsellSuggestions.length > 0 && (
            <div className="my-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-2.5 flex items-start space-x-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-900 text-[11px]">ข้อเสนอสุดพิเศษ / โปรโมชั่นแนะนำ!</p>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-snug">
                  {upsellSuggestions[0].message}
                </p>
              </div>
              <button
                onClick={() => setIsPromotionModalOpen(true)}
                className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-1 rounded-lg transition shrink-0"
              >
                ดูโปร
              </button>
            </div>
          )}

          {/* Customer Selection */}
          <div className="my-3 flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200 relative">
            <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <select
              ref={customerSelectRef}
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                setSelectedCustomer(found || null);
              }}
              className="bg-transparent text-slate-800 text-xs w-full focus:outline-none font-medium pr-8"
            >
              <option value="" className="bg-white">
                -- เลือกลูกค้า / สมาชิก (สะสมแต้ม) --
              </option>
              {(customers || []).map((c) => (
                <option key={c.id} value={c.id} className="bg-white">
                  {c.name} ({c.phone}) - {c.points} แต้ม
                </option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 bg-white border border-slate-200 px-1 rounded pointer-events-none hidden sm:inline">
              F4
            </span>
          </div>

          {/* Cannabis Compliance Banner & Controls if Cannabis in Cart */}
          {hasCannabisInCart && (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 mb-3 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-900 font-semibold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  การควบคุมกัญชา 2569 (รวม {totalCannabisWeightGrams} g)
                </span>
                {totalCannabisWeightGrams > shopSettings.ageLimitCannabisGrams && (
                  <span className="text-amber-700 text-[10px] flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3 h-3" /> เกิน {shopSettings.ageLimitCannabisGrams}g
                  </span>
                )}
              </div>

              {/* Age 20+ Checkbox */}
              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer pt-1 border-t border-emerald-200/80">
                <input
                  type="checkbox"
                  checked={ageVerified}
                  onChange={(e) => setAgeVerified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-[11px] font-medium">
                  ยืนยันตรวจสอบบัตรประชาชน (อายุ 20 ปีขึ้นไป เเละไม่จำหน่ายแก่สตรีมีครรภ์)
                </span>
              </label>

              {/* Patient Note / Prescription Input */}
              <div className="pt-1 space-y-1">
                <input
                  type="text"
                  placeholder="เลขที่ใบสั่งจ่ายสมุนไพร / ใบรับรอง (ถ้ามี)"
                  value={prescriptionRef}
                  onChange={(e) => setPrescriptionRef(e.target.value)}
                  className="w-full bg-white text-slate-800 text-[11px] px-2.5 py-1.5 rounded border border-emerald-300 focus:outline-none placeholder-slate-400 font-mono"
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="overflow-y-auto max-h-[220px] space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                ยังไม่มีสินค้าในตะกร้า <br /> คลิกเลือกสินค้าจากฝั่งซ้ายเพื่อคิดเงิน
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs flex flex-col space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-slate-800">{item.productName}</h5>
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <span>฿{item.price.toLocaleString()} /{item.unit}</span>
                        {item.lotNumber && (
                          <span className="text-emerald-700 font-mono bg-emerald-100 px-1 rounded border border-emerald-200 font-medium">
                            Lot: {item.lotNumber}
                          </span>
                        )}
                        {item.batchNo && (
                          <span className="text-blue-700 font-mono bg-blue-100 px-1 rounded border border-blue-200 font-medium">
                            Batch: {item.batchNo}
                          </span>
                        )}
                        {item.appliedPromotionName && (
                          <span className="text-amber-700 font-medium bg-amber-100 px-1.5 py-0.2 rounded-md border border-amber-300 flex items-center gap-0.5">
                            <Tag className="w-2.5 h-2.5" />
                            {item.appliedPromotionName}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity & Discount Controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-bold text-slate-800">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      {item.discount > 0 && (
                        <div className="text-[10px] text-rose-600 line-through">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </div>
                      )}
                      <span className="font-bold text-emerald-700 text-sm">
                        ฿{item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart Totals & Checkout Trigger */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>ราคารวม (Subtotal):</span>
              <span className="font-mono text-slate-800 font-semibold">฿{subtotal.toLocaleString()}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>ส่วนลด (Discount):</span>
                <span className="font-mono">-฿{totalDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>ภาษีมูลค่าเพิ่ม VAT ({shopSettings.vatPercent}%):</span>
              <span className="font-mono">฿{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>ยอดรวมสุทธิ (NET TOTAL):</span>
              <span className="text-emerald-700 font-mono text-lg">
                ฿{netTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Payment Action Buttons with Hotkey Badges */}
          <div className="pt-2 grid grid-cols-5 gap-2">
            <button
              disabled={cart.length === 0 || (hasCannabisInCart && !ageVerified)}
              onClick={() => setShowQuickQrModal(true)}
              className={`col-span-2 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 border transition relative ${
                cart.length === 0 || (hasCannabisInCart && !ageVerified)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                  : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 shadow-2xs'
              }`}
              title="แสดง QR พร้อมเพย์สำหรับให้ลูกค้าสแกน (Ctrl + Q)"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>QR พร้อมเพย์</span>
              <span className="text-[9px] font-mono bg-white/90 border border-blue-300 text-blue-700 px-1 py-0.2 rounded shadow-2xs">
                Ctrl+Q
              </span>
            </button>

            <button
              disabled={cart.length === 0 || (hasCannabisInCart && !ageVerified)}
              onClick={() => setShowPaymentModal(true)}
              className={`col-span-3 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition ${
                cart.length === 0 || (hasCannabisInCart && !ageVerified)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
              title="เข้าสู่ขั้นตอนชำระเงิน (Ctrl + Enter)"
            >
              <DollarSign className="w-5 h-5" />
              <span>ชำระเงิน (Checkout)</span>
              <span className="text-[10px] font-mono bg-emerald-700 text-emerald-100 border border-emerald-500 px-1.5 py-0.5 rounded shadow-2xs">
                Ctrl+↵
              </span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Hotkey Feedback Toast */}
      {shortcutToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Keyboard className="w-4 h-4 text-emerald-400" />
          <span>{shortcutToast}</span>
        </div>
      )}

      {/* Keyboard Shortcuts Reference Modal (F1 / ?) */}
      {isShortcutsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full text-slate-800 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-200">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    คีย์ลัดหน้าจอขาย (POS Keyboard Hotkeys)
                  </h3>
                  <p className="text-slate-500 text-xs">
                    กดคีย์ลัดบนแป้นพิมพ์เพื่อความรวดเร็วในการขายหน้าร้าน
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShortcutsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">ชำระเงิน (Checkout)</span>
                <span className="font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  Ctrl + Enter
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">ล้างตะกร้า (Clear Cart)</span>
                <span className="font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  Ctrl + Del
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">Thai QR PromptPay</span>
                <span className="font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  Ctrl + Q
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">ค้นหาเมนู / สินค้า</span>
                <span className="font-mono font-bold bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  F2 หรือ /
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">สแกน Barcode / SKU</span>
                <span className="font-mono font-bold bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  F3 หรือ Ctrl+B
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">เมนูด่วน (Quick Actions)</span>
                <span className="font-mono font-bold bg-amber-500 text-white px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  F4 หรือ Alt+Q
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">เลือกลูกค้า / สมาชิก</span>
                <span className="font-mono font-bold bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  Alt + C
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">สลับหมวดหมู่สินค้า</span>
                <span className="font-mono font-bold bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  Alt + 1..5
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">ปิดหน้าต่าง / ยกเลิก</span>
                <span className="font-mono font-bold bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded shadow-2xs text-[11px]">
                  Esc
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                💡 รองรับทั้ง Windows (Ctrl) และ macOS (Cmd)
              </span>
              <button
                onClick={() => setIsShortcutsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition"
              >
                เข้าใจแล้ว (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cannabis Weight Picker Modal */}
      {selectedCannabisProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  ระบุน้ำหนักกัญชาช่อดอก (Grams)
                </h3>
              </div>
              <button
                onClick={() => setSelectedCannabisProduct(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">
                  {selectedCannabisProduct.name}
                </h4>
                <p className="text-slate-500">
                  สายพันธุ์: {selectedCannabisProduct.cannabisDetails?.strain} (THC{' '}
                  {selectedCannabisProduct.cannabisDetails?.thcPercent}%)
                </p>
                <p className="text-slate-500">
                  ราคา: ฿{selectedCannabisProduct.price}/กรัม | สต็อกคงเหลือ:{' '}
                  {selectedCannabisProduct.stockQuantity}g
                </p>
              </div>

              {/* Lot Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  เลือก Lot การรับเข้า (Compliance Lot):
                </label>
                <select
                  value={selectedLotId}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  {(cannabisLots || [])
                    .filter((l) => l.productId === selectedCannabisProduct.id)
                    .map((lot) => (
                      <option key={lot.id} value={lot.lotNumber}>
                        Lot: {lot.lotNumber} | COA: {lot.coaNumber} (เหลือ {lot.remainingWeightGrams}g)
                      </option>
                    ))}
                </select>
              </div>

              {/* Quick Weight Presets */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  เลือกน้ำหนักด่วน (Quick Presets):
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3.5, 5, 10].map((gram) => (
                    <button
                      key={gram}
                      onClick={() => setCustomGramWeight(gram)}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${
                        customGramWeight === gram
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {gram} g
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ระบุน้ำหนักตามชั่งจริง (กรัม):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={selectedCannabisProduct.stockQuantity}
                  value={customGramWeight}
                  onChange={(e) => setCustomGramWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 text-slate-900 text-base font-mono p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-500 font-bold"
                />
              </div>

              {/* Calculated Price */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center text-sm">
                <span className="text-slate-700 font-medium">รวมราคากัญชาช่อดอก:</span>
                <span className="font-extrabold text-emerald-800 text-base font-mono">
                  ฿{(selectedCannabisProduct.price * customGramWeight).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedCannabisProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddCannabisWithWeight}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                เพิ่มลงตะกร้า ({customGramWeight} g)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(order) => {
            setShowPaymentModal(false);
            setCompletedOrder(order);
          }}
          customer={selectedCustomer}
          patientMedicalNote={patientNote}
          prescriptionRef={prescriptionRef}
        />
      )}

      {/* Receipt Modal */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}

      {/* Add Menu Modal */}
      <AddEditProductModal
        isOpen={isAddMenuModalOpen}
        onClose={() => setIsAddMenuModalOpen(false)}
      />

      {/* Standalone Quick PromptPay QR Modal */}
      {showQuickQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 max-w-md w-full text-slate-800 shadow-2xl relative space-y-4 my-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  สแกนชำระเงิน Thai QR PromptPay
                </h3>
              </div>
              <button
                onClick={() => setShowQuickQrModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <PromptPayQRCard
              amount={netTotal}
              promptPayId={shopSettings.promptPayId || shopSettings.taxId || '0105568192083'}
              merchantName={shopSettings.promptPayName || shopSettings.shopName}
              refNo={quickQrRefNo}
              onRefNoChange={setQuickQrRefNo}
            />

            <div className="pt-2 flex justify-between space-x-2">
              <button
                onClick={() => setShowQuickQrModal(false)}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                ปิดหน้าจอ
              </button>
              <button
                onClick={() => {
                  setShowQuickQrModal(false);
                  setShowPaymentModal(true);
                }}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md transition"
              >
                <span>ไปที่หน้าชำระเงินหลัก</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner Modal for POS */}
      <CameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScan={handleScanCode}
        title="สแกน Barcode / SKU สินค้าด้วยกล้อง"
        description="ส่องกล้องไปที่รหัส Barcode สินค้าเพื่อเพิ่มลงตะกร้าขายอัตโนมัติ"
        sampleCodes={products.slice(0, 4).map((p) => ({
          code: p.code,
          label: p.name,
        }))}
      />

      {/* Promotion Select / Code Modal */}
      <PromotionSelectModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
      />

      {/* Order History & Returns / Refunds Modal */}
      <OrderHistoryReturnsModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />

      {/* Quick Actions Modal (F4 / Quick Actions Hub) */}
      <QuickActionsModal
        isOpen={isQuickActionsModalOpen}
        onClose={() => setIsQuickActionsModalOpen(false)}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onOpenPromotionModal={() => setIsPromotionModalOpen(true)}
        onOpenAddMenu={handleOpenAddMenu}
        onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
        onOpenQuickQr={() => setShowQuickQrModal(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Manager Authorization for Cashier Adding Menu */}
      <ManagerAuthModal
        isOpen={isManagerAuthForAddMenuOpen}
        onClose={() => setIsManagerAuthForAddMenuOpen(false)}
        onSuccess={() => {
          setIsAddMenuModalOpen(true);
        }}
        actionTitle="อนุมัติสร้างสินค้า / แก้ไขราคา (Product Authorization)"
        actionDescription="ตามกฎข้อที่ 1: แคชเชียร์ห้ามแก้ไขราคาสินค้าหรือสร้างสินค้าใหม่ ยกเว้นได้รับอนุมัติจากผู้จัดการร้าน"
        requiredRoleLabel="ผู้จัดการร้าน (Manager) หรือ Admin"
      />
    </div>
  );
};
