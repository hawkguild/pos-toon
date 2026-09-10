/**
 * THAI MULTI BUSINESS POS - Data Types
 * Cannabis (🌿) + Kratom (🥤) + Food (🍜) + General (📦)
 */

export type BusinessCategory = 'cannabis' | 'kratom' | 'food' | 'general' | string;

export interface CustomBusiness {
  id: string; // Unique identifier e.g. 'cannabis', 'kratom', 'food', 'general', 'spa', 'cafe', 'clothing'
  name: string; // Display Name e.g. 'กัญชาทางการแพทย์ (Medical Cannabis)'
  shortName: string; // Short Name e.g. 'กัญชา'
  icon: string; // Icon or Emoji e.g. '🌿', '🥤', '🍜', '📦', '💆', '☕', '🍰', '👕', '💊', '🧴', '🛠️'
  color: string; // 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'teal' | 'indigo' | 'cyan' | 'orange' | 'slate'
  description?: string;
  licenseFieldLabel?: string; // e.g. 'ใบอนุญาตจำหน่ายสมุนไพรควบคุม', 'เลข อย.', 'ใบอนุญาตประกอบอาหาร'
  licenseValue?: string; // e.g. 'นภ.102/2569'
  isSystem?: boolean;
  enabled: boolean;
}

export interface UnitDefinition {
  id: string; // e.g. 'g', 'kg', 'bottle', 'dish', 'pcs', 'pack', 'cup', 'box', 'can', 'set', 'roll', 'bag', 'liter', 'ml', 'hour'
  name: string; // e.g. 'กรัม (g)', 'ขวด (Bottle)', 'จาน (Dish)', 'ชิ้น/อัน (Pcs)', 'แก้ว (Cup)', 'กล่อง (Box)'
  symbol: string; // e.g. 'g', 'ขวด', 'จาน', 'ชิ้น', 'แพ็ค', 'แก้ว', 'กล่อง', 'กระป๋อง', 'ชุด', 'kg', 'L', 'ml', 'ชม.'
  categoryHint?: string; // e.g. 'น้ำหนัก', 'เครื่องดื่ม/บรรจุภัณฑ์', 'อาหาร', 'นับชิ้นทั่วไป', 'บริการ/เวลา'
  isSystem?: boolean;
  enabled: boolean;
}

export type UserRole = 'super_admin' | 'manager' | 'cashier' | 'warehouse' | 'kitchen';

export interface User {
  id: string;
  name: string;
  username?: string;
  password?: string;
  role: UserRole;
  pin: string;
  avatar?: string;
}

export interface Supplier {
  id: string;
  code: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  taxId: string;
  address: string;
  productTypes: BusinessCategory[];
  licenseNumber?: string; // e.g. ใบอนุญาตจำหน่าย/ปลูกกัญชา
  licenseExpiry?: string;
  status: 'active' | 'inactive';
}

export type CultivationType =
  | 'organic_soil'
  | 'indoor_hydroponic'
  | 'greenhouse'
  | 'wild_harvest'
  | 'factory_processed'
  | 'gap_standard'
  | 'other';

export interface RawMaterialSource {
  id: string;
  code: string; // e.g. 'RMS-2026-001' or 'ORG-CNB-01'
  name: string; // e.g. 'ฟาร์มกัญชาออร์แกนิคแม่ริม เชียงใหม่'
  category: BusinessCategory; // 'cannabis' | 'kratom' | 'food' | 'general' | custom
  materialName: string; // e.g. 'ช่อดอกกัญชาแห้งสายพันธุ์ KD Koh Tao', 'ใบกระท่อมสดก้านแดง'
  cultivationType: CultivationType;
  location: string; // e.g. '128 ม.3 ต.แม่แรม อ.แม่ริม'
  province: string; // e.g. 'เชียงใหม่'
  standardCertificates: string[]; // e.g. ['GACP (มาตรฐานการเพาะปลูกสมุนไพร)', 'GAP เกษตรปลอดภัย', 'Organic Thailand']
  certNumber?: string; // e.g. 'GACP-CM-2569-0118'
  certExpiryDate?: string; // e.g. '2028-12-31'
  contactPerson: string; // e.g. 'คุณธนภัทร สุขเกษม'
  phone: string; // e.g. '089-111-2233'
  supplierId?: string; // Linked supplier ID
  supplierName?: string; // Linked supplier name
  qualityGrade?: string; // e.g. 'Medical Grade AAA', 'Premium Organic Grade A', 'Commercial Grade'
  testLabName?: string; // e.g. 'กรมวิทยาศาสตร์การแพทย์', 'Central Laboratory Thailand'
  coaNumber?: string; // e.g. 'COA-TH-2026-881'
  status: 'active' | 'verified' | 'inactive' | 'quarantine';
  notes?: string;
  harvestSeason?: string; // e.g. 'ฤดูเก็บเกี่ยว Q1/2569'
  createdAt: string;
  updatedAt: string;
}

