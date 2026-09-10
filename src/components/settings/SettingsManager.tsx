import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { useTheme, THEMES, ThemeId } from '../../context/ThemeContext';
import { PromptPayQRCard } from '../pos/PromptPayQRCard';
import { BusinessCategorySettings } from './BusinessCategorySettings';
import { UnitSettings } from './UnitSettings';
import { ManagerAuthModal } from '../common/ManagerAuthModal';
import {
  Settings,
  Save,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Store,
  QrCode,
  Check,
  Eye,
  AlertCircle,
  Percent,
  CheckSquare,
  Square,
  Printer,
  Sparkles,
  Palette,
  RefreshCw,
  Scale,
  Layers,
  Lock,
  Key,
  Sun,
  Moon,
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { shopSettings, setShopSettings, addAuditLog, businesses, units, currentUser } = usePOS();
  const { themeId, setThemeId, activeTheme, rollRandomTheme, isDarkMode, setDarkMode } = useTheme();

  const isCashier = currentUser?.role === 'cashier';
  const [isManagerUnlocked, setIsManagerUnlocked] = useState(false);
  const [showManagerUnlockModal, setShowManagerUnlockModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'business' | 'units' | 'store' | 'theme'>('business');

  const [shopName, setShopName] = useState(shopSettings.shopName || '');
  const [address, setAddress] = useState(shopSettings.address || '');
  const [phone, setPhone] = useState(shopSettings.phone || '');
  const [taxId, setTaxId] = useState(shopSettings.taxId || '');
  const [promptPayId, setPromptPayId] = useState(
    shopSettings.promptPayId || shopSettings.taxId || '0105568192083'
  );
  const [promptPayName, setPromptPayName] = useState(
    shopSettings.promptPayName || shopSettings.shopName || 'บจก. ไทย มัลติ บิสซิเนส'
  );
  const [receiptHeader, setReceiptHeader] = useState(
    shopSettings.receiptHeader ||
      'ยินดีต้อนรับสู่ THAI MULTI BUSINESS POS\nศูนย์จำหน่ายสินค้าสมุนไพรควบคุมเเละอาหารมาตรฐาน'
  );
  const [receiptFooter, setReceiptFooter] = useState(
    shopSettings.receiptFooter ||
      'ขอบคุณที่อุดหนุนสินค้ามาตรฐาน B.E. 2569\nกรุณาเก็บบิลไว้เพื่อรับประกันคุณภาพสินค้า'
  );

  const [cannabisLicenseNo, setCannabisLicenseNo] = useState(
    shopSettings.cannabisLicenseNo || ''
  );
  const [kratomFdaNo, setKratomFdaNo] = useState(shopSettings.kratomFdaNo || '');
  const [foodLicenseNo, setFoodLicenseNo] = useState(shopSettings.foodLicenseNo || '');
  const [vatPercent, setVatPercent] = useState(shopSettings.vatPercent || 7);

  const [autoPrintReceipt, setAutoPrintReceipt] = useState(
    shopSettings.autoPrintReceipt ?? true
  );
  const [ageVerificationRequired, setAgeVerificationRequired] = useState(
    shopSettings.ageVerificationRequired ?? true
  );
  const [requireMedicalRefForCannabis, setRequireMedicalRefForCannabis] = useState(
    shopSettings.requireMedicalRefForCannabis ?? true
  );

  const [testRefNo, setTestRefNo] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...shopSettings,
      shopName,
      address,
      phone,
      taxId,
      promptPayId,
      promptPayName,
      receiptHeader,
      receiptFooter,
      cannabisLicenseNo,
      kratomFdaNo,
      foodLicenseNo,
      vatPercent,
      autoPrintReceipt,
      ageVerificationRequired,
      requireMedicalRefForCannabis,
    };
    setShopSettings(updated);
    addAuditLog(
      'UPDATE_SETTINGS',
      'settings',
      `อัปเดตการตั้งค่าร้านค้า: ${shopName}, PromptPay: ${promptPayId}`
    );
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (isCashier && !isManagerUnlocked) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 my-8 space-y-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-700 rounded-3xl flex items-center justify-center mx-auto border-2 border-indigo-200 shadow-xs">
            <Lock className="w-10 h-10 text-indigo-600" />
          </div>

          <div className="space-y-2">
            <span className="text-xs bg-indigo-100 text-indigo-900 font-extrabold px-3 py-1 rounded-full border border-indigo-200">
              🔒 สิทธิ์การเข้าถึงถูกจำกัด (Cashier Access Restricted)
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              ระบบตั้งค่าร้านค้า & โครงสร้างธุรกิจ
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              ตามระเบียบข้อที่ 4: สิทธิ์พนักงานแคชเชียร์ <strong>ห้ามเข้าถึงหรือแก้ไขการตั้งค่าระบบ คลังสินค้า หรือบัญชีผู้ใช้งาน</strong>
            </p>
          </div>

          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 text-xs text-indigo-950 text-left space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <ShieldAlert className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>การขออนุมัติจากผู้จัดการ (Manager Authorization)</span>
            </div>
            <p className="text-indigo-800 text-[11px] leading-relaxed">
              หากมีความจำเป็นต้องปรับเปลี่ยนการตั้งค่าระบบ กรุณาให้ <strong>ผู้จัดการร้าน (Manager)</strong> หรือ <strong>Super Admin</strong> ใส่รหัส PIN เพื่อปลดล็อก
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setShowManagerUnlockModal(true)}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>ใส่รหัส PIN ผู้จัดการเพื่อปลดล็อกชั่วคราว</span>
            </button>
          </div>
        </div>

        <ManagerAuthModal
          isOpen={showManagerUnlockModal}
          onClose={() => setShowManagerUnlockModal(false)}
          onSuccess={() => {
            setIsManagerUnlocked(true);
          }}
          actionTitle="ขออนุมัติตั้งค่าระบบ (Settings Authorization)"
          actionDescription="ตามกฎข้อที่ 4: แคชเชียร์ห้ามแก้ไขการตั้งค่าระบบ ยกเว้นได้รับอนุมัติจากผู้จัดการร้าน"
          requiredRoleLabel="ผู้จัดการร้าน (Manager) หรือ Admin"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Top Header Banner */}
      <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 text-indigo-200 backdrop-blur-xs">
            <Settings className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                Admin Control
              </span>
              <h2 className="text-xl font-extrabold text-white">
                ระบบตั้งค่าร้านค้า & โครงสร้างธุรกิจ (Settings & Business Architecture)
              </h2>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              กำหนดประเภทธุรกิจ, เพิ่ม/แก้ไขหน่วยนับสินค้า, หัวบิล, เลขประจำตัวผู้เสียภาษี, QR รับเงิน, เเละใบอนุญาตตามกฎหมาย (ซิงค์เรียลไทม์ผ่าน Firebase Cloud)
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-2xl flex items-center space-x-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>บันทึกข้อมูลเรียบร้อยแล้ว!</span>
          </div>
        )}
      </div>

      {/* Navigation Subtabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'business'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>หมวดการขาย & ธุรกิจ ({businesses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'units'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>หน่วยนับสินค้า ({units.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'store'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>ข้อมูลร้านค้า, ใบเสร็จ & PromptPay</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>ธีมสีร้าน & ความปลอดภัย</span>
        </button>
      </div>

      {/* Tab 1: Business Categories */}
      {activeTab === 'business' && (
        <BusinessCategorySettings />
      )}

      {/* Tab 2: Units of Measure */}
      {activeTab === 'units' && (
        <UnitSettings />
      )}

      {/* Tab 3: Store, Receipt & PromptPay */}
      {activeTab === 'store' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Column (7 Cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
            {/* Section 1: Shop Identity & Receipt Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>1. ข้อมูลร้านค้า เเละ ข้อความหัวบิล (Shop & Bill Header):</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    ชื่อร้านค้า / สถานประกอบการ (Shop Name) *:
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="เช่น THAI MULTI BUSINESS CENTER"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:border-indigo-500 font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    ข้อความสโลแกน / ต้อนรับส่วนหัวบิล (Receipt Header Text):
                  </label>
                  <textarea
                    rows={2}
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                    placeholder="ข้อความที่พิมพ์แสดงด้านบนสุดของใบเสร็จ"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">
                      เลขประจำตัวผู้เสียภาษี 13 หลัก (Tax ID) *:
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="0105568192083"
                      className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:bg-white focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">
                      เบอร์โทรศัพท์ติดต่อร้านค้า:
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="02-719-8888, 081-234-5678"
                      className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-mono focus:bg-white focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    ที่อยู่สถานประกอบการ (ระบุบนใบกำกับภาษีอย่างย่อ):
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    ข้อความท้ายบิล (Receipt Footer Text):
                  </label>
                  <textarea
                    rows={2}
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    placeholder="คำขอบคุณ นโยบายการเปลี่ยนสินค้า หรือคำเตือนการบริโภค"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: PromptPay Settings */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>2. ตั้งค่าระบบรับชำระ PromptPay QR Code (Dynamic QR):</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    เลขพร้อมเพย์ (เบอร์โทร 10 หลัก / เลขนิติบุคคล 13 หลัก / E-Wallet ID) *:
                  </label>
                  <input
                    type="text"
                    value={promptPayId}
                    onChange={(e) => setPromptPayId(e.target.value)}
                    placeholder="เช่น 0812345678 หรือ 0105568192083"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:bg-white focus:border-blue-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    ระบบจะนำเลขนี้ไปสร้างมาตรฐาน EMVCo PromptPay QR Code เพื่อรับเงินเข้าบัญชีนี้โดยตรง
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    ชื่อบัญชีผู้รับเงินที่แสดงแก่ลูกค้า:
                  </label>
                  <input
                    type="text"
                    value={promptPayName}
                    onChange={(e) => setPromptPayName(e.target.value)}
                    placeholder="เช่น บจก. ไทย มัลติ บิสซิเนส"
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-bold focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition flex items-center space-x-2 text-sm cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>บันทึกการตั้งค่าร้านค้า</span>
              </button>
            </div>
          </form>

          {/* Right Column: Previews */}
          <div className="lg:col-span-5 space-y-6">
            {/* PromptPay Live Card Preview */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <h4 className="font-extrabold text-sm text-white">
                    ตัวอย่าง QR พร้อมเพย์ที่หน้าจอ POS
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                  REALTIME PREVIEW
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                เมื่อทำการชำระเงินที่หน้า POS จอนี้จะแสดง PromptPay QR Code ตามข้อมูลที่คุณตั้งค่าไว้:
              </p>

              <PromptPayQRCard
                amount={1250}
                promptPayId={promptPayId || '0105568192083'}
                merchantName={promptPayName || shopName || 'THAI MULTI BUSINESS'}
                refNo={testRefNo}
                onRefNoChange={setTestRefNo}
              />
            </div>

            {/* Live Receipt Paper Preview Card */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-lg space-y-3 text-slate-800">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Printer className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    ตัวอย่างหัวบิลเเละใบเสร็จ (Receipt Paper Preview)
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300">
                  PAPER VOUCHER
                </span>
              </div>

              {/* Simulated Receipt Thermal Paper */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300 font-sans text-xs space-y-3 shadow-inner">
                {/* Header section */}
                <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300">
                  <h2 className="font-black text-sm uppercase text-slate-900 tracking-tight">
                    {shopName || 'ชื่อร้านค้าของคุณ'}
                  </h2>
                  {receiptHeader && (
                    <p className="text-[10px] text-emerald-800 font-bold whitespace-pre-line bg-emerald-50/80 p-1.5 rounded border border-emerald-200 my-1">
                      {receiptHeader}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-600">{address || 'ที่อยู่ร้านค้า'}</p>
                  <p className="text-[10px] text-slate-600 font-mono">
                    เลขผู้เสียภาษี: {taxId || '0105568192083'} | โทร: {phone || '02-719-8888'}
                  </p>

                  {(cannabisLicenseNo || kratomFdaNo || foodLicenseNo) && (
                    <div className="text-[9px] text-slate-700 bg-white p-1.5 rounded border border-slate-200 space-y-0.5 mt-1 font-mono">
                      {cannabisLicenseNo && <div>🌿 ใบอนุญาตสมุนไพร: {cannabisLicenseNo}</div>}
                      {kratomFdaNo && <div>🥤 เลข อย. กระท่อม: {kratomFdaNo}</div>}
                      {foodLicenseNo && <div>🍜 ใบอนุญาตอาหาร: {foodLicenseNo}</div>}
                    </div>
                  )}
                </div>

                {/* Sample item lines */}
                <div className="text-[10px] space-y-1 border-b border-dashed border-slate-300 pb-2">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>รายการสินค้าทดสอบ</span>
                    <span>จำนวน</span>
                    <span>รวม</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>1. ช่อดอกกัญชา OG Kush (2g)</span>
                    <span>1x</span>
                    <span className="font-mono">฿900.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>2. น้ำกระท่อมสูตรเข้มข้น (500ml)</span>
                    <span>2x</span>
                    <span className="font-mono">฿200.00</span>
                  </div>
                </div>

                {/* Totals */}
                <div className="text-[11px] space-y-0.5 text-slate-800">
                  <div className="flex justify-between">
                    <span>ราคารวม:</span>
                    <span className="font-mono">฿1,100.00</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>ภาษีมูลค่าเพิ่ม VAT {vatPercent}%:</span>
                    <span className="font-mono">฿{(1100 * (vatPercent / 100)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-300 pt-1">
                    <span>ยอดสุทธิ:</span>
                    <span className="font-mono text-emerald-800">
                      ฿{(1100 * (1 + vatPercent / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Footer text */}
                <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-500 whitespace-pre-line font-medium">
                  {receiptFooter || 'ขอบคุณที่อุดหนุน'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Theme & Compliance Settings */}
      {activeTab === 'theme' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 0: Theme Palette & Display Mode Switcher */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 text-xs">
            {/* Display Mode Selection */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-900 block">
                โหมดการแสดงผลหน้าจอ (Display Mode):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDarkMode(false)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                    !isDarkMode
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-slate-900">โหมดสว่าง (Light Mode)</div>
                      <div className="text-[10px] text-slate-500">โทนสีสว่าง สะอาดตา สำหรับใช้งานเวลากลางวัน</div>
                    </div>
                  </div>
                  {!isDarkMode && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDarkMode(true)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-900 text-white border-slate-800 shadow-xs ring-2 ring-amber-400/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-indigo-900/50 text-indigo-400">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-white">โหมดมืด (Dark Mode)</div>
                      <div className="text-[10px] text-slate-400">ถนอมสายตา สำหรับใช้งานเวลากลางคืนหรือลดแสงจ้า</div>
                    </div>
                  </div>
                  {isDarkMode && (
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 font-bold" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>ธีมสีประจำร้าน (5 โทนสีหลัก):</span>
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                ปัจจุบัน: {activeTheme.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                const theme = THEMES[id];
                const isSelected = themeId === id;

                return (
                  <div
                    key={id}
                    onClick={() => setThemeId(id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-6 h-6 rounded-lg border border-white shadow-2xs overflow-hidden shrink-0 flex items-center justify-center"
                        style={{
                          background:
                            id === 'random'
                              ? activeTheme.swatch[1]
                              : `linear-gradient(135deg, ${theme.swatch[0]} 50%, ${theme.swatch[1]} 50%)`,
                        }}
                      >
                        {id === 'random' && <Sparkles className="w-3 h-3 text-white" />}
                      </div>

                      <div className="truncate">
                        <div className="font-bold text-xs truncate">{theme.name}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {theme.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {id === 'random' && isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            rollRandomTheme();
                          }}
                          className="p-1 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition"
                          title="สุ่มสีใหม่"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Compliance & Legal Licenses */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>การกำกับดูแลตามกฎหมาย & ใบอนุญาต (Legal Compliance):</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  🌿 เลขที่ใบอนุญาตจำหน่ายสมุนไพรควบคุม (กัญชา):
                </label>
                <input
                  type="text"
                  value={cannabisLicenseNo}
                  onChange={(e) => setCannabisLicenseNo(e.target.value)}
                  placeholder="เช่น กท 102/2569"
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  🥤 เลขสารบบอาหาร / อย. ผลิตภัณฑ์กระท่อม:
                </label>
                <input
                  type="text"
                  value={kratomFdaNo}
                  onChange={(e) => setKratomFdaNo(e.target.value)}
                  placeholder="เช่น 10-1-01267-5-0001"
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  🍜 เลขที่ใบอนุญาตจัดตั้งสถานที่จำหน่ายอาหาร:
                </label>
                <input
                  type="text"
                  value={foodLicenseNo}
                  onChange={(e) => setFoodLicenseNo(e.target.value)}
                  placeholder="เช่น สอ. 445/2569"
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:bg-white focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Operational System Toggles */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
              ตัวเลือกการทำงานของระบบ POS (POS Operations):
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPrintReceipt}
                  onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700">
                  พิมพ์ใบเสร็จอัตโนมัติทันทีหลังชำระเงินสำเร็จ (Auto-Print Thermal Receipt)
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageVerificationRequired}
                  onChange={(e) => setAgeVerificationRequired(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700">
                  ตรวจสอบอายุลูกค้า (ต้องมีอายุ 20 ปีบริบูรณ์ขึ้นไปสำหรับกัญชา/กระท่อม)
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireMedicalRefForCannabis}
                  onChange={(e) => setRequireMedicalRefForCannabis(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700">
                  บันทึกข้อมูลใบรับรองแพทย์ / ประวัติการสั่งจ่ายกัญชาตามข้อบังคับ สธ.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition flex items-center space-x-2 text-sm cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
