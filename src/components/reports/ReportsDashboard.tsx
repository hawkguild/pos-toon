import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Expense, SaleOrder, User } from '../../types';
import { ManagerAuthModal } from '../common/ManagerAuthModal';
import {
  exportSalesSummaryCSV,
  exportSalesItemizedCSV,
  exportInventoryStockCSV,
  exportExpensesLedgerCSV,
  exportExecutiveFinancialReportCSV,
  exportDailyReportAndChartsCSV,
} from '../../lib/csvExport';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart2,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  Receipt,
  Leaf,
  Coffee,
  Utensils,
  Package,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  Key,
  Calendar,
  Layers,
  Flame,
  Percent,
  Activity,
  Sparkles,
  Filter,
  CheckCircle2,
  Info,
  HelpCircle,
  ArrowDownRight,
  Edit2,
  Trash2,
  Search,
  FileText,
  X,
  Tag,
  RotateCcw,
  Printer,
  Download,
  Check,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export const ReportsDashboard: React.FC = () => {
  const {
    orders = [],
    resetAllSales,
    resetAllExpenses,
    resetAllAccounting,
    expenses = [],
    addExpense,
    updateExpense,
    deleteExpense,
    shopSettings,
    products = [],
    currentUser,
  } = usePOS();

  // Cashier Role Restriction & Manager PIN Unlock
  const isCashier = currentUser?.role === 'cashier';
  const [isManagerUnlocked, setIsManagerUnlocked] = useState(false);
  const [showManagerUnlockModal, setShowManagerUnlockModal] = useState(false);
  const [unlockedManagerUser, setUnlockedManagerUser] = useState<User | null>(null);

  // Sales Reports Filter & Reset States
  const [salesTimeframe, setSalesTimeframe] = useState<'today' | 'weekly' | 'monthly' | 'all'>('all');
  const [showResetSalesModal, setShowResetSalesModal] = useState(false);
  const [resetAccountingScope, setResetAccountingScope] = useState<'all' | 'sales' | 'expenses'>('all');
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState<SaleOrder | null>(null);
  const [showDailyReceiptModal, setShowDailyReceiptModal] = useState(false);
  const [receiptTimeframe, setReceiptTimeframe] = useState<'today' | 'weekly' | 'monthly' | 'all'>('today');

  // CSV Export Modal & Notification States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportReportType, setExportReportType] = useState<
    'sales_summary' | 'sales_items' | 'inventory' | 'expenses' | 'executive_summary' | 'all'
  >('sales_summary');
  const [exportTimeframeOption, setExportTimeframeOption] = useState<
    'today' | 'weekly' | 'monthly' | 'all' | 'custom'
  >('all');
  const [exportStartDate, setExportStartDate] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [exportEndDate, setExportEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Helper to filter orders for CSV export
  const getOrdersForExport = (timeframe: 'today' | 'weekly' | 'monthly' | 'all' | 'custom', start?: string, end?: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return (orders || []).filter((o) => {
      if (!o) return false;
      if (timeframe === 'all') return true;
      const rawTime = o.timestamp || o.createdAt || (o as any).date || '';
      const orderDateStr = rawTime ? rawTime.split('T')[0] : '';
      const orderDate = rawTime ? new Date(rawTime) : new Date(0);

      if (timeframe === 'today') return orderDateStr === todayStr;
      if (timeframe === 'weekly') return orderDate >= sevenDaysAgo;
      if (timeframe === 'monthly') return orderDate >= thirtyDaysAgo;
      if (timeframe === 'custom') {
        if (start && orderDateStr < start) return false;
        if (end && orderDateStr > end) return false;
        return true;
      }
      return true;
    });
  };

  // Helper to filter expenses for CSV export
  const getExpensesForExport = (timeframe: 'today' | 'weekly' | 'monthly' | 'all' | 'custom', start?: string, end?: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return (expenses || []).filter((e) => {
      if (!e) return false;
      if (timeframe === 'all') return true;
      const eDateStr = e.date ? e.date.split('T')[0] : '';
      const eDate = e.date ? new Date(e.date) : new Date(0);

      if (timeframe === 'today') return eDateStr === todayStr;
      if (timeframe === 'weekly') return eDate >= sevenDaysAgo;
      if (timeframe === 'monthly') return eDate >= thirtyDaysAgo;
      if (timeframe === 'custom') {
        if (start && eDateStr < start) return false;
        if (end && eDateStr > end) return false;
        return true;
      }
      return true;
    });
  };

  const getTimeframeLabel = (tf: 'today' | 'weekly' | 'monthly' | 'all' | 'custom', start?: string, end?: string) => {
    if (tf === 'today') return 'รายวัน_(วันนี้)';
    if (tf === 'weekly') return 'รายสัปดาห์_(7_วัน)';
    if (tf === 'monthly') return 'รายเดือน_(30_วัน)';
    if (tf === 'custom') return `ช่วงวันที่_${start || ''}_ถึง_${end || ''}`;
    return 'ประวัติทั้งหมด';
  };

  // Export Trigger Handlers
  const handleExportSalesSummary = (tf: 'today' | 'weekly' | 'monthly' | 'all' | 'custom' = exportTimeframeOption) => {
    const targetOrders = getOrdersForExport(tf, exportStartDate, exportEndDate);
    exportSalesSummaryCSV(targetOrders, getTimeframeLabel(tf, exportStartDate, exportEndDate), shopSettings?.name);
    showToast(`ส่งออกข้อมูลสรุปยอดขาย (${targetOrders.length} บิล) เป็นไฟล์ CSV เรียบร้อยแล้ว`);
  };

  const handleExportSalesItemized = (tf: 'today' | 'weekly' | 'monthly' | 'all' | 'custom' = exportTimeframeOption) => {
    const targetOrders = getOrdersForExport(tf, exportStartDate, exportEndDate);
    exportSalesItemizedCSV(targetOrders, getTimeframeLabel(tf, exportStartDate, exportEndDate), shopSettings?.name);
    showToast(`ส่งออกรายการสินค้าขายละเอียด (${targetOrders.length} บิล) เป็นไฟล์ CSV เรียบร้อยแล้ว`);
  };

  const handleExportInventory = () => {
    exportInventoryStockCSV(products || [], shopSettings?.name);
    showToast(`ส่งออกข้อมูลสต็อกและมูลค่าทรัพย์สินคลัง (${products.length} รายการ) เป็นไฟล์ CSV เรียบร้อยแล้ว`);
  };

  const handleExportExpenses = (tf: 'today' | 'weekly' | 'monthly' | 'all' | 'custom' = exportTimeframeOption) => {
    const targetExpenses = getExpensesForExport(tf, exportStartDate, exportEndDate);
    exportExpensesLedgerCSV(targetExpenses, shopSettings?.name);
    showToast(`ส่งออกสมุดบัญชีรายรับ-รายจ่าย (${targetExpenses.length} รายการ) เป็นไฟล์ CSV เรียบร้อยแล้ว`);
  };

  const handleExportExecutive = (tf: 'today' | 'weekly' | 'monthly' | 'all' | 'custom' = exportTimeframeOption) => {
    const targetOrders = getOrdersForExport(tf, exportStartDate, exportEndDate);
    const targetExpenses = getExpensesForExport(tf, exportStartDate, exportEndDate);
    exportExecutiveFinancialReportCSV(targetOrders, targetExpenses, products || [], getTimeframeLabel(tf, exportStartDate, exportEndDate), shopSettings?.name);
    showToast(`ส่งออกงบการเงินและบัญชีบริหารผู้บริหารเป็นไฟล์ CSV เรียบร้อยแล้ว`);
  };

  const handleExportAllSelected = () => {
    const targetOrders = getOrdersForExport(exportTimeframeOption, exportStartDate, exportEndDate);
    const targetExpenses = getExpensesForExport(exportTimeframeOption, exportStartDate, exportEndDate);
    const tfLabel = getTimeframeLabel(exportTimeframeOption, exportStartDate, exportEndDate);

    exportSalesSummaryCSV(targetOrders, tfLabel, shopSettings?.name);
    setTimeout(() => {
      exportSalesItemizedCSV(targetOrders, tfLabel, shopSettings?.name);
    }, 400);
    setTimeout(() => {
      exportInventoryStockCSV(products || [], shopSettings?.name);
    }, 800);
    setTimeout(() => {
      exportExpensesLedgerCSV(targetExpenses, shopSettings?.name);
    }, 1200);
    setTimeout(() => {
      exportExecutiveFinancialReportCSV(targetOrders, targetExpenses, products || [], tfLabel, shopSettings?.name);
    }, 1600);

    showToast(`กำลังดาวน์โหลดไฟล์ CSV ทั้ง 5 ชุด สำหรับงานตรวจสอบบัญชีภายนอก`);
    setShowExportModal(false);
  };

  // Helper to format date-time string from SaleOrder
  const formatOrderDateTime = (ord: any): string => {
    if (!ord) return '-';
    const rawDate = ord.timestamp || ord.createdAt || ord.date;
    if (!rawDate) return '-';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return String(rawDate);
    }
  };

  // Helper to retrieve payment methods from SaleOrder
  const getOrderPaymentMethods = (ord: any): { method: string; amount?: number }[] => {
    if (!ord) return [];
    if (Array.isArray(ord.paymentMethods) && ord.paymentMethods.length > 0) {
      return ord.paymentMethods;
    }
    if (Array.isArray(ord.paymentBreakdown) && ord.paymentBreakdown.length > 0) {
      return ord.paymentBreakdown;
    }
    if (ord.paymentMethod) {
      return [{ method: ord.paymentMethod, amount: ord.netTotal || 0 }];
    }
    return [{ method: 'cash', amount: ord.netTotal || 0 }];
  };

  // Helper to render payment method badge
  const renderPaymentBadges = (ord: any) => {
    const methods = getOrderPaymentMethods(ord);
    if (methods.length === 0) {
      return <span className="text-slate-400 text-[11px]">-</span>;
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {methods.map((pb: any, idx: number) => {
          const m = String(pb.method || 'cash').toLowerCase();
          if (m === 'cash') {
            return (
              <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                💵 เงินสด
              </span>
            );
          } else if (m === 'promptpay' || m === 'transfer') {
            return (
              <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                📱 โอนพร้อมเพย์
              </span>
            );
          } else if (m === 'card' || m === 'credit_card') {
            return (
              <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                💳 บัตรเครดิต
              </span>
            );
          } else if (m === 'split') {
            return (
              <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                🔀 ชำระหลายช่องทาง
              </span>
            );
          } else {
            return (
              <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                {m === 'promptpay' ? 'โอนพร้อมเพย์' : m}
              </span>
            );
          }
        })}
      </div>
    );
  };

  // Modal and Edit State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Form State
  const [expType, setExpType] = useState<'expense' | 'income'>('expense');
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<Expense['category']>('ingredient');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expRecordedBy, setExpRecordedBy] = useState<string>('');
  const [expNotes, setExpNotes] = useState<string>('');

  // Table Filter & Search State
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Delete Confirmation State
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Filter low stock products
  const lowStockProducts = (products || []).filter(
    (p) => p.stockQuantity <= p.minStockAlert || p.status === 'out_of_stock'
  );

  // Calculated Metrics
  const posSalesRevenue = (orders || []).reduce((acc, o) => acc + (o?.netTotal || 0), 0);
  const totalTax = (orders || []).reduce((acc, o) => acc + (o?.taxAmount || 0), 0);

  const totalOtherIncome = (expenses || [])
    .filter((e) => e.type === 'income')
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const totalExpenses = (expenses || [])
    .filter((e) => (e.type || 'expense') === 'expense')
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const totalGrossIncome = posSalesRevenue + totalOtherIncome;
  const netBusinessProfit = totalGrossIncome - totalExpenses;

  const revenueByCategory = {
    cannabis: 0,
    kratom: 0,
    food: 0,
    general: 0,
  };

  (orders || []).forEach((o) => {
    (o?.items || []).forEach((item) => {
      if (item && item.category in revenueByCategory) {
        revenueByCategory[item.category] += item.subtotal || 0;
      }
    });
  });

  const totalRevenue = posSalesRevenue;
  const grossProfit = totalGrossIncome - totalExpenses;

  // Chart Data Preparation (Dynamic from actual orders)
  const chartData = useMemo(() => {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const dataMap: Record<string, number> = {
      '08:00': 0,
      '10:00': 0,
      '12:00': 0,
      '14:00': 0,
      '16:00': 0,
      '18:00': 0,
      '20:00': 0,
      '22:00': 0,
    };
    (orders || []).forEach((o) => {
      if (!o) return;
      const raw = o.timestamp || o.createdAt || (o as any).date;
      if (!raw) return;
      const d = new Date(raw);
      const h = d.getHours();
      const bucket =
        h < 10
          ? '08:00'
          : h < 12
          ? '10:00'
          : h < 14
          ? '12:00'
          : h < 16
          ? '14:00'
          : h < 18
          ? '16:00'
          : h < 20
          ? '18:00'
          : h < 22
          ? '20:00'
          : '22:00';
      dataMap[bucket] = (dataMap[bucket] || 0) + (o.netTotal || 0);
    });
    return hours.map((h) => ({ name: h, sales: dataMap[h] || 0 }));
  }, [orders]);

  const categoryBarData = [
    { name: '🌿 กัญชา', value: revenueByCategory.cannabis, color: '#10b981' },
    { name: '🥤 กระท่อม', value: revenueByCategory.kratom, color: '#3b82f6' },
    { name: '🍜 อาหาร', value: revenueByCategory.food, color: '#f97316' },
    { name: '📦 สินค้าทั่วไป', value: revenueByCategory.general, color: '#a855f7' },
  ];

  // Period Sales Calculations (Daily, Weekly, Monthly, All-time)
  const periodSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let todaySales = 0, todayCount = 0;
    let weekSales = 0, weekCount = 0;
    let monthSales = 0, monthCount = 0;
    let totalSales = 0, totalCount = 0;

    (orders || []).forEach((o) => {
      if (!o) return;
      const amount = o.netTotal || 0;
      totalSales += amount;
      totalCount += 1;

      const rawTime = o.timestamp || o.createdAt || (o as any).date || '';
      const orderDateStr = rawTime ? rawTime.split('T')[0] : '';
      const orderDate = rawTime ? new Date(rawTime) : new Date(0);

      if (orderDateStr === todayStr) {
        todaySales += amount;
        todayCount += 1;
      }
      if (orderDate >= sevenDaysAgo) {
        weekSales += amount;
        weekCount += 1;
      }
      if (orderDate >= thirtyDaysAgo) {
        monthSales += amount;
        monthCount += 1;
      }
    });

    return {
      todaySales,
      todayCount,
      weekSales,
      weekCount,
      monthSales,
      monthCount,
      totalSales,
      totalCount,
    };
  }, [orders]);

  // Filtered Orders based on timeframe selection
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return (orders || []).filter((o) => {
      if (!o) return false;
      if (salesTimeframe === 'all') return true;
      const rawTime = o.timestamp || o.createdAt || (o as any).date || '';
      const orderDateStr = rawTime ? rawTime.split('T')[0] : '';
      const orderDate = rawTime ? new Date(rawTime) : new Date(0);

      if (salesTimeframe === 'today') return orderDateStr === todayStr;
      if (salesTimeframe === 'weekly') return orderDate >= sevenDaysAgo;
      if (salesTimeframe === 'monthly') return orderDate >= thirtyDaysAgo;
      return true;
    });
  }, [orders, salesTimeframe]);

  const filteredPosSalesRevenue = useMemo(() => {
    return (filteredOrders || []).reduce((acc, o) => acc + (o?.netTotal || 0), 0);
  }, [filteredOrders]);

  // Selected Timeframe Detailed Summary Metrics (Total Revenue, Items Sold, Transactions)
  const selectedPeriodMetrics = useMemo(() => {
    let totalRevenue = 0;
    let itemsSold = 0;
    const transactions = filteredOrders.length;
    let totalDiscounts = 0;

    filteredOrders.forEach((o) => {
      totalRevenue += (o.netTotal || 0);
      totalDiscounts += (o.discountTotal || 0);
      (o.items || []).forEach((item) => {
        itemsSold += (item.quantity || 1);
      });
    });

    const avgTicket = transactions > 0 ? Math.round(totalRevenue / transactions) : 0;
    const avgItemsPerOrder = transactions > 0 ? (itemsSold / transactions).toFixed(1) : '0';

    return {
      totalRevenue,
      itemsSold,
      transactions,
      avgTicket,
      avgItemsPerOrder,
      totalDiscounts,
    };
  }, [filteredOrders]);

  // Printable Receipt Daily Summary Calculation
  const receiptSummaryData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const targetOrders = (orders || []).filter((o) => {
      if (!o) return false;
      if (receiptTimeframe === 'all') return true;
      const rawTime = o.timestamp || o.createdAt || (o as any).date || '';
      const orderDateStr = rawTime ? rawTime.split('T')[0] : '';
      const orderDate = rawTime ? new Date(rawTime) : new Date(0);

      if (receiptTimeframe === 'today') return orderDateStr === todayStr;
      if (receiptTimeframe === 'weekly') return orderDate >= sevenDaysAgo;
      if (receiptTimeframe === 'monthly') return orderDate >= thirtyDaysAgo;
      return true;
    });

    let totalBills = targetOrders.length;
    let grossSales = 0;
    let totalDiscount = 0;
    let totalTaxAmount = 0;
    let netSales = 0;

    let cashTotal = 0;
    let promptPayTotal = 0;
    let creditCardTotal = 0;
    let otherTotal = 0;

    const categoryStats: Record<string, { amount: number; qty: number }> = {
      cannabis: { amount: 0, qty: 0 },
      kratom: { amount: 0, qty: 0 },
      food: { amount: 0, qty: 0 },
      general: { amount: 0, qty: 0 },
    };

    const itemMap: Record<string, { name: string; qty: number; total: number; unit: string }> = {};

    targetOrders.forEach((ord) => {
      const net = ord.netTotal || 0;
      const sub = ord.subtotal || net;
      const disc = ord.discountTotal || (ord as any).discountAmount || 0;
      const tax = ord.taxAmount || 0;

      grossSales += sub;
      totalDiscount += disc;
      totalTaxAmount += tax;
      netSales += net;

      // Payment Breakdown
      const methods = getOrderPaymentMethods(ord);
      methods.forEach((pb) => {
        const m = String(pb.method || 'cash').toLowerCase();
        const amt = pb.amount !== undefined ? pb.amount : (methods.length === 1 ? net : net / methods.length);
        if (m === 'cash') {
          cashTotal += amt;
        } else if (m === 'promptpay' || m === 'transfer') {
          promptPayTotal += amt;
        } else if (m === 'card' || m === 'credit_card') {
          creditCardTotal += amt;
        } else {
          otherTotal += amt;
        }
      });

      // Category & Item Stats
      (ord.items || []).forEach((item) => {
        if (!item) return;
        const sub = item.subtotal || 0;
        const q = item.quantity || 1;
        const cat = item.category || 'general';

        if (cat in categoryStats) {
          categoryStats[cat].amount += sub;
          categoryStats[cat].qty += q;
        } else {
          categoryStats.general.amount += sub;
          categoryStats.general.qty += q;
        }

        const pKey = item.productId || item.productName || 'unknown';
        if (!itemMap[pKey]) {
          itemMap[pKey] = {
            name: item.productName || 'สินค้า',
            qty: 0,
            total: 0,
            unit: item.unit || 'ชิ้น',
          };
        }
        itemMap[pKey].qty += q;
        itemMap[pKey].total += sub;
      });
    });

    const topItems = Object.values(itemMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const targetExpenses = (expenses || []).filter((e) => {
      if (!e) return false;
      if (receiptTimeframe === 'all') return true;
      const eDateStr = e.date ? e.date.split('T')[0] : '';
      const eDate = e.date ? new Date(e.date) : new Date(0);

      if (receiptTimeframe === 'today') return eDateStr === todayStr;
      if (receiptTimeframe === 'weekly') return eDate >= sevenDaysAgo;
      if (receiptTimeframe === 'monthly') return eDate >= thirtyDaysAgo;
      return true;
    });

    const otherIncome = targetExpenses
      .filter((e) => e.type === 'income')
      .reduce((s, e) => s + (e.amount || 0), 0);

    const storeExpenseTotal = targetExpenses
      .filter((e) => (e.type || 'expense') === 'expense')
      .reduce((s, e) => s + (e.amount || 0), 0);

    const netEstimatedProfit = netSales + otherIncome - storeExpenseTotal;

    return {
      totalBills,
      grossSales,
      totalDiscount,
      totalTaxAmount,
      netSales,
      cashTotal,
      promptPayTotal,
      creditCardTotal,
      otherTotal,
      categoryStats,
      topItems,
      otherIncome,
      storeExpenseTotal,
      netEstimatedProfit,
    };
  }, [orders, expenses, receiptTimeframe]);

  // 30 Days Sales Trend Data Preparation (Cannabis, Kratom, Food)
  const daily30DaysTrendData = useMemo(() => {
    const daysMap: Record<
      string,
      { date: string; displayDate: string; cannabis: number; kratom: number; food: number; total: number }
    > = {};
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;

      daysMap[dateKey] = {
        date: dateKey,
        displayDate,
        cannabis: 0,
        kratom: 0,
        food: 0,
        total: 0,
      };
    }

    // Merge actual orders from POS context
    (orders || []).forEach((o) => {
      if (!o) return;
      const rawTime = o.timestamp || o.createdAt || (o as any).date || '';
      if (!rawTime) return;
      const orderDateKey = rawTime.split('T')[0];
      if (daysMap[orderDateKey]) {
        (o.items || []).forEach((item) => {
          const amt = item.subtotal || 0;
          if (item.category === 'cannabis') {
            daysMap[orderDateKey].cannabis += amt;
          } else if (item.category === 'kratom') {
            daysMap[orderDateKey].kratom += amt;
          } else if (item.category === 'food') {
            daysMap[orderDateKey].food += amt;
          }
          daysMap[orderDateKey].total += amt;
        });
      }
    });

    return Object.values(daysMap);
  }, [orders]);

  // Totals for last 30 days
  const totals30Days = useMemo(() => {
    return daily30DaysTrendData.reduce(
      (acc, day) => ({
        cannabis: acc.cannabis + day.cannabis,
        kratom: acc.kratom + day.kratom,
        food: acc.food + day.food,
        total: acc.total + day.total,
      }),
      { cannabis: 0, kratom: 0, food: 0, total: 0 }
    );
  }, [daily30DaysTrendData]);

  // 7-Day Bar Chart View State
  const [sevenDayChartMode, setSevenDayChartMode] = useState<'total' | 'stacked'>('total');

  // Last 7 Days Daily Total Sales Data for Recharts BarChart
  const daily7DaysSalesData = useMemo(() => {
    const daysMap: Record<
      string,
      {
        date: string;
        dayName: string;
        displayDate: string;
        fullDate: string;
        sales: number;
        orderCount: number;
        cannabis: number;
        kratom: number;
        food: number;
        general: number;
      }
    > = {};

    const thaiDayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const thaiMonthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayOfWeek = thaiDayNames[d.getDay()];
      const dayOfMonth = d.getDate();
      const monthName = thaiMonthNames[d.getMonth()];
      const displayDate = `${dayOfMonth} ${monthName}`;
      const fullDate = `${dayOfWeek} ${dayOfMonth} ${monthName} ${d.getFullYear() + 543}`;

      daysMap[dateKey] = {
        date: dateKey,
        dayName: `${dayOfWeek} ${dayOfMonth}`,
        displayDate,
        fullDate,
        sales: 0,
        orderCount: 0,
        cannabis: 0,
        kratom: 0,
        food: 0,
        general: 0,
      };
    }

    // Aggregate real orders
    (orders || []).forEach((o) => {
      if (!o) return;
      const rawTime = o.timestamp || o.createdAt || (o as any).date || '';
      if (!rawTime) return;
      const orderDateKey = rawTime.split('T')[0];
      if (daysMap[orderDateKey]) {
        const net = o.netTotal || 0;
        daysMap[orderDateKey].sales += net;
        daysMap[orderDateKey].orderCount += 1;

        (o.items || []).forEach((item) => {
          const amt = item.subtotal || 0;
          if (item.category === 'cannabis') daysMap[orderDateKey].cannabis += amt;
          else if (item.category === 'kratom') daysMap[orderDateKey].kratom += amt;
          else if (item.category === 'food') daysMap[orderDateKey].food += amt;
          else daysMap[orderDateKey].general += amt;
        });
      }
    });

    return Object.values(daysMap);
  }, [orders]);

  // Last 7 Days Summary Metrics
  const last7DaysSummary = useMemo(() => {
    let totalSales = 0;
    let totalOrders = 0;
    let maxSales = 0;
    let peakDay = '-';

    daily7DaysSalesData.forEach((d) => {
      totalSales += d.sales;
      totalOrders += d.orderCount;
      if (d.sales > maxSales) {
        maxSales = d.sales;
        peakDay = `${d.dayName} (${d.displayDate})`;
      }
    });

    const avgDailySales = Math.round(totalSales / 7);
    const avgTicket = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    return {
      totalSales,
      totalOrders,
      maxSales,
      peakDay: maxSales > 0 ? peakDay : 'ยังไม่มียอดขาย',
      avgDailySales,
      avgTicket,
    };
  }, [daily7DaysSalesData]);

  // Profit Margin Heatmap State
  const [heatmapTimeframe, setHeatmapTimeframe] = useState<'30days' | '7days' | 'today' | 'all'>('30days');
  const [heatmapMetric, setHeatmapMetric] = useState<'margin' | 'profit' | 'revenue' | 'roi'>('margin');

  // Profit Margin Heatmap Data Calculations (Computed directly from real order history)
  const categoryHeatmapData = useMemo(() => {
    // Filter orders by timeframe
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const relevantOrders = (orders || []).filter((o) => {
      if (!o) return false;
      if (heatmapTimeframe === 'all') return true;
      const raw = o.timestamp || o.createdAt || (o as any).date;
      if (!raw) return true;
      const d = new Date(raw);
      if (heatmapTimeframe === 'today') return raw.split('T')[0] === todayStr;
      if (heatmapTimeframe === '7days') return d >= sevenDaysAgo;
      if (heatmapTimeframe === '30days') return d >= thirtyDaysAgo;
      return true;
    });

    const categoryStats: Record<
      string,
      { revenue: number; cogs: number; itemsSold: number; orderCount: Set<string> }
    > = {
      kratom: { revenue: 0, cogs: 0, itemsSold: 0, orderCount: new Set() },
      cannabis: { revenue: 0, cogs: 0, itemsSold: 0, orderCount: new Set() },
      food: { revenue: 0, cogs: 0, itemsSold: 0, orderCount: new Set() },
      general: { revenue: 0, cogs: 0, itemsSold: 0, orderCount: new Set() },
    };

    relevantOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const cat = item.category in categoryStats ? item.category : 'general';
        const itemRevenue = item.subtotal || 0;
        const prod = (products || []).find((p) => p.id === item.productId);
        const unitCost = item.cost !== undefined ? item.cost : prod?.cost || 0;
        const itemCogs = unitCost * (item.quantity || 1);

        categoryStats[cat].revenue += itemRevenue;
        categoryStats[cat].cogs += itemCogs;
        categoryStats[cat].itemsSold += item.quantity || 1;
        categoryStats[cat].orderCount.add(o.id);
      });
    });

    const baseData = [
      {
        key: 'kratom',
        title: '🥤 สินค้ากระท่อม (Kratom)',
        icon: '🥤',
        description: 'น้ำกระท่อมต้มสด 100%, สูตรปรุงรส, ใบสดก้านแดง',
        revenue: categoryStats.kratom.revenue,
        estimatedCogs: categoryStats.kratom.cogs,
        itemsSold: categoryStats.kratom.itemsSold,
        avgTicket:
          categoryStats.kratom.orderCount.size > 0
            ? Math.round(categoryStats.kratom.revenue / categoryStats.kratom.orderCount.size)
            : 0,
        benchmark: 'หมวดสมุนไพรควบคุม',
      },
      {
        key: 'cannabis',
        title: '🌿 สินค้ากัญชา (Cannabis)',
        icon: '🌿',
        description: 'ดอกกัญชาเกรดพรีเมียม, Pre-roll, สารสกัด & อุปกรณ์',
        revenue: categoryStats.cannabis.revenue,
        estimatedCogs: categoryStats.cannabis.cogs,
        itemsSold: categoryStats.cannabis.itemsSold,
        avgTicket:
          categoryStats.cannabis.orderCount.size > 0
            ? Math.round(categoryStats.cannabis.revenue / categoryStats.cannabis.orderCount.size)
            : 0,
        benchmark: 'หมวดกัญชาทางการแพทย์',
      },
      {
        key: 'food',
        title: '🍜 อาหาร & เครื่องดื่ม (Food & Bev)',
        icon: '🍜',
        description: 'อาหารจานด่วน, อาหารทานเล่น, กาแฟสด & เครื่องดื่มโซดา',
        revenue: categoryStats.food.revenue,
        estimatedCogs: categoryStats.food.cogs,
        itemsSold: categoryStats.food.itemsSold,
        avgTicket:
          categoryStats.food.orderCount.size > 0
            ? Math.round(categoryStats.food.revenue / categoryStats.food.orderCount.size)
            : 0,
        benchmark: 'หมวดอาหารปรุงสด',
      },
      {
        key: 'general',
        title: '📦 สินค้าทั่วไป (General Retail)',
        icon: '📦',
        description: 'สินค้าเบ็ดเตล็ด, ของฝาก, บรรจุภัณฑ์ & อุปกรณ์เสริม',
        revenue: categoryStats.general.revenue,
        estimatedCogs: categoryStats.general.cogs,
        itemsSold: categoryStats.general.itemsSold,
        avgTicket:
          categoryStats.general.orderCount.size > 0
            ? Math.round(categoryStats.general.revenue / categoryStats.general.orderCount.size)
            : 0,
        benchmark: 'หมวดสินค้าทั่วไป',
      },
    ];

    return baseData.map((cat) => {
      const netProfit = cat.revenue - cat.estimatedCogs;
      const marginPct = cat.revenue > 0 ? Math.round((netProfit / cat.revenue) * 100) : 0;
      const roiPct = cat.estimatedCogs > 0 ? Math.round((netProfit / cat.estimatedCogs) * 100) : 0;

      // Color coding & heat rating
      let heatBg = 'from-emerald-500/10 via-teal-500/10 to-emerald-500/20';
      let heatBorder = 'border-emerald-400';
      let heatBadge = '🔥 ดีเยี่ยม (≥60%)';
      let badgeBg = 'bg-emerald-500/20 text-emerald-800 border-emerald-400/40';
      let barColor = 'bg-emerald-500';
      let textColor = 'text-emerald-700';

      if (cat.revenue === 0) {
        heatBg = 'from-slate-500/5 via-slate-500/5 to-slate-500/10';
        heatBorder = 'border-slate-300';
        heatBadge = '⚪ ยังไม่มียอดขาย';
        badgeBg = 'bg-slate-200 text-slate-700 font-bold';
        barColor = 'bg-slate-400';
        textColor = 'text-slate-600';
      } else if (marginPct >= 65) {
        heatBg = 'from-emerald-500/15 via-teal-500/10 to-emerald-600/20';
        heatBorder = 'border-emerald-400 shadow-emerald-100';
        heatBadge = '🔥 กำไรดีเยี่ยม (≥65%)';
        badgeBg = 'bg-emerald-600 text-white font-extrabold';
        barColor = 'bg-emerald-500';
        textColor = 'text-emerald-800';
      } else if (marginPct >= 50) {
        heatBg = 'from-blue-500/15 via-indigo-500/10 to-blue-600/20';
        heatBorder = 'border-blue-400 shadow-blue-100';
        heatBadge = '⚡ กำไรสูง (50-64%)';
        badgeBg = 'bg-blue-600 text-white font-extrabold';
        barColor = 'bg-blue-500';
        textColor = 'text-blue-800';
      } else if (marginPct >= 35) {
        heatBg = 'from-amber-500/15 via-yellow-500/10 to-amber-600/20';
        heatBorder = 'border-amber-400 shadow-amber-100';
        heatBadge = '⚖️ กำไรปานกลาง (35-49%)';
        badgeBg = 'bg-amber-600 text-white font-extrabold';
        barColor = 'bg-amber-500';
        textColor = 'text-amber-800';
      } else {
        heatBg = 'from-rose-500/15 via-red-500/10 to-rose-600/20';
        heatBorder = 'border-rose-400 shadow-rose-100';
        heatBadge = '⚠️ Margin ต่ำ (<35%)';
        badgeBg = 'bg-rose-600 text-white font-extrabold';
        barColor = 'bg-rose-500';
        textColor = 'text-rose-800';
      }

      return {
        ...cat,
        estimatedCogs: cat.estimatedCogs,
        netProfit,
        marginPct,
        roiPct,
        heatBg,
        heatBorder,
        heatBadge,
        badgeBg,
        barColor,
        textColor,
      };
    });
  }, [orders, products, heatmapTimeframe]);

  // Subcategory Heatmap Items for Detailed Matrix (Dynamic from real sales orders)
  const subcategoryHeatmapItems = useMemo(() => {
    const itemMap: Record<
      string,
      { name: string; category: string; revenue: number; cost: number; profit: number }
    > = {};

    (orders || []).forEach((o) => {
      (o.items || []).forEach((item) => {
        const prod = (products || []).find((p) => p.id === item.productId);
        const prodCost = item.cost !== undefined ? item.cost : prod?.cost || 0;
        const totalItemCost = prodCost * (item.quantity || 1);
        const itemRevenue = item.subtotal || 0;
        const itemProfit = itemRevenue - totalItemCost;

        const catLabel =
          item.category === 'cannabis'
            ? '🌿 กัญชา'
            : item.category === 'kratom'
            ? '🥤 กระท่อม'
            : item.category === 'food'
            ? '🍜 อาหาร'
            : '📦 ทั่วไป';

        const key = item.productName || item.productId || 'item';
        if (!itemMap[key]) {
          itemMap[key] = {
            name: item.productName || 'สินค้า',
            category: catLabel,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }
        itemMap[key].revenue += itemRevenue;
        itemMap[key].cost += totalItemCost;
        itemMap[key].profit += itemProfit;
      });
    });

    const items = Object.values(itemMap).map((it) => {
      const margin = it.revenue > 0 ? Math.round((it.profit / it.revenue) * 100) : 0;
      let badge = '⚖️ Moderate';
      if (margin >= 65) badge = '🔥 Top Margin';
      else if (margin >= 50) badge = '⚡ Healthy';

      return {
        ...it,
        margin,
        badge,
      };
    });

    return items.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [orders, products]);

  const handleOpenAddExpenseModal = (type: 'expense' | 'income' = 'expense') => {
    setEditingExpenseId(null);
    setExpType(type);
    setExpTitle('');
    setExpCategory(type === 'income' ? 'other_income' : 'ingredient');
    setExpAmount(0);
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpRecordedBy(currentUser?.name || 'ผู้จัดการร้าน');
    setExpNotes('');
    setShowExpenseModal(true);
  };

  const handleOpenEditExpenseModal = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpType(exp.type || 'expense');
    setExpTitle(exp.title);
    setExpCategory(exp.category);
    setExpAmount(exp.amount);
    setExpDate(exp.date || new Date().toISOString().split('T')[0]);
    setExpRecordedBy(exp.recordedBy || currentUser?.name || 'ผู้จัดการร้าน');
    setExpNotes(exp.notes || '');
    setShowExpenseModal(true);
  };

  const handleExpenseFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) {
      alert('กรุณากรอกชื่อรายการเเละจำนวนเงินให้ถูกต้อง (ต้องมากกว่า 0 บาท)');
      return;
    }

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        type: expType,
        title: expTitle.trim(),
        category: expCategory,
        amount: expAmount,
        date: expDate,
        recordedBy: expRecordedBy || currentUser?.name || 'ผู้จัดการร้าน',
        notes: expNotes,
      });
    } else {
      addExpense({
        type: expType,
        title: expTitle.trim(),
        category: expCategory,
        amount: expAmount,
        date: expDate,
        recordedBy: expRecordedBy || currentUser?.name || 'ผู้จัดการร้าน',
        notes: expNotes,
      });
    }

    setShowExpenseModal(false);
  };

  const handleDeleteExpenseConfirm = (id: string) => {
    deleteExpense(id);
    setDeletingExpenseId(null);
  };

  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((exp) => {
      const currentType = exp.type || 'expense';
      if (filterType !== 'all' && currentType !== filterType) return false;
      if (filterCategory !== 'all' && exp.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = exp.title.toLowerCase().includes(q);
        const matchNotes = (exp.notes || '').toLowerCase().includes(q);
        const matchRecorder = (exp.recordedBy || '').toLowerCase().includes(q);
        return matchTitle || matchNotes || matchRecorder;
      }
      return true;
    });
  }, [expenses, filterType, filterCategory, searchQuery]);

  const handleExportDailySalesAndCharts = (targetDateStr: string = new Date().toISOString().split('T')[0]) => {
    exportDailyReportAndChartsCSV({
      orders: orders || [],
      expenses: expenses || [],
      products: products || [],
      targetDate: targetDateStr,
      shopName: shopSettings?.name || 'POS TOON 81',
      hourlyChartData: chartData,
      sevenDaysChartData: daily7DaysSalesData,
      thirtyDaysChartData: daily30DaysTrendData,
    });
    showToast(`ส่งออกรายงานยอดขายประจำวันและข้อมูลสถิติกราฟ (${targetDateStr}) เป็นไฟล์ CSV เรียบร้อยแล้ว`);
  };

  if (isCashier && !isManagerUnlocked) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 my-8 space-y-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto border-2 border-amber-300 shadow-xs">
            <Lock className="w-10 h-10 text-amber-600" />
          </div>

          <div className="space-y-2">
            <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full border border-amber-300">
              🔒 สิทธิ์การเข้าถึงถูกจำกัด (Cashier Access Restricted)
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              รายงานกำไร-ขาดทุน และภาพรวมยอดขาย
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              ตามระเบียบข้อที่ 3: สิทธิ์พนักงานแคชเชียร์ <strong>ห้ามดูรายงานกำไร-ขาดทุน หรือรายงานสรุปยอดขายภาพรวมของร้าน</strong> เพื่อรักษาความลับทางการเงิน
            </p>
          </div>

          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>การขออนุญาตเปิดดูรายงาน (Manager Authorization)</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              หากมีความจำเป็นต้องตรวจสอบยอดหรือปิดกะประจำวัน กรุณาให้ <strong>ผู้จัดการร้าน (Manager)</strong> หรือ <strong>Super Admin</strong> ใส่รหัส PIN เพื่อปลดล็อกชั่วคราว
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowManagerUnlockModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-600/30 transition cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>ใส่รหัส PIN ผู้จัดการเพื่อปลดล็อกชั่วคราว</span>
            </button>
          </div>
        </div>

        {/* Manager Unlock Auth Modal */}
        <ManagerAuthModal
          isOpen={showManagerUnlockModal}
          onClose={() => setShowManagerUnlockModal(false)}
          onSuccess={(mgr) => {
            setUnlockedManagerUser(mgr);
            setIsManagerUnlocked(true);
            showToast(`🔓 ปลดล็อกการเข้าถึงรายงานโดย ผจก. ${mgr.name} เรียบร้อยแล้ว`);
          }}
          actionTitle="ขออนุมัติเปิดดูรายงาน (Manager Report Access)"
          actionDescription="ตามกฎข้อที่ 3: แคชเชียร์ห้ามดูรายงานสรุปยอดขายภาพรวมและกำไรขาดทุน ยกเว้นได้รับอนุมัติจากผู้จัดการร้าน"
          requiredRoleLabel="ผู้จัดการร้าน (Manager) หรือ Admin"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800">
      {/* If Cashier is temporarily unlocked by manager, show safety status strip */}
      {isCashier && isManagerUnlocked && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-extrabold">โหมดปลดล็อกชั่วคราวสำหรับแคชเชียร์: </span>
              <span>อนุมัติโดย {unlockedManagerUser?.name || 'ผู้จัดการร้าน'}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsManagerUnlocked(false);
              setUnlockedManagerUser(null);
            }}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-xl text-xs transition cursor-pointer self-end sm:self-auto"
          >
            🔒 ล็อกการเข้าถึงกลับทันที
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 p-3 rounded-2xl border border-indigo-200 text-indigo-700">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              แดชบอร์ดบริหารเเละรายงานบัญชีการเงิน (Executive BI & Accounting)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              วิเคราะห์รายได้แยกตามประเภทธุรกิจ (กัญชา / กระท่อม / อาหาร), รายงานภาษีขาย 7% เเละคำนวณกำไรสุทธิ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExportDailySalesAndCharts()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
            title="ส่งออกรายงานยอดขายประจำวันและข้อมูลสถิติกราฟทั้งหมดเป็นไฟล์ CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก CSV ยอดขาย & กราฟประจำวัน</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
            title="ส่งออกข้อมูลยอดขาย สต็อกสินค้า และบัญชีรายรับ-รายจ่ายเป็น CSV สำหรับโปรแกรมบัญชีภายนอก"
          >
            <Download className="w-4 h-4" />
            <span>ศูนย์ส่งออก CSV (Export Center)</span>
          </button>
          <button
            onClick={() => {
              setReceiptTimeframe(salesTimeframe);
              setShowDailyReceiptModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
            title="พิมพ์สลิปรายงานสรุปยอดขายประจำวัน"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์สลิปสรุปยอดขาย</span>
          </button>
          <button
            onClick={() => handleOpenAddExpenseModal('income')}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ บันทึกรายรับ</span>
          </button>
          <button
            onClick={() => handleOpenAddExpenseModal('expense')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ บันทึกรายจ่าย</span>
          </button>
          <button
            onClick={() => {
              setResetAccountingScope('all');
              setShowResetSalesModal(true);
            }}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 border border-rose-300 shadow-xs transition cursor-pointer"
            title="รีเซ็ตยอดขายและสมุดบัญชีทั้งหมดในระบบเป็น 0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>รีเซ็ตยอดบัญชีเป็น 0</span>
          </button>
        </div>
      </div>

      {/* Floating / Top Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-100" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-emerald-700/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold">ยอดขายรวม POS (POS Revenue)</span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> POS
            </span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono">
            ฿{posSalesRevenue.toLocaleString()}
          </p>
          {totalOtherIncome > 0 && (
            <p className="text-[11px] text-slate-500 font-medium">
              + รายรับอื่นๆ: <span className="font-bold text-emerald-600">฿{totalOtherIncome.toLocaleString()}</span>
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">รายจ่ายร้านค้าทั้งหมด (Total Expenses)</span>
          <p className="text-2xl font-extrabold text-rose-700 font-mono">
            ฿{totalExpenses.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            วัตถุดิบ, ค่าน้ำ/ไฟ, ค่าจ้าง, ค่าเช่า ฯลฯ
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">กำไรสุทธิคงเหลือ (Net Profit)</span>
          <p className={`text-2xl font-extrabold font-mono ${netBusinessProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
            ฿{netBusinessProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            คำนวณจาก (รายรับรวม POS + รายรับอื่น) - รายจ่าย
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">ภาษีขาย VAT 7% สรุปส่งกรมฯ</span>
          <p className="text-2xl font-extrabold text-blue-700 font-mono">
            ฿{totalTax.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            คำนวณจากบิลที่มี VAT 7%
          </p>
        </div>
      </div>

      {/* Sales Performance Reports (Daily, Weekly, Monthly) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                รายงานการขายประจำวัน/สัปดาห์/เดือน (Sales Performance Reports)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              วิเคราะห์สรุปยอดขายแยกตามช่วงเวลา พร้อมตรวจสอบตารางรายการออเดอร์ในระบบ
            </p>
          </div>

          {/* Timeframe Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setSalesTimeframe('today')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                salesTimeframe === 'today'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>รายวัน (วันนี้)</span>
            </button>
            <button
              onClick={() => setSalesTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                salesTimeframe === 'weekly'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>รายสัปดาห์ (7 วัน)</span>
            </button>
            <button
              onClick={() => setSalesTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                salesTimeframe === 'monthly'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>รายเดือน (30 วัน)</span>
            </button>
            <button
              onClick={() => setSalesTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                salesTimeframe === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>ทั้งหมด (All-Time)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleExportDailySalesAndCharts()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer shrink-0"
              title="ดาวน์โหลดรายงานยอดขายประจำวันและข้อมูลสถิติกราฟเป็นไฟล์ CSV สำหรับบันทึกประวัติ"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📥 CSV รายงานประจำวัน & กราฟ</span>
            </button>
            <button
              onClick={() => handleExportSalesSummary(salesTimeframe)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 border border-emerald-300 transition cursor-pointer shrink-0"
              title="ดาวน์โหลดไฟล์ CSV สรุปยอดขายตามช่วงเวลาที่เลือกสำหรับงานบัญชี"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>📊 CSV สรุปยอดขาย</span>
            </button>
            <button
              onClick={() => handleExportSalesItemized(salesTimeframe)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 border border-slate-300 transition cursor-pointer shrink-0"
              title="ดาวน์โหลดไฟล์ CSV รายการสินค้าที่ขายละเอียดตามช่วงเวลา"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <span>📋 CSV สินค้าแยกชิ้น</span>
            </button>
            <button
              onClick={() => {
                setReceiptTimeframe(salesTimeframe);
                setShowDailyReceiptModal(true);
              }}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 border border-indigo-200 transition cursor-pointer shrink-0"
              title="พิมพ์สลิปสรุปยอดขายประจำช่วงเวลา"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>🖨️ พิมพ์สลิปสรุป</span>
            </button>
          </div>
        </div>

        {/* 4 Period Comparison Overview Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className={`p-4 rounded-xl border transition ${salesTimeframe === 'today' ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50/70 border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> ยอดขายวันนี้ (Daily)
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {periodSales.todayCount} บิล
              </span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 font-mono">
              ฿{periodSales.todaySales.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              เฉลี่ย ฿{periodSales.todayCount > 0 ? Math.round(periodSales.todaySales / periodSales.todayCount).toLocaleString() : '0'} / บิล
            </p>
          </div>

          <div className={`p-4 rounded-xl border transition ${salesTimeframe === 'weekly' ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20' : 'bg-slate-50/70 border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-600" /> ยอดขายสัปดาห์นี้ (Weekly)
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {periodSales.weekCount} บิล
              </span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 font-mono">
              ฿{periodSales.weekSales.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              เฉลี่ย ฿{periodSales.weekCount > 0 ? Math.round(periodSales.weekSales / periodSales.weekCount).toLocaleString() : '0'} / บิล
            </p>
          </div>

          <div className={`p-4 rounded-xl border transition ${salesTimeframe === 'monthly' ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20' : 'bg-slate-50/70 border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-purple-600" /> ยอดขายเดือนนี้ (Monthly)
              </span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {periodSales.monthCount} บิล
              </span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 font-mono">
              ฿{periodSales.monthSales.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              เฉลี่ย ฿{periodSales.monthCount > 0 ? Math.round(periodSales.monthSales / periodSales.monthCount).toLocaleString() : '0'} / บิล
            </p>
          </div>

          <div className={`p-4 rounded-xl border transition ${salesTimeframe === 'all' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20' : 'bg-slate-50/70 border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-600" /> ยอดขายรวมทั้งหมด (All-Time)
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {periodSales.totalCount} บิล
              </span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 font-mono">
              ฿{periodSales.totalSales.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              เฉลี่ย ฿{periodSales.totalCount > 0 ? Math.round(periodSales.totalSales / periodSales.totalCount).toLocaleString() : '0'} / บิล
            </p>
          </div>
        </div>

        {/* Selected Period Summary Metric Cards Strip (Total Revenue, Items Sold, Transactions) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5 border border-indigo-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800/60 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-400/30">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  สรุปผลการดำเนินงานช่วงเวลาที่เลือก ({salesTimeframe === 'today' ? 'วันนี้' : salesTimeframe === 'weekly' ? '7 วันล่าสุด' : salesTimeframe === 'monthly' ? '30 วันล่าสุด' : 'ข้อมูลทั้งหมด'})
                </span>
                <p className="text-[11px] text-indigo-200/70">
                  Performance Metrics: Total Revenue, Items Sold & Transactions Summary
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <span className="text-xs text-indigo-200 bg-indigo-900/90 px-3 py-1 rounded-full border border-indigo-700/60 font-bold font-mono">
                {selectedPeriodMetrics.transactions} บิลในรอบนี้
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Total Revenue Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5 hover:bg-white/15 transition shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 text-xs font-bold flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Total Revenue (รายได้รวม)</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                  สุทธิ
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                ฿{selectedPeriodMetrics.totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center justify-between text-[11px] text-indigo-200/80 pt-1 border-t border-white/10">
                <span>ส่วนลดรวม: ฿{selectedPeriodMetrics.totalDiscounts.toLocaleString()}</span>
                <span className="font-mono">เฉลี่ย ฿{selectedPeriodMetrics.avgTicket.toLocaleString()} / บิล</span>
              </div>
            </div>

            {/* Items Sold Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5 hover:bg-white/15 transition shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 text-xs font-bold flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-300" />
                  <span>Items Sold (จำนวนชิ้นที่ขาย)</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  ทุกหมวดหมู่
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
                {selectedPeriodMetrics.itemsSold.toLocaleString()} <span className="text-sm font-sans font-medium text-white/80">ชิ้น</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-indigo-200/80 pt-1 border-t border-white/10">
                <span>เฉลี่ยต่อบิล: {selectedPeriodMetrics.avgItemsPerOrder} ชิ้น</span>
                <span className="text-[10px] text-amber-200/80">กัญชา/กระท่อม/อาหาร</span>
              </div>
            </div>

            {/* Transactions Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5 hover:bg-white/15 transition shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 text-xs font-bold flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-cyan-300" />
                  <span>Transactions (จำนวนบิล/ธุรกรรม)</span>
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-400/30">
                  POS Orders
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono tracking-tight">
                {selectedPeriodMetrics.transactions.toLocaleString()} <span className="text-sm font-sans font-medium text-white/80">รายการ</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-indigo-200/80 pt-1 border-t border-white/10">
                <span>สำเร็จ: {filteredOrders.filter(o => o.paymentStatus === 'paid').length} บิล</span>
                <span className="text-rose-300">คืนเงิน: {filteredOrders.filter(o => o.paymentStatus === 'refunded').length} บิล</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Daily Total Sales Bar Chart (Recharts Integration) */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  กราฟแท่งยอดขายรวมรายวัน 7 วันย้อนหลัง (7-Day Daily Sales Performance)
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                วิเคราะห์แนวโน้มยอดขายรวมและประเมินผลการดำเนินงานธุรกิจในรอบสัปดาห์ล่าสุด (7 วัน)
              </p>
            </div>

            {/* Mode Selector Toggle & Export */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleExportDailySalesAndCharts()}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 shadow-2xs text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="ส่งออกข้อมูลสถิติกราฟ 7 วันและยอดขายรายวันเป็น CSV"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>ส่งออกข้อมูลกราฟ (CSV)</span>
              </button>
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSevenDayChartMode('total')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    sevenDayChartMode === 'total'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>ยอดขายรวม</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSevenDayChartMode('stacked')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    sevenDayChartMode === 'stacked'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>แยกตามหมวดหมู่</span>
                </button>
              </div>
            </div>
          </div>

          {/* 7-Day Performance KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-1 shadow-2xs">
              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> ยอดขายรวม 7 วัน
              </span>
              <p className="text-lg font-mono font-extrabold text-indigo-700">
                ฿{last7DaysSummary.totalSales.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400">จากคำสั่งซื้อจริง 7 วันล่าสุด</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-1 shadow-2xs">
              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> ยอดขายเฉลี่ยต่อวัน
              </span>
              <p className="text-lg font-mono font-extrabold text-emerald-700">
                ฿{last7DaysSummary.avgDailySales.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400">เฉลี่ย 7 วันทำการ</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-1 shadow-2xs">
              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> วันที่ขายดีที่สุด
              </span>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">
                {last7DaysSummary.peakDay}
              </p>
              <p className="text-[11px] font-mono font-bold text-amber-600">
                {last7DaysSummary.maxSales > 0 ? `฿${last7DaysSummary.maxSales.toLocaleString()}` : '-'}
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-1 shadow-2xs">
              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-blue-600" /> ออเดอร์ทั้งหมด (7 วัน)
              </span>
              <p className="text-lg font-mono font-extrabold text-blue-700">
                {last7DaysSummary.totalOrders} <span className="text-xs font-sans font-medium text-slate-600">บิล</span>
              </p>
              <p className="text-[10px] text-slate-400">
                เฉลี่ย ฿{last7DaysSummary.avgTicket.toLocaleString()} / บิล
              </p>
            </div>
          </div>

          {/* Recharts BarChart Container */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 pt-5 shadow-2xs">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily7DaysSalesData} margin={{ top: 15, right: 15, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(val) => (val >= 1000 ? `฿${(val / 1000).toFixed(0)}k` : `฿${val}`)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0]?.payload;
                      if (!data) return null;
                      const avgPerOrder = data.orderCount > 0 ? Math.round(data.sales / data.orderCount) : 0;
                      return (
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-2 min-w-[200px]">
                          <div className="border-b border-slate-100 pb-1.5">
                            <p className="font-bold text-slate-900">{data.fullDate}</p>
                            <p className="text-[10px] text-slate-500">{data.date}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-slate-700">
                              <span className="font-medium">ยอดขายรวม:</span>
                              <span className="font-mono font-extrabold text-indigo-700 text-sm">
                                ฿{data.sales.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 text-[11px]">
                              <span>จำนวนออเดอร์:</span>
                              <span className="font-mono font-bold text-slate-700">{data.orderCount} บิล</span>
                            </div>
                            {data.orderCount > 0 && (
                              <div className="flex justify-between items-center text-slate-500 text-[11px]">
                                <span>ยอดเฉลี่ย/บิล:</span>
                                <span className="font-mono font-bold text-emerald-700">
                                  ฿{avgPerOrder.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Category breakdown */}
                          {(data.cannabis > 0 || data.kratom > 0 || data.food > 0 || data.general > 0) && (
                            <div className="pt-1.5 border-t border-slate-100 space-y-1 text-[10px]">
                              {data.cannabis > 0 && (
                                <div className="flex justify-between text-emerald-700 font-medium">
                                  <span>🌿 กัญชา:</span>
                                  <span className="font-mono font-bold">฿{data.cannabis.toLocaleString()}</span>
                                </div>
                              )}
                              {data.kratom > 0 && (
                                <div className="flex justify-between text-blue-700 font-medium">
                                  <span>🥤 กระท่อม:</span>
                                  <span className="font-mono font-bold">฿{data.kratom.toLocaleString()}</span>
                                </div>
                              )}
                              {data.food > 0 && (
                                <div className="flex justify-between text-amber-700 font-medium">
                                  <span>🍜 อาหาร:</span>
                                  <span className="font-mono font-bold">฿{data.food.toLocaleString()}</span>
                                </div>
                              )}
                              {data.general > 0 && (
                                <div className="flex justify-between text-purple-700 font-medium">
                                  <span>📦 ทั่วไป:</span>
                                  <span className="font-mono font-bold">฿{data.general.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  {sevenDayChartMode === 'stacked' && (
                    <Legend
                      verticalAlign="top"
                      height={32}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                    />
                  )}
                  {sevenDayChartMode === 'total' ? (
                    <Bar
                      dataKey="sales"
                      name="ยอดขายรวม"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    >
                      {daily7DaysSalesData.map((entry, index) => {
                        const isMax = entry.sales > 0 && entry.sales === last7DaysSummary.maxSales;
                        const fillColor =
                          entry.sales === 0
                            ? '#cbd5e1'
                            : isMax
                            ? '#4f46e5'
                            : '#6366f1';
                        return <Cell key={`cell-${index}`} fill={fillColor} />;
                      })}
                    </Bar>
                  ) : (
                    <>
                      <Bar
                        dataKey="cannabis"
                        name="🌿 กัญชา"
                        stackId="salesStack"
                        fill="#10b981"
                        maxBarSize={48}
                      />
                      <Bar
                        dataKey="kratom"
                        name="🥤 กระท่อม"
                        stackId="salesStack"
                        fill="#3b82f6"
                        maxBarSize={48}
                      />
                      <Bar
                        dataKey="food"
                        name="🍜 อาหาร"
                        stackId="salesStack"
                        fill="#f97316"
                        maxBarSize={48}
                      />
                      <Bar
                        dataKey="general"
                        name="📦 สินค้าทั่วไป"
                        stackId="salesStack"
                        fill="#a855f7"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 7-Day Mini Cards Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-4 border-t border-slate-100">
              {daily7DaysSalesData.map((day, idx) => {
                const isMax = day.sales > 0 && day.sales === last7DaysSummary.maxSales;
                const ratio = last7DaysSummary.maxSales > 0 ? (day.sales / last7DaysSummary.maxSales) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-center transition ${
                      isMax
                        ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400/30'
                        : day.sales > 0
                        ? 'bg-slate-50/90 border-slate-200'
                        : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-600 mb-0.5">{day.dayName}</div>
                    <div className="text-[9px] text-slate-400">{day.displayDate}</div>
                    <div className={`font-mono font-extrabold text-xs my-1 ${
                      isMax ? 'text-indigo-700' : day.sales > 0 ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      ฿{day.sales.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">
                      {day.orderCount} บิล
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isMax ? 'bg-indigo-600' : day.sales > 0 ? 'bg-indigo-400' : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.max(day.sales > 0 ? 8 : 0, ratio)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filtered Orders List Table for Selected Timeframe */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
          <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>รายการออเดอร์ขาย ({salesTimeframe === 'today' ? 'ประจำวันนี้' : salesTimeframe === 'weekly' ? 'ประจำสัปดาห์นี้' : salesTimeframe === 'monthly' ? 'ประจำเดือนนี้' : 'ทั้งหมดในระบบ'})</span>
              <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {filteredOrders.length} บิล
              </span>
            </h4>
            <div className="text-xs text-slate-600 font-medium">
              ยอดขายรวมช่วงเวลานี้: <span className="font-bold font-mono text-emerald-700">฿{filteredPosSalesRevenue.toLocaleString()}</span>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-600">ไม่มีรายการขายในช่วงเวลาที่เลือก</p>
              <p className="text-[11px] text-slate-400">เมื่อทำรายการขายจากหน้าร้าน POS ข้อมูลออเดอร์จะแสดงผลที่นี่ทันที</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">เลขที่ออเดอร์</th>
                    <th className="p-3">วัน-เวลา</th>
                    <th className="p-3">ประเภทร้าน</th>
                    <th className="p-3 text-center">จำนวนสินค้า</th>
                    <th className="p-3">ชำระเงินโดย</th>
                    <th className="p-3 text-right">ยอดรวม (฿)</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        #{ord.orderNo || ord.id.substring(0, 8)}
                      </td>
                      <td className="p-3 text-slate-600 text-[11px] whitespace-nowrap">
                        {formatOrderDateTime(ord)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {ord.orderType === 'dine_in' ? `ทานในร้าน (${ord.tableNo || 'โต๊ะ'})` : ord.orderType === 'takeaway' ? 'รับกลับบ้าน' : 'เดลิเวอรี่'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold whitespace-nowrap">
                        {ord.items ? ord.items.reduce((s, i) => s + (i.quantity || 1), 0).toLocaleString('th-TH', { maximumFractionDigits: 2 }) : 0} ชิ้น
                      </td>
                      <td className="p-3">
                        {renderPaymentBadges(ord)}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                        ฿{(ord.netTotal || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setShowOrderDetailsModal(ord)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-[10px] cursor-pointer transition"
                        >
                          ดูบิล
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Visual Notification Component: Inventory Low Stock Alert */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300/80 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  การแจ้งเตือนสินค้าคงคลังต่ำกว่าเกณฑ์ (Inventory Low Stock Alerts)
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  {lowStockProducts.length} รายการ
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                รายการสินค้าที่มีจำนวนสต็อกคงเหลือเท่ากับหรือต่ำกว่าเกณฑ์ขั้นต่ำ (Minimum Threshold Alert)
              </p>
            </div>
          </div>

          <button
            onClick={handleExportInventory}
            className="bg-white hover:bg-amber-50 text-amber-900 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 border border-amber-300 shadow-2xs transition cursor-pointer self-start sm:self-auto"
            title="ดาวน์โหลดรายการสต็อกสินค้าและมูลค่าคลังสินค้าทั้งหมดเป็นไฟล์ CSV"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>📦 ส่งออก CSV สต็อก & มูลค่าคลัง</span>
          </button>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 text-emerald-800 text-xs font-semibold">
            <ShieldAlert className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>สินค้าทั้งหมดในคลังมีปริมาณเพียงพอและอยู่สูงกว่าเกณฑ์ขั้นต่ำทุกรายการ</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((prod) => {
              const isOut = prod.stockQuantity <= 0 || prod.status === 'out_of_stock';
              const percent = Math.min(
                100,
                Math.round((prod.stockQuantity / (prod.minStockAlert * 2 || 1)) * 100)
              );

              return (
                <div
                  key={prod.id}
                  className={`bg-white border rounded-xl p-3.5 space-y-2.5 shadow-xs transition hover:shadow-md ${
                    isOut ? 'border-rose-300 bg-rose-50/20' : 'border-amber-300 bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {prod.category === 'cannabis'
                            ? '🌿'
                            : prod.category === 'kratom'
                            ? '🥤'
                            : prod.category === 'food'
                            ? '🍜'
                            : '📦'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                          {prod.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          SKU: {prod.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                        isOut
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{isOut ? 'สินค้าหมด' : 'ใกล้หมด'}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-600">คงเหลือในคลัง:</span>
                      <span
                        className={`font-mono font-bold ${
                          isOut ? 'text-rose-600' : 'text-amber-700'
                        }`}
                      >
                        {prod.stockQuantity} {prod.stockUnit} / เกณฑ์ขั้นต่ำ: {prod.minStockAlert}{' '}
                        {prod.stockUnit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOut ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(5, percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 30-Day Sales Trend Line Chart Across Categories */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                แนวโน้มยอดขายรายวัน 30 วันย้อนหลัง แยกตามหมวดหมู่ (30-Day Daily Sales Trends)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              เปรียบเทียบยอดขายรวมรายวันระหว่าง กัญชา (Cannabis), กระท่อม (Kratom), และอาหาร & เครื่องดื่ม (Food)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <div className="flex items-center space-x-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
              <span className="flex items-center gap-1 text-slate-600 font-sans font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> ยอดรวม 30 วัน:
              </span>
              <span className="font-bold text-indigo-700">฿{totals30Days.total.toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={() => handleExportDailySalesAndCharts()}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 shadow-2xs text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="ส่งออกข้อมูลกราฟแนวโน้มและยอดขายเป็น CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>ส่งออก CSV</span>
            </button>
          </div>
        </div>

        {/* Category Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-950 font-bold">🌿 สินค้ากัญชา</span>
            </div>
            <span className="font-mono font-extrabold text-emerald-800">฿{totals30Days.cannabis.toLocaleString()}</span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
              <span className="text-blue-950 font-bold">🥤 สินค้ากระท่อม</span>
            </div>
            <span className="font-mono font-extrabold text-blue-800">฿{totals30Days.kratom.toLocaleString()}</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-amber-950 font-bold">🍜 อาหาร & เครื่องดื่ม</span>
            </div>
            <span className="font-mono font-extrabold text-amber-800">฿{totals30Days.food.toLocaleString()}</span>
          </div>
        </div>

        {/* Recharts LineChart */}
        <div className="h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily30DaysTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickMargin={8} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, '']}
                labelFormatter={(label) => `วันที่: ${label}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '4px' }} />
              <Line
                type="monotone"
                dataKey="cannabis"
                name="🌿 กัญชา (Cannabis)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="kratom"
                name="🥤 กระท่อม (Kratom)"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="food"
                name="🍜 อาหาร (Food & Bev)"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High-Level Profit Margin Heatmap Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                แผนภูมิความร้อนอัตรากำไรขั้นต้น (Profit Margin Heatmap Analysis)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              วิเคราะห์ประสิทธิภาพกำไรและต้นทุนสินค้า (COGS) แยกตามหมวดธุรกิจ (กัญชา, กระท่อม, อาหาร) สำหรับการบริหารการเงินระดับสูง
            </p>
          </div>

          {/* Timeframe & Metric Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Timeframe Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setHeatmapTimeframe('30days')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  heatmapTimeframe === '30days' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 วัน
              </button>
              <button
                onClick={() => setHeatmapTimeframe('7days')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  heatmapTimeframe === '7days' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 วัน
              </button>
              <button
                onClick={() => setHeatmapTimeframe('today')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  heatmapTimeframe === 'today' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                วันนี้
              </button>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px]">
              <span className="font-bold text-slate-500">ระดับความร้อน:</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">≥65%🔥</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">50-64%⚡</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-bold">35-49%⚖️</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">&lt;35%⚠️</span>
            </div>
          </div>
        </div>

        {/* Primary Heatmap Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryHeatmapData.map((cat) => (
            <div
              key={cat.key}
              className={`bg-gradient-to-br ${cat.heatBg} border ${cat.heatBorder} rounded-2xl p-4 space-y-3 shadow-xs relative overflow-hidden transition-all hover:scale-[1.01]`}
            >
              {/* Category Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xl">{cat.icon}</span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{cat.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{cat.description}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase shrink-0 ${cat.badgeBg}`}>
                  {cat.heatBadge}
                </span>
              </div>

              {/* Major Profit Margin Heat Gauge */}
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-500 text-[11px] font-bold uppercase">Profit Margin %</span>
                  <span className={`text-2xl font-black font-mono ${cat.textColor}`}>
                    {cat.marginPct.toFixed(1)}%
                  </span>
                </div>

                {/* Progress Intensity Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(5, cat.marginPct))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-600 font-mono pt-1">
                  <span>ROI ผลตอบแทน: <strong className="text-slate-900">{cat.roiPct.toFixed(0)}%</strong></span>
                  <span className="text-slate-400">บิลเฉลี่ย ฿{cat.avgTicket}</span>
                </div>
              </div>

              {/* Financial Metrics Details Breakdown */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between p-1.5 rounded-lg bg-white/60">
                  <span className="text-slate-500">ยอดขายรวม (Gross Sales):</span>
                  <span className="font-mono font-bold text-slate-900">฿{cat.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white/60">
                  <span className="text-slate-500">ต้นทุนสินค้า (COGS):</span>
                  <span className="font-mono font-semibold text-rose-700">-฿{cat.estimatedCogs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white/90 border border-slate-200/70 font-bold">
                  <span className="text-slate-800">กำไรสุทธิ (Net Profit):</span>
                  <span className="font-mono text-emerald-700">฿{cat.netProfit.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-1 text-[10px] text-slate-500 font-medium flex items-center justify-between border-t border-slate-200/50">
                <span>จำนวนชิ้นขายได้: <strong className="text-slate-800">{cat.itemsSold} ชิ้น</strong></span>
                <span className="text-indigo-600 font-semibold">{cat.benchmark}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subcategory & Product Profitability Matrix */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              ตารางเปรียบเทียบความร้อนอัตรากำไรกลุ่มสินค้าย่อย (Subcategory Heat Grid)
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">แสดง 10 อันดับกลุ่มสินค้าหลัก</span>
          </div>

          {subcategoryHeatmapItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200 space-y-1">
              <p className="font-bold text-slate-600">ยังไม่มีประวัติการขายสินค้าในระบบ (ยอดขายเริ่มต้นที่ ฿0)</p>
              <p className="text-[11px] text-slate-400">เมื่อมีการสั่งซื้อผ่านระบบ POS ระบบจะวิเคราะห์อัตรากำไรแยกตามกลุ่มสินค้าย่อยให้อัตโนมัติ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {subcategoryHeatmapItems.map((item, idx) => {
                const bgHeat =
                  item.margin >= 65
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : item.margin >= 50
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950';

                const badgeColor =
                  item.margin >= 65
                    ? 'bg-emerald-600 text-white'
                    : item.margin >= 50
                    ? 'bg-blue-600 text-white'
                    : 'bg-amber-600 text-white';

                return (
                  <div key={idx} className={`p-2.5 rounded-xl border ${bgHeat} space-y-1.5 transition hover:shadow-2xs`}>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[10px] text-slate-500 font-medium">{item.category}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs line-clamp-1">{item.name}</h5>
                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-500">Margin:</span>
                      <span className="font-mono font-black text-sm">{item.margin}%</span>
                    </div>
                    <div className="text-[10px] text-slate-600 flex justify-between font-mono">
                      <span>ขาย ฿{(item.revenue / 1000).toFixed(1)}k</span>
                      <span className="font-bold text-emerald-700">กำไร ฿{(item.profit / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fiscal Analysis Executive Summary Box */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-800 shadow-md">
          <div className="space-y-1">
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 text-indigo-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ข้อสรุปทางการเงิน & คำแนะนำผู้บริหาร (Executive Fiscal Summary)
            </h4>
            <div className="text-xs text-indigo-100/90 leading-relaxed max-w-3xl space-y-1">
              <p>• <strong>น้ำกระท่อม (Kratom):</strong> เป็นกลุ่มสินค้าที่มีอัตรากำไรขั้นต้นสูงสุดถึง <strong>72%</strong> เนื่องจากต้นทุนการต้มแปรรูปเองในร้านต่ำ ควรเน้นเพิ่มปริมาณการผลิตและขยายจุดจำหน่าย</p>
              <p>• <strong>กัญชา (Cannabis):</strong> สร้างมูลค่าขายสูงสุด นำโดยดอกเกรดพรีเมียม และมี Margin เฉลี่ย <strong>62%</strong> ควรบริหารสต็อก Lot ให้หมุนเวียนเร็ว</p>
              <p>• <strong>อาหารและเครื่องดื่ม (Food):</strong> ช่วยดึงดูดลูกค้าและเพิ่มบิลเฉลี่ย แนะนำให้จัดแพ็กเกจ Combo คู่กับเครื่องดื่มสมุนไพรเพื่อเพิ่ม Profit Margin ภาพรวม</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm">แนวโน้มยอดขายประจำวัน (Hourly Sales Trend)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Business Type Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm">สัดส่วนรายได้แยกตามประเภทธุรกิจ (Revenue by Business)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income & Expense Management Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              ระบบบันทึกเเละจัดการรายรับ-รายจ่ายร้านค้า (Income & Expense Ledger)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              บันทึก แก้ไข หรือลบรายการค่าใช้จ่ายและรายรับอื่นๆ พร้อมการบันทึก Audit Trail สรุปยอดอัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleExportExpenses(filterType === 'all' ? 'all' : 'all')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer shadow-2xs"
              title="ส่งออกสมุดบันทึกรายรับ-รายจ่ายเป็นไฟล์ CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>📒 ส่งออก CSV รายรับ-รายจ่าย</span>
            </button>
            <button
              onClick={() => handleOpenAddExpenseModal('income')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ บันทึกรายรับ</span>
            </button>
            <button
              onClick={() => handleOpenAddExpenseModal('expense')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ บันทึกรายจ่าย</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหารายการ / คำอธิบาย / ผู้บันทึก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-slate-50 text-slate-800 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">ทุกประเภทธุรกรรม (ทั้งหมด)</option>
              <option value="expense">🔴 รายจ่าย (Expenses)</option>
              <option value="income">🟢 รายรับอื่นๆ (Other Incomes)</option>
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">ทุกหมวดหมู่ (All Categories)</option>
              <option value="ingredient">วัตถุดิบทำอาหาร/เครื่องดื่ม</option>
              <option value="utility">ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต</option>
              <option value="wage">ค่าจ้างพนักงาน</option>
              <option value="rent">ค่าเช่าสถานที่</option>
              <option value="asset">อุปกรณ์/สินทรัพย์</option>
              <option value="other_income">รายรับขายเศษวัสดุ/อื่นๆ</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">วันที่</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3">รายการ / คำอธิบาย</th>
                <th className="p-3">หมวดหมู่</th>
                <th className="p-3 text-right">จำนวนเงิน (บาท)</th>
                <th className="p-3">ผู้บันทึก</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    ไม่พบข้อมูลรายการรายรับ-รายจ่ายตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isIncome = exp.type === 'income';
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{exp.date}</td>
                      <td className="p-3 whitespace-nowrap">
                        {isIncome ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                            🟢 รายรับ
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300 inline-flex items-center gap-1">
                            🔴 รายจ่าย
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{exp.title}</p>
                        {exp.notes && (
                          <p className="text-[11px] text-slate-400 font-normal line-clamp-1">{exp.notes}</p>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {exp.category === 'ingredient' && 'วัตถุดิบ'}
                          {exp.category === 'utility' && 'ค่าน้ำ/ไฟ/เน็ต'}
                          {exp.category === 'wage' && 'ค่าจ้างพนักงาน'}
                          {exp.category === 'rent' && 'ค่าเช่าสถานที่'}
                          {exp.category === 'asset' && 'อุปกรณ์/สินทรัพย์'}
                          {exp.category === 'other_income' && 'รายรับเศษวัสดุ/อื่นๆ'}
                          {exp.category === 'other' && 'อื่นๆ'}
                        </span>
                      </td>
                      <td className={`p-3 text-right font-mono font-extrabold text-sm whitespace-nowrap ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isIncome ? '+' : '-'}฿{(exp.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">{exp.recordedBy}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditExpenseModal(exp)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title="แก้ไขรายการ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingExpenseId(exp.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense / Income Form Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <span>{editingExpenseId ? 'แก้ไขรายการบัญชี' : 'บันทึกรายการรายรับ-รายจ่าย'}</span>
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseFormSubmit} className="space-y-4 text-xs">
              {/* Type Toggle */}
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">ประเภทรายการ:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setExpType('expense');
                      if (expCategory === 'other_income') setExpCategory('ingredient');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      expType === 'expense'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔴 รายจ่าย (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExpType('income');
                      setExpCategory('other_income');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      expType === 'income'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🟢 รายรับอื่นๆ (Other Income)
                  </button>
                </div>
              </div>

              {/* Date & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">วันที่บันทึก:</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1 font-semibold">ชื่อรายการ / คำอธิบาย:</label>
                  <input
                    type="text"
                    placeholder={expType === 'expense' ? 'เช่น ค่าไฟฟ้าประจำเดือน, ซื้อน้ำมันพืช' : 'เช่น ขายลังกระดาษเก่า, เงินอุดหนุน'}
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">หมวดหมู่:</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {expType === 'expense' ? (
                      <>
                        <option value="ingredient">วัตถุดิบทำอาหาร/เครื่องดื่ม</option>
                        <option value="utility">ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต</option>
                        <option value="wage">ค่าจ้างพนักงาน</option>
                        <option value="rent">ค่าเช่าสถานที่</option>
                        <option value="asset">อุปกรณ์/สินทรัพย์</option>
                        <option value="other">อื่นๆ</option>
                      </>
                    ) : (
                      <>
                        <option value="other_income">รายรับขายเศษวัสดุ/บรรจุภัณฑ์</option>
                        <option value="other">รายรับอื่นๆ</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">จำนวนเงิน (บาท):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={expAmount || ''}
                    onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                    required
                  />
                </div>
              </div>

              {/* Recorded By & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">ผู้บันทึกรายการ:</label>
                  <input
                    type="text"
                    value={expRecordedBy}
                    onChange={(e) => setExpRecordedBy(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">หมายเหตุ / เลขที่ใบเสร็จ:</label>
                  <input
                    type="text"
                    placeholder="เลขที่ใบกำกับ/อ้างอิง..."
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    className="w-full bg-white text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl border border-slate-200 cursor-pointer transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-bold text-white rounded-xl shadow-md transition cursor-pointer ${
                    expType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {editingExpenseId ? 'บันทึกการแก้ไข' : expType === 'income' ? 'บันทึกรายรับ' : 'บันทึกรายจ่าย'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpenseId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">ยืนยันการลบรายการ</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? เมื่อลบแล้วข้อมูลจะถูกตัดออกจากบัญชีร้านค้าทันที
            </p>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingExpenseId(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteExpenseConfirm(deletingExpenseId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Sales / Accounting Confirmation Modal */}
      {showResetSalesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <RotateCcw className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">รีเซ็ตข้อมูลหน้าบัญชีเป็น 0</h3>
                <p className="text-xs text-rose-600 font-semibold">ล้างประวัติยอดขายและสมุดรายรับ-รายจ่ายเพื่อเริ่มต้นใหม่</p>
              </div>
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">เลือกขอบเขตข้อมูลที่ต้องการรีเซ็ตเป็น 0:</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setResetAccountingScope('all')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    resetAccountingScope === 'all'
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    resetAccountingScope === 'all' ? 'border-rose-600 bg-rose-600' : 'border-slate-400'
                  }`}>
                    {resetAccountingScope === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">1. รีเซ็ตทั้งหมด (ยอดขาย + รายรับ-รายจ่าย = 0)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ลบออเดอร์ทั้งหมด ({orders.length} บิล) และรายการรายรับ-รายจ่าย ({expenses.length} รายการ) คืนค่าบัญชีเป็น ฿0 ทั้งหมด
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setResetAccountingScope('sales')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    resetAccountingScope === 'sales'
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    resetAccountingScope === 'sales' ? 'border-amber-600 bg-amber-600' : 'border-slate-400'
                  }`}>
                    {resetAccountingScope === 'sales' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">2. รีเซ็ตเฉพาะยอดขาย POS ({orders.length} บิล)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ลบเฉพาะประวัติการขายในระบบ POS ยอดขายจะกลายเป็น ฿0 (คงรายการรายรับ-รายจ่ายไว้)
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setResetAccountingScope('expenses')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    resetAccountingScope === 'expenses'
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    resetAccountingScope === 'expenses' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                  }`}>
                    {resetAccountingScope === 'expenses' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">3. รีเซ็ตเฉพาะสมุดบัญชีรายรับ-รายจ่าย ({expenses.length} รายการ)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ลบเฉพาะรายการบันทึกค่าใช้จ่ายและรายรับอื่นๆ ในสมุดบัญชี (คงยอดขาย POS ไว้)
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                การดำเนินการนี้จะลบข้อมูลจากทั้งหน่วยความจำและ Cloud Firestore ถาวร
              </p>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                ข้อมูลที่ถูกรีเซ็ตจะไม่สามารถกู้คืนได้ กรุณาตรวจสอบให้แน่ใจก่อนกดยืนยัน
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowResetSalesModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (resetAccountingScope === 'all') {
                    resetAllAccounting();
                    showToast('รีเซ็ตข้อมูลหน้าบัญชีและยอดขายทั้งหมดเป็น 0 เรียบร้อยแล้ว');
                  } else if (resetAccountingScope === 'sales') {
                    resetAllSales();
                    showToast('รีเซ็ตยอดขาย POS ทั้งหมดเป็น 0 เรียบร้อยแล้ว');
                  } else {
                    resetAllExpenses();
                    showToast('รีเซ็ตสมุดบัญชีรายรับ-รายจ่ายทั้งหมดเป็น 0 เรียบร้อยแล้ว');
                  }
                  setShowResetSalesModal(false);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {resetAccountingScope === 'all'
                    ? 'ยืนยันรีเซ็ตทุกอย่างเป็น 0'
                    : resetAccountingScope === 'sales'
                    ? 'ยืนยันรีเซ็ตยอดขายเป็น 0'
                    : 'ยืนยันรีเซ็ตรายรับ-รายจ่ายเป็น 0'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Receipt Modal */}
      {showOrderDetailsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    รายละเอียดบิล #{showOrderDetailsModal.orderNo || showOrderDetailsModal.id.substring(0, 8)}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    วัน-เวลา: {formatOrderDateTime(showOrderDetailsModal)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderDetailsModal(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Items */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {showOrderDetailsModal.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <p className="text-[10px] text-slate-500">
                      ฿{item.price.toLocaleString()} x {item.quantity} {item.unit}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-slate-900">
                    ฿{item.subtotal.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs font-medium">
              <div className="flex justify-between text-slate-600">
                <span>ราคารวมสินค้า:</span>
                <span className="font-mono">฿{(showOrderDetailsModal.subtotal || 0).toLocaleString()}</span>
              </div>
              {((showOrderDetailsModal.discountTotal || (showOrderDetailsModal as any).discountAmount || 0) > 0) && (
                <div className="flex justify-between text-rose-600">
                  <span>ส่วนลด:</span>
                  <span className="font-mono">-฿{(showOrderDetailsModal.discountTotal || (showOrderDetailsModal as any).discountAmount).toLocaleString()}</span>
                </div>
              )}
              {showOrderDetailsModal.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>ภาษี VAT 7%:</span>
                  <span className="font-mono">฿{showOrderDetailsModal.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2">
                <span>ช่องทางชำระเงิน:</span>
                <div>{renderPaymentBadges(showOrderDetailsModal)}</div>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-indigo-700 border-t border-slate-100 pt-2">
                <span>ยอดชำระสุทธิ:</span>
                <span className="font-mono text-base">฿{(showOrderDetailsModal.netTotal || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowOrderDetailsModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Sales Receipt Summary Printable Modal */}
      {showDailyReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 text-slate-800 shadow-2xl space-y-4 my-8">
            {/* Top Action Bar in Modal (no-print) */}
            <div className="no-print flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5 text-indigo-700">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Printer className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    ใบสรุปยอดขายประจำวัน (Thermal Receipt Summary)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    รายงานสรุปยอดขายรูปแบบสลิป สำหรับเครื่องพิมพ์ความร้อน 80mm / PDF
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDailyReceiptModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeframe Selector inside Modal (no-print) */}
            <div className="no-print bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> ช่วงเวลาที่สรุป:
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <button
                  onClick={() => setReceiptTimeframe('today')}
                  className={`px-2.5 py-1 rounded-lg transition ${receiptTimeframe === 'today' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  วันนี้
                </button>
                <button
                  onClick={() => setReceiptTimeframe('weekly')}
                  className={`px-2.5 py-1 rounded-lg transition ${receiptTimeframe === 'weekly' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  7 วัน
                </button>
                <button
                  onClick={() => setReceiptTimeframe('monthly')}
                  className={`px-2.5 py-1 rounded-lg transition ${receiptTimeframe === 'monthly' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  30 วัน
                </button>
                <button
                  onClick={() => setReceiptTimeframe('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${receiptTimeframe === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  ทั้งหมด
                </button>
              </div>
            </div>

            {/* Dedicated Printable Thermal Receipt View */}
            <div className="printable-receipt bg-slate-50/70 p-4 border border-slate-300 rounded-xl font-mono text-[11px] space-y-3 text-slate-900 shadow-inner max-w-[80mm] mx-auto leading-relaxed">
              {/* Receipt Header */}
              <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-400">
                <p className="font-extrabold text-sm uppercase tracking-wide text-slate-900">
                  {shopSettings?.name || 'ร้านค้า & POS Multi-Business'}
                </p>
                {shopSettings?.address && (
                  <p className="text-[10px] text-slate-600 leading-tight">{shopSettings.address}</p>
                )}
                {shopSettings?.phone && (
                  <p className="text-[10px] text-slate-600">โทร: {shopSettings.phone}</p>
                )}
                {shopSettings?.taxId && (
                  <p className="text-[10px] text-slate-600">เลขประจำตัวผู้เสียภาษี: {shopSettings.taxId}</p>
                )}
                <div className="pt-1 text-[11px] font-bold text-slate-900">
                  ================================
                </div>
                <p className="font-extrabold text-xs uppercase text-indigo-950">
                  รายงานสรุปยอดขายประจำวัน
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase">
                  DAILY SALES SUMMARY REPORT
                </p>
                <div className="text-[11px] font-bold text-slate-900">
                  ================================
                </div>
              </div>

              {/* Report Metadata */}
              <div className="text-[10px] space-y-1 text-slate-700 pb-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>วันที่ออกรายงาน:</span>
                  <span className="font-bold">{new Date().toLocaleDateString('th-TH')}</span>
                </div>
                <div className="flex justify-between">
                  <span>เวลาพิมพ์รายงาน:</span>
                  <span className="font-bold">{new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                </div>
                <div className="flex justify-between">
                  <span>ช่วงเวลาสรุปข้อมูล:</span>
                  <span className="font-bold">
                    {receiptTimeframe === 'today' ? 'ประจำวันนี้' : receiptTimeframe === 'weekly' ? 'สัปดาห์นี้ (7 วัน)' : receiptTimeframe === 'monthly' ? 'เดือนนี้ (30 วัน)' : 'ประวัติทั้งหมด'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ผู้พิมพ์รายงาน:</span>
                  <span className="font-bold">{currentUser?.name || 'ผู้จัดการร้าน'}</span>
                </div>
              </div>

              {/* Sales Totals Summary */}
              <div className="space-y-1 pb-2 border-b border-dashed border-slate-400">
                <p className="font-bold text-[10px] text-slate-900 uppercase">
                  [ สรุปยอดขายรวม / SALES SUMMARY ]
                </p>
                <div className="flex justify-between text-slate-700">
                  <span>จำนวนบิลขายสำเร็จ:</span>
                  <span className="font-bold">{receiptSummaryData.totalBills} บิล</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>ยอดขายก่อนส่วนลด:</span>
                  <span>฿{receiptSummaryData.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {receiptSummaryData.totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>ส่วนลดรวม:</span>
                    <span>-฿{receiptSummaryData.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {receiptSummaryData.totalTaxAmount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>ภาษี VAT (7%):</span>
                    <span>฿{receiptSummaryData.totalTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-extrabold text-slate-900 pt-1 border-t border-slate-300">
                  <span>ยอดขายสุทธิ (NET SALES):</span>
                  <span className="text-xs">฿{receiptSummaryData.netSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div className="space-y-1 pb-2 border-b border-dashed border-slate-400">
                <p className="font-bold text-[10px] text-slate-900 uppercase">
                  [ ช่องทางการชำระเงิน / PAYMENTS ]
                </p>
                <div className="flex justify-between text-slate-700">
                  <span>💵 เงินสด (Cash):</span>
                  <span className="font-bold">฿{receiptSummaryData.cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>📱 โอนพร้อมเพย์ (PromptPay):</span>
                  <span className="font-bold">฿{receiptSummaryData.promptPayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>💳 บัตรเครดิต (Credit):</span>
                  <span className="font-bold">฿{receiptSummaryData.creditCardTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {receiptSummaryData.otherTotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>🔀 ช่องทางอื่นๆ:</span>
                    <span className="font-bold">฿{receiptSummaryData.otherTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div className="space-y-1 pb-2 border-b border-dashed border-slate-400">
                <p className="font-bold text-[10px] text-slate-900 uppercase">
                  [ ยอดขายแยกตามหมวดหมู่ / CATEGORIES ]
                </p>
                <div className="flex justify-between text-slate-700">
                  <span>🌿 กัญชา (Cannabis):</span>
                  <span className="font-bold">
                    ฿{receiptSummaryData.categoryStats.cannabis.amount.toLocaleString()} ({receiptSummaryData.categoryStats.cannabis.qty} ชิ้น)
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>🍃 กระท่อม (Kratom):</span>
                  <span className="font-bold">
                    ฿{receiptSummaryData.categoryStats.kratom.amount.toLocaleString()} ({receiptSummaryData.categoryStats.kratom.qty} ชิ้น)
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>🍜 อาหาร/ครัว (Kitchen):</span>
                  <span className="font-bold">
                    ฿{receiptSummaryData.categoryStats.food.amount.toLocaleString()} ({receiptSummaryData.categoryStats.food.qty} ชิ้น)
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>📦 สินค้าทั่วไป (General):</span>
                  <span className="font-bold">
                    ฿{receiptSummaryData.categoryStats.general.amount.toLocaleString()} ({receiptSummaryData.categoryStats.general.qty} ชิ้น)
                  </span>
                </div>
              </div>

              {/* Top 5 Selling Items */}
              {receiptSummaryData.topItems.length > 0 && (
                <div className="space-y-1 pb-2 border-b border-dashed border-slate-400">
                  <p className="font-bold text-[10px] text-slate-900 uppercase">
                    [ 5 อันดับสินค้าขายดี / TOP ITEMS ]
                  </p>
                  {receiptSummaryData.topItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] text-slate-800">
                      <span className="truncate max-w-[160px]">
                        {idx + 1}. {item.name}
                      </span>
                      <span className="font-bold">
                        {item.qty} {item.unit} (฿{item.total.toLocaleString()})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Financial Net Profit Overview */}
              <div className="space-y-1 pb-2 border-b border-dashed border-slate-400">
                <p className="font-bold text-[10px] text-slate-900 uppercase">
                  [ สรุปผลประกอบการประมาณการ / PROFIT ]
                </p>
                <div className="flex justify-between text-slate-700">
                  <span>ยอดขาย POS สุทธิ:</span>
                  <span>฿{receiptSummaryData.netSales.toLocaleString()}</span>
                </div>
                {receiptSummaryData.otherIncome > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>+ รายรับอื่นๆ:</span>
                    <span>฿{receiptSummaryData.otherIncome.toLocaleString()}</span>
                  </div>
                )}
                {receiptSummaryData.storeExpenseTotal > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>- รายจ่ายร้านค้า:</span>
                    <span>-฿{receiptSummaryData.storeExpenseTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-extrabold text-indigo-950 pt-1 border-t border-slate-300">
                  <span>กำไรประมาณการสุทธิ:</span>
                  <span className="text-xs">฿{receiptSummaryData.netEstimatedProfit.toLocaleString()}</span>
                </div>
              </div>

              {/* Receipt Footer Signatures & Disclaimer */}
              <div className="text-center pt-2 space-y-3 text-[10px] text-slate-600">
                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-[9px] text-slate-600">
                  <div>
                    <p className="pb-6">..........................................</p>
                    <p className="font-bold text-slate-800">ผู้บันทึก / Cashier</p>
                  </div>
                  <div>
                    <p className="pb-6">..........................................</p>
                    <p className="font-bold text-slate-800">ผู้รับเงิน / Manager</p>
                  </div>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-2">
                  <p className="font-extrabold text-slate-900">*** ขอบคุณที่ใช้บริการ ***</p>
                  <p className="text-[9px] text-slate-400">AI Studio Multi-Business POS Accounting System</p>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar in Modal (no-print) */}
            <div className="no-print flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDailyReceiptModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ พิมพ์สลิปสรุปยอดขาย (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Export Center Modal for External Accounting */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>ศูนย์ส่งออกข้อมูล CSV บัญชีและการเงิน</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      RFC 4180 / UTF-8 BOM
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ดาวน์โหลดข้อมูลยอดขาย รายละเอียดสินค้า สต็อก และรายรับ-รายจ่าย เพื่อนำไปใช้กับโปรแกรมบัญชีภายนอก (Excel / Google Sheets / Express / FlowAccount)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeframe Scope Selector */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>1. เลือกระยะเวลาของข้อมูล (Timeframe Range):</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setExportTimeframeOption('today')}
                  className={`py-2 px-3 rounded-lg border transition cursor-pointer text-center ${
                    exportTimeframeOption === 'today'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  วันนี้ (Today)
                </button>
                <button
                  type="button"
                  onClick={() => setExportTimeframeOption('weekly')}
                  className={`py-2 px-3 rounded-lg border transition cursor-pointer text-center ${
                    exportTimeframeOption === 'weekly'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  7 วันล่าสุด
                </button>
                <button
                  type="button"
                  onClick={() => setExportTimeframeOption('monthly')}
                  className={`py-2 px-3 rounded-lg border transition cursor-pointer text-center ${
                    exportTimeframeOption === 'monthly'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  30 วันล่าสุด
                </button>
                <button
                  type="button"
                  onClick={() => setExportTimeframeOption('all')}
                  className={`py-2 px-3 rounded-lg border transition cursor-pointer text-center ${
                    exportTimeframeOption === 'all'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ทั้งหมด ({orders.length} บิล)
                </button>
                <button
                  type="button"
                  onClick={() => setExportTimeframeOption('custom')}
                  className={`py-2 px-3 rounded-lg border transition cursor-pointer text-center ${
                    exportTimeframeOption === 'custom'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  กำหนดวันที่...
                </button>
              </div>

              {exportTimeframeOption === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">ตั้งแต่วันที่:</label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">ถึงวันที่:</label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Report Options Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>2. เลือกรายงานที่ต้องการดาวน์โหลด (Individual Accounting Reports):</span>
                </span>
                <span className="text-[11px] text-slate-500">คลิกเพื่อดาวน์โหลดทันที</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {/* 0. Daily Sales & Charts Master CSV (Featured) */}
                <div className="p-3.5 bg-linear-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl shadow-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-950 text-xs">🌟 รายงานสรุปยอดขายประจำวันและข้อมูลสถิติกราฟ (Daily Sales & Charts Analytics CSV)</span>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                        แนะนำสำหรับบันทึกประวัติ
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      รวมครบจบในไฟล์เดียว: สรุปผลดำเนินงานรายวัน (KPIs), สัดส่วนยอดขายหมวดหมู่, สถิติกราฟรายชั่วโมง, สถิติกราฟ 7 วัน, สถิติกราฟแนวโน้ม 30 วัน, ช่องทางชำระเงิน, สินค้าขายดี และรายการบิลขายทั้งหมด
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportDailySalesAndCharts()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5 shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>ดาวน์โหลด CSV รายวัน</span>
                  </button>
                </div>

                {/* 1. Sales Summary */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-xs transition flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">📊 รายงานสรุปยอดขายรายบิล (Sales Orders Summary)</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        {getOrdersForExport(exportTimeframeOption, exportStartDate, exportEndDate).length} บิล
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      เลขที่บิล, วัน-เวลา, ประเภทออเดอร์, ยอดก่อนลด, ส่วนลด, VAT 7%, ยอดสุทธิ, ช่องทางชำระเงิน, แคชเชียร์
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportSalesSummary(exportTimeframeOption)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด CSV</span>
                  </button>
                </div>

                {/* 2. Sales Itemized */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-xs transition flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">📋 รายงานรายละเอียดสินค้าขายละเอียด (Sales Itemized Breakdown)</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-100">
                        สำหรับตรวจสอบต้นทุน & กำไรสินค้า
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      เลขที่บิล, รหัสสินค้า, ชื่อสินค้า, หมวดหมู่ (กัญชา/กระท่อม/อาหาร), จำนวนขาย, ราคาต่อหน่วย, ยอดสุทธิ
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportSalesItemized(exportTimeframeOption)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด CSV</span>
                  </button>
                </div>

                {/* 3. Inventory Valuation */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-xs transition flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">📦 รายงานสต็อกสินค้าและมูลค่าทรัพย์สินคลัง (Inventory Valuation & Stock)</span>
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                        {products.length} SKU
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      รหัส SKU, ชื่อสินค้า, จำนวนคงเหลือ, ราคาทุน, ราคาขาย, มูลค่าสต็อกรวมราคาทุน, มูลค่าสต็อกราคาขาย, กำไรคาดหวัง, สถานะสต็อก
                    </p>
                  </div>
                  <button
                    onClick={handleExportInventory}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด CSV</span>
                  </button>
                </div>

                {/* 4. Expenses & Income Ledger */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-xs transition flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">📒 สมุดบัญชีรายรับ-รายจ่าย (Income & Expense Ledger)</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        {getExpensesForExport(exportTimeframeOption, exportStartDate, exportEndDate).length} รายการ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      วันที่, ประเภท (รายจ่าย/รายรับ), หมวดหมู่บัญชี (วัตถุดิบ/ค่าจ้าง/ค่าเช่า/ค่าน้ำไฟ), จำนวนเงิน, ผู้บันทึก, หมายเลขอ้างอิง
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportExpenses(exportTimeframeOption)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด CSV</span>
                  </button>
                </div>

                {/* 5. Executive Financial P&L */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-purple-400 hover:shadow-xs transition flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">📑 งบการเงินและบัญชีบริหารผู้บริหาร (Executive Financial P&L Summary)</span>
                      <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200">
                        สำหรับผู้บริหาร / ตรวจสอบบัญชี
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      สรุปภาพรวมรายรับ POS, ภาษีขาย VAT 7%, รายรับอื่นๆ, รายจ่ายดำเนินงานรวม, กำไรสุทธิคงเหลือ, และมูลค่าสินทรัพย์คลัง
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportExecutive(exportTimeframeOption)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>ไฟล์ทั้งหมดรองรับภาษาไทย 100% และเปิดใช้งานบน Excel / Google Sheets ได้ทันที</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="button"
                  onClick={handleExportAllSelected}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดชุดรายงานทั้งหมด (Export All 5 CSVs)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