export interface CannabisLot {
  id: string;
  lotNumber: string; // e.g. LOT-2026-001
  productId: string;
  strain: string; // สายพันธุ์ e.g. KD Koh Tao
  type: 'flower' | 'pre_roll' | 'extract' | 'accessories';
  thcPercent: number;
  cbdPercent: number;
  coaNumber: string; // Certificate of Analysis e.g. COA-TH-2026-881
  supplierId: string;
  supplierName: string;
  originLocation: string; // e.g. ฟาร์มกัญชาออร์แกนิค เชียงใหม่
  initialWeightGrams: number;
  remainingWeightGrams: number;
  receivedDate: string;
  expiryDate: string;
  status: 'available' | 'low' | 'depleted' | 'quarantined';
  notes?: string;
}

export interface KratomRecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantityNeeded: number;
  unit: 'g' | 'kg' | 'ml' | 'L' | 'pcs';
}

export interface KratomBatch {
  id: string;
  batchNo: string; // e.g. KT-20260810-001
  productName: string;
  producedVolumeLiters: number;
  yieldBottles: number;
  bottleSizeMl: number;
  leafWeightGrams: number; // น้ำหนักใบกระท่อมที่ใช้ (g)
  leafOrigin?: string; // แหล่งที่มา/แหล่งปลูก e.g. สุราษฎร์ธานี
  processingDate?: string; // วันที่แปรรูป/ต้มสกัด
  processingWeightKg?: number; // น้ำหนักใบนวัตกรรมแปรรูป (kg)
  supplierName?: string; // ผู้จัดส่งวัตถุดิบ/ฟาร์ม
  notes?: string; // หมายเหตุการแปรรูป
  totalCostThb: number;
  costPerLiterThb: number;
  costPerBottleThb: number;
  productionDate: string;
  status: 'active' | 'sold_out' | 'expired';
  recipe: KratomRecipeItem[];
  fdaCompliantLabel: boolean;
}

export interface FoodRecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantityNeeded: number;
  unit: 'g' | 'kg' | 'ml' | 'L' | 'pcs';
  costPerUnit: number;
}

export interface Product {
  id: string;
  code: string; // SKU / Barcode
  name: string;
  category: BusinessCategory;
  subcategory: string; // e.g. 'Flower', 'Cold Drinks', 'Curry', 'Accessories'
  price: number;
  cost: number;
  stockUnit: string; // e.g. 'g' | 'bottle' | 'dish' | 'pcs' | 'pack' | 'cup' | 'box' | 'can' | 'kg' | 'set' | 'roll' | 'bag'
  stockQuantity: number;
  minStockAlert: number;
  image?: string;
  description?: string;
  status: 'available' | 'out_of_stock' | 'disabled';
  
  // Cannabis Specific
  cannabisDetails?: {
    strain: string;
    thcPercent: number;
    cbdPercent: number;
    activeLotId?: string;
    coaNumber?: string;
    controlledHerbLicenseRequired: boolean;
  };

  // Kratom Specific
  kratomDetails?: {
    activeBatchNo?: string;
    volumeMl?: number;
    recipe?: KratomRecipeItem[];
    fdaWarningLabel: string;
  };

  // Food Specific
  foodDetails?: {
    kitchenStation: 'kitchen' | 'bar' | 'prep';
    recipe?: FoodRecipeItem[];
    allowCustomNotes: boolean;
  };
}

