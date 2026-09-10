import React, { useState, useRef, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeSelectorModal } from './common/ThemeSelectorModal';
import {
  Store,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Info,
  Clock,
  LogOut,
  RefreshCw,
  ShoppingCart,
  Leaf,
  Coffee,
  Package,
  Truck,
  Sprout,
  Users,
  UserCog,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  Check,
  Grid,
  Menu,
  User,
  Palette,
  Lock,
  Sun,
  Moon,
  Tag,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    shopSettings,
    resetToDemoData,
    logout,
    isCloudSynced,
    isSyncing,
    pendingSyncCount,
    lastSyncTime,
    syncError,
  } = usePOS();
  const { activeTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationMenus = [
    { id: 'pos', label: 'หน้าหลัก POS (ขายสินค้า)', icon: ShoppingCart, badge: 'ขายสินค้า' },
    { id: 'cannabis', label: 'กัญชา (Compliance)', icon: Leaf, badge: '2569' },
    { id: 'kratom', label: 'น้ำกระท่อม (Batch)', icon: Coffee, badge: 'สูตรต้ม' },
    { id: 'inventory', label: 'คลังสินค้า (Stock)', icon: Package },
    { id: 'sources', label: 'แหล่งที่มาวัตถุดิบ (Origins)', icon: Sprout, badge: 'Trace' },
    { id: 'suppliers', label: 'ซัพพลายเออร์', icon: Truck },
    { id: 'customers', label: 'สมาชิก & ผู้ป่วย', icon: Users },
    { id: 'promotions', label: 'โปรโมชั่น & ส่วนลด', icon: Tag, badge: 'โปรโมชั่น' },
    { id: 'users', label: 'ผู้ใช้งานระบบ', icon: UserCog, badge: 'Admin' },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'reports', label: 'รายงาน & บัญชี', icon: FileSpreadsheet },
    { id: 'settings', label: 'ตั้งค่าร้านค้า', icon: Settings, badge: 'แอดมิน' },
  ];

  const currentMenu = navigationMenus.find((m) => m.id === activeTab) || navigationMenus[0];
  const CurrentMenuIcon = currentMenu.icon;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cashier':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'warehouse':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'kitchen':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'manager':
        return 'ผู้จัดการ (Manager)';
      case 'cashier':
        return 'แคชเชียร์ (Cashier)';
      case 'warehouse':
        return 'คลังสินค้า (Warehouse)';
      case 'kitchen':
        return 'พ่อครัว (Kitchen)';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('pos')}>
            <div className="bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-wide">
                  {shopSettings.shopName || 'THAI MULTI BUSINESS POS'}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  B.E. 2569 Compliant
                </span>
                {isSyncing ? (
                  <span
                    className="bg-sky-100 text-sky-800 text-[11px] px-2.5 py-0.5 rounded-full border border-sky-300 font-bold flex items-center gap-1.5 shadow-2xs animate-pulse"
                    title={`กำลังซิงค์ข้อมูล ${pendingSyncCount} รายการลง Cloud Firestore...`}
                  >
                    <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
                    <span>กำลังซิงค์... ({pendingSyncCount})</span>
                  </span>
                ) : isCloudSynced ? (
                  <span
                    className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold flex items-center gap-1 shadow-2xs"
                    title={lastSyncTime ? `ซิงค์กับ Firestore ล่าสุดเมื่อ ${lastSyncTime}` : 'เชื่อมต่อระบบ Cloud เรียบร้อย'}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>เรียลไทม์ ซิงค์แล้ว</span>
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-0.5 rounded-full border border-amber-300 font-medium animate-pulse">
                    กำลังเชื่อมต่อ Cloud...
                  </span>
                )}
                <button
                  onClick={logout}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs px-2.5 py-0.5 rounded-full border border-rose-200 font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                  title="ออกจากระบบ (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium hidden sm:flex">
                <span>🌿 กัญชาสมุนไพรควบคุม</span>
                <span>•</span>
                <span>🥤 น้ำกระท่อม</span>
                <span>•</span>
                <span>📦 สินค้าและวัตถุดิบ</span>
              </p>
            </div>
          </div>

          {/* Quick Info & Compliance Status */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700">ใบอนุญาตสมุนไพร:</span>
              <span className="text-amber-800 font-mono font-semibold">
                {shopSettings.cannabisLicenseNo}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-200">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700">อย. กระท่อม:</span>
              <span className="text-blue-800 font-mono font-semibold">
                {shopSettings.kratomFdaNo}
              </span>
            </div>
          </div>

          {/* User Profile & Main Menu Dropdown Trigger */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Global Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center border shadow-2xs ${
                isDarkMode
                  ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border-amber-400/30 ring-1 ring-amber-400/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง (Switch to Light Mode)' : 'เปลี่ยนเป็นโหมดมืด (Switch to Dark Mode)'}
              aria-label={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:text-indigo-600 transition-colors" />
              )}
            </button>

            {/* Theme Switcher Button */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center space-x-1 border border-slate-200 bg-slate-50"
              title="เปลี่ยนธีมสีประจำร้าน (5 แบบ)"
            >
              <Palette className="w-4 h-4 text-emerald-600" />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTheme.primaryColor }}></span>
            </button>

            {/* Info Trigger */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="ข้อมูลการรองรับกฎหมาย 2569"
            >
              <Info className="w-5 h-5 text-amber-500" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title={soundEnabled ? 'ปิดเสียงการแจ้งเตือน' : 'เปิดเสียงการแจ้งเตือน'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* LOGGED-IN USER & MAIN MENU DROPDOWN CONTAINER */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl border transition text-left cursor-pointer shadow-xs ${
                  showUserDropdown
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500/30'
                    : 'bg-emerald-50/90 hover:bg-emerald-100 text-slate-900 border-emerald-300'
                }`}
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover border border-emerald-400 shadow-2xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>

                <div className="hidden md:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-extrabold text-slate-900 leading-tight">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.1 rounded border font-bold ${getRoleBadge(
                        currentUser.role
                      )}`}
                    >
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1 mt-0.5">
                    <CurrentMenuIcon className="w-3 h-3 text-emerald-600" />
                    <span className="truncate max-w-[120px]">{currentMenu.label}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded-xl font-bold ml-1">
                  <Menu className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">เมนู</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* MAIN MENU & USER DROPDOWN PANEL */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 text-slate-800 animate-fadeIn space-y-3">
                  {/* User Profile Header Card */}
                  <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-400"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{currentUser.name}</h4>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-600/50">
                            {getRoleLabel(currentUser.role)}
                          </span>
                          <span className="text-[10px] text-emerald-300">● เชื่อมต่อแล้ว</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer shadow-xs border border-rose-500/50"
                      title="ออกจากระบบ"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>

                  {/* MAIN NAVIGATION MENU SECTION */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-slate-500 font-extrabold text-[11px]">
                      <span className="flex items-center space-x-1 text-slate-700">
                        <Grid className="w-3.5 h-3.5 text-emerald-600" />
                        <span>เมนูหลักระบบ (Main Navigation)</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        11 โมดูล
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
                      {navigationMenus.map((menu) => {
                        const Icon = menu.icon;
                        const isActive = activeTab === menu.id;
                        const isCashier = currentUser?.role === 'cashier';
                        const isRestricted = isCashier && ['inventory', 'users', 'reports', 'settings'].includes(menu.id);

                        return (
                          <button
                            key={menu.id}
                            onClick={() => {
                              setActiveTab(menu.id);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : isRestricted
                                ? 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-amber-300'
                                : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200/80 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  isActive
                                    ? 'bg-emerald-700 text-white'
                                    : isRestricted
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs'
                                    : 'bg-white text-emerald-600 border border-slate-200 shadow-2xs'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold">{menu.label}</span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {isRestricted ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>ขออนุมัติ</span>
                                </span>
                              ) : menu.badge ? (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                                    isActive
                                      ? 'bg-emerald-800 text-emerald-200'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {menu.badge}
                                </span>
                              ) : null}
                              {isActive && <Check className="w-4 h-4 text-emerald-200" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* USER ROLE SWITCHER SECTION */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="px-2 text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>สลับสิทธิ์ใช้งาน (Permission Switcher)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {(users || []).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u);
                            setShowUserDropdown(false);
                          }}
                          className={`p-2 rounded-xl text-[11px] font-semibold flex items-center space-x-2 transition cursor-pointer border ${
                            currentUser.id === u.id
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <div className="truncate text-left flex-1">
                            <div className="truncate leading-none">{u.name}</div>
                            <span className="text-[9px] text-slate-500 capitalize">{u.role}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BOTTOM UTILITY ACTIONS */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1.5">
                    <button
                      onClick={() => {
                        toggleDarkMode();
                        setShowUserDropdown(false);
                      }}
                      className={`w-full py-2 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer border ${
                        isDarkMode
                          ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border-amber-400/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span>สลับเป็นโหมดสว่าง (Light Mode)</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 text-indigo-600" />
                          <span>สลับเป็นโหมดมืด (Dark Mode)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowThemeModal(true);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs border border-slate-700"
                    >
                      <Palette className="w-4 h-4 text-emerald-400" />
                      <span>เปลี่ยนธีมสีประจำร้าน (5 แบบ)</span>
                      <span className="w-2.5 h-2.5 rounded-full ml-1" style={{ backgroundColor: activeTheme.primaryColor }}></span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างย้อนกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                          resetToDemoData();
                        }
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer border border-slate-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>รีเซ็ตข้อมูลสาธิต</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Selector Modal */}
      <ThemeSelectorModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />

      {/* Compliance Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-lg text-slate-900">ข้อกำหนดกฎหมายกัญชาและกระท่อม ปี 2569</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-emerald-950">
                <p className="font-semibold text-emerald-800 mb-1">🌿 1. กัญชา (สมุนไพรควบคุม):</p>
                <p>
                  ตามประกาศกฎหมายปี 2569 ช่อดอกกัญชาจัดเป็น “สมุนไพรควบคุม”
                  การจำหน่ายต้องเก็บข้อมูล Lot, COA, ใบอนุญาตผู้จำหน่าย, ประวัติการรับจ่าย (Stock Audit Trail)
                  และไม่อนุญาตให้จัดส่งออนไลน์หรือจำหน่ายแก่ผู้มีอายุต่ำกว่า 20 ปี/สตรีมีครรภ์
                </p>
              </div>

              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-blue-950">
                <p className="font-semibold text-blue-800 mb-1">🥤 2. น้ำกระท่อม (ข้อกำหนด อย.):</p>
                <p>
                  การจำหน่ายน้ำกระท่อมต้องมีการบันทึกสูตรผสม (Recipe) และเลข Batch
                  ในการผลิตแต่ละครั้ง พร้อมพิมพ์ข้อความเตือนบนฉลากตามที่ อย. กำหนดอย่างเคร่งครัด
                </p>
              </div>

              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-amber-950">
                <p className="font-semibold text-amber-800 mb-1">📦 3. ระบบตัดสต็อกและวัตถุดิบอัตโนมัติ:</p>
                <p>
                  ระบบจะทำการตัดสต็อกวัตถุดิบรายรายการตามบิลขายโดยอัตโนมัติ
                  พร้อมระบบตรวจสอบความถูกต้อง ตรวจสอบย้อนกลับ (Traceability) และแจ้งเตือนสต็อกต่ำ
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                รับทราบและเข้าใจ
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