export type PromotionType =
  | 'bundle_price'     // ชุดเหมา เช่น 3 ชิ้น 100 บาท, 5 ชิ้น 150 บาท
  | 'buy_x_get_y'      // ซื้อ X แถม Y เช่น ซื้อ 2 แถม 1
  | 'percentage'       // ลดเป็นเปอร์เซ็นต์ เช่น ลด 10%, ลด 20%
  | 'fixed_amount'     // ลดเป็นจำนวนเงิน เช่น ลด 50 บาท
  | 'tiered_qty'       // ซื้อขั้นต่ำได้ราคาพิเศษ เช่น ซื้อ 3 ชิ้นขึ้นไป ลดชิ้นละ 10 บาท
  | 'cart_threshold';  // ยอดซื้อครบ X บาท ลด Y บาท หรือ Z%

export interface AppliedPromotion {
  promoId: string;
  promoName: string;
  promoCode?: string;
  promoType: PromotionType;
  discountAmount: number;
  description?: string;
  badgeColor?: string;
}

export interface Promotion {
  id: string;
  name: string; // e.g. "โปรโมชั่น 3 ชิ้น 100 บาท"
  code?: string; // e.g. "PROMO3FOR100"
  type: PromotionType;
  description?: string;
  enabled: boolean;
  isAutoApply: boolean; // Auto-apply in cart or manual selection/code
  
  // Scope of products
  applicableType: 'all' | 'specific_products' | 'category';
  applicableProductIds?: string[];
  applicableCategories?: string[];
  
  // Rule Parameters
  bundleQuantity?: number; // e.g. 3
  bundlePrice?: number;    // e.g. 100
  
  buyQuantity?: number;    // e.g. 2
  getFreeQuantity?: number;// e.g. 1
  
  discountPercent?: number;// e.g. 10 (%)
  discountAmount?: number; // e.g. 50 (THB)
  
  minQuantity?: number;    // e.g. ซื้อขั้นต่ำ 3 ชิ้น
  minOrderAmount?: number; // e.g. ยอดบิลขั้นต่ำ 500 บาท
  
  // Validity dates
  startDate?: string;
  endDate?: string;
  
  // Visual styling
  badgeColor?: string; // emerald, amber, rose, blue, purple, indigo, teal
  icon?: string; // 🏷️, 🎁, ⚡, 🌿, 🥤, 📦, 🍜, ☕, 🚬, 🧪
  
  // Statistics / Tracking
  timesUsed?: number;
  totalDiscountGiven?: number;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // Unique cart item ID
  productId: string;
  productName: string;
  category: BusinessCategory;
  price: number;
  cost: number;
  quantity: number; // e.g. grams or dishes or bottles
  unit: string;
  discount: number; // THB
  subtotal: number;
  lotNumber?: string; // Selected Cannabis Lot
  batchNo?: string; // Selected Kratom Batch
  customNotes?: string; // e.g. "ไม่เผ็ด", "แยกน้ำแข็ง"
  appliedPromotionName?: string;
  originalPrice?: number;
  originalSubtotal?: number;
}

export type PaymentMethod = 'cash' | 'promptpay' | 'transfer' | 'card' | 'split';

export interface PaymentBreakdown {
  method: PaymentMethod;
  amount: number;
  referenceNo?: string;
  change?: number;
}

export interface SaleOrder {
  id: string;
  orderNo: string; // e.g. ORD-20260810-0012
  timestamp: string;
  cashierId: string;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  netTotal: number;
  paymentMethods: PaymentBreakdown[];
  paymentStatus: 'paid' | 'refunded' | 'partially_refunded';
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNo?: string;
  
  // Promotions applied to this sale
  appliedPromotions?: AppliedPromotion[];
  promoCode?: string;
  
  // Customer & Patient Info
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  patientMedicalNote?: string; // For cannabis compliance reference
  prescriptionRef?: string; // ใบสั่งจ่ายสมุนไพรควบคุม
  pointsEarned?: number; // แต้มสะสมที่ได้รับจากออเดอร์นี้
  pointsRedeemed?: number; // แต้มที่ใช้แลกเป็นส่วนลดในออเดอร์นี้
  pointsDiscount?: number; // มูลค่าส่วนลดจากการแลกแต้ม (THB)
  customerPointsBalance?: number; // ยอดแต้มสะสมคงเหลือล่าสุดหลังทำรายการ
  customerTier?: string; // ระดับสมาชิกขณะทำรายการ
  
  // Kitchen status
  kitchenStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'none';

  // Refund & Exchange Information
  refundReason?: string;
  refundedAt?: string;
  refundedBy?: string;
  refundApprovedByManager?: string;
  refundAmount?: number;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  category: BusinessCategory;
  lotNumber?: string;
  batchNo?: string;
  type: 'in' | 'sale' | 'adjustment' | 'damage' | 'return';
  quantityChange: number; // positive or negative
  balanceAfter: number;
  unit: string;
  reason: string;
  userId: string;
  userName: string;
}

export type TransactionType = 'income' | 'expense';

export interface Expense {
  id: string;
  type?: TransactionType; // 'expense' or 'income'
  title: string;
  category: 'ingredient' | 'utility' | 'wage' | 'rent' | 'asset' | 'other_income' | 'other';
  amount: number;
  date: string;
  recordedBy: string;
  notes?: string;
  receiptImage?: string;
}

export type MembershipTier = 'Bronze' | 'Silver' | 'Gold' | 'VIP';

export interface CustomerPointLog {
  id: string;
  timestamp: string;
  type: 'earn' | 'redeem' | 'adjust' | 'bonus' | 'refund';
  pointsChange: number; // e.g. +15, -50
  balanceAfter: number;
  orderNo?: string;
  orderAmount?: number;
  reason?: string;
  recordedBy?: string;
}

export interface Customer {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  birthDate?: string; // Age verification (20+)
  points: number;
  totalSpend: number;
  membershipTier?: MembershipTier;
  pointHistory?: CustomerPointLog[];
  medicalHistoryNote?: string;
  registeredDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. 'MANUAL_STOCK_ADJUSTMENT', 'PRICE_OVERRIDE', 'DELETE_ORDER'
  module: 'pos' | 'cannabis' | 'kratom' | 'inventory' | 'kitchen' | 'settings';
  details: string;
  oldValue?: string;
  newValue?: string;
  mandatoryReason?: string;
}

export interface KitchenOrder {
  id: string;
  orderNo: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNo?: string;
  timestamp: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unit: string;
    station: 'kitchen' | 'bar' | 'prep';
    customNotes?: string;
    status: 'pending' | 'preparing' | 'ready' | 'served';
  }[];
  overallStatus: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface CashierShift {
  id: string;
  shiftNumber: string; // e.g. 'SHIFT-20260826-001'
  cashierId: string;
  cashierName: string;
  role: UserRole;
  startTime: string;
  endTime?: string;
  status: 'active' | 'closed';
  startingFloatThb: number; // เงินทอนเริ่มต้น
  cashSalesThb: number; // ยอดขายเงินสด
  promptPaySalesThb: number; // ยอดขายพร้อมเพย์
  cardSalesThb: number; // ยอดขายบัตร/อื่นๆ
  totalSalesThb: number; // ยอดขายรวม
  orderCount: number; // จำนวนบิล
  closingCashActualThb?: number; // เงินสดที่นับได้จริงตอนปิดกะ
  cashDifferenceThb?: number; // ผลต่างเงินสด (ขาด/เกิน)
  notes?: string;
  closedBy?: string;
}

export interface ShopSettings {
  shopName: string;
  taxId: string;
  promptPayId?: string;
  promptPayName?: string;
  address: string;
  phone: string;
  cannabisLicenseNo: string;
  kratomFdaNo: string;
  foodLicenseNo: string;
  vatPercent: number; // e.g. 7%
  ageLimitCannabisGrams: number;
  receiptHeader: string;
  receiptFooter: string;
  autoPrintReceipt: boolean;
  ageVerificationRequired: boolean;
  requireMedicalRefForCannabis: boolean;
  businesses?: CustomBusiness[];
  units?: UnitDefinition[];
}
