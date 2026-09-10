import { SaleOrder, Product, Expense } from '../types';

/**
 * Escapes a cell value for CSV formatting according to RFC 4180.
 * Wraps in quotes if it contains commas, double quotes, or newlines.
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Initiates download of a CSV file in the browser with UTF-8 BOM.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  // UTF-8 BOM ensures Thai and non-ASCII characters display correctly in Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to get payment method display text
 */
function getPaymentMethodNames(order: SaleOrder): string {
  if (Array.isArray(order.paymentMethods) && order.paymentMethods.length > 0) {
    return order.paymentMethods
      .map((p) => {
        const m = String(p.method || 'cash').toLowerCase();
        if (m === 'cash') return `เงินสด (฿${p.amount || 0})`;
        if (m === 'promptpay' || m === 'transfer') return `โอนพร้อมเพย์ (฿${p.amount || 0})`;
        if (m === 'card' || m === 'credit_card') return `บัตรเครดิต (฿${p.amount || 0})`;
        return `${m} (฿${p.amount || 0})`;
      })
      .join(' + ');
  }
  const pm = String((order as any).paymentMethod || 'cash').toLowerCase();
  if (pm === 'cash') return 'เงินสด (Cash)';
  if (pm === 'promptpay' || pm === 'transfer') return 'โอนพร้อมเพย์ (PromptPay)';
  if (pm === 'card' || pm === 'credit_card') return 'บัตรเครดิต (Credit Card)';
  return pm;
}

/**
 * Helper to get category Thai label
 */
function getCategoryLabel(category?: string): string {
  switch (category) {
    case 'cannabis':
      return 'กัญชา (Cannabis)';
    case 'kratom':
      return 'กระท่อม (Kratom)';
    case 'food':
      return 'อาหาร/ครัว (Food)';
    case 'general':
      return 'สินค้าทั่วไป (General)';
    default:
      return category || 'ทั่วไป';
  }
}

/**
 * Export Sales Orders Summary CSV (Order-level accounting data)
 */
export function exportSalesSummaryCSV(
  orders: SaleOrder[],
  timeframeLabel: string = 'ทั้งหมด',
  shopName: string = 'POS TOON 81'
): void {
  const headers = [
    'เลขที่ออเดอร์ (Order No)',
    'วัน-เวลา (Date Time)',
    'ประเภทร้าน (Order Type)',
    'หมายเลขโต๊ะ (Table)',
    'จำนวนรายการ (Item Count)',
    'จำนวนชิ้นรวม (Total Qty)',
    'ยอดรวมก่อนลด (Subtotal THB)',
    'ส่วนลด (Discount THB)',
    'ภาษีมูลค่าเพิ่ม (VAT 7% THB)',
    'ยอดชำระสุทธิ (Net Total THB)',
    'ช่องทางชำระเงิน (Payment Methods)',
    'สถานะออเดอร์ (Status)',
    'พนักงานขาย/แคชเชียร์ (Cashier)',
    'ลูกค้า/สมาชิก (Customer)',
  ];

  const rows = orders.map((ord) => {
    const rawDate = ord.timestamp || (ord as any).createdAt || (ord as any).date;
    const dateFormatted = rawDate ? new Date(rawDate).toLocaleString('th-TH') : '-';
    const totalQty = (ord.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
    const orderTypeLabel =
      ord.orderType === 'dine_in'
        ? 'ทานที่ร้าน (Dine-In)'
        : ord.orderType === 'takeaway'
        ? 'รับกลับบ้าน (Takeaway)'
        : 'เดลิเวอรี่ (Delivery)';

    return [
      escapeCSV(ord.orderNo || ord.id),
      escapeCSV(dateFormatted),
      escapeCSV(orderTypeLabel),
      escapeCSV(ord.tableNo || '-'),
      escapeCSV(ord.items?.length || 0),
      escapeCSV(totalQty),
      escapeCSV((ord.subtotal || ord.netTotal || 0).toFixed(2)),
      escapeCSV(((ord.discountTotal || (ord as any).discountAmount || 0)).toFixed(2)),
      escapeCSV((ord.taxAmount || 0).toFixed(2)),
      escapeCSV((ord.netTotal || 0).toFixed(2)),
      escapeCSV(getPaymentMethodNames(ord)),
      escapeCSV((ord as any).status || 'completed'),
      escapeCSV(ord.cashierName || (ord as any).createdBy || 'เจ้าหน้าที่'),
      escapeCSV(ord.customerName || '-'),
    ].join(',');
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `sales_report_${timeframeLabel.replace(/\s+/g, '_')}_${nowStr}.csv`;
  downloadCSV(filename, csvContent);
}

/**
 * Export Sales Itemized Detail CSV (Item-by-item accounting for audit and cost analysis)
 */
export function exportSalesItemizedCSV(
  orders: SaleOrder[],
  timeframeLabel: string = 'ทั้งหมด',
  shopName: string = 'POS TOON 81'
): void {
  const headers = [
    'เลขที่ออเดอร์ (Order No)',
    'วัน-เวลา (Date Time)',
    'รหัสสินค้า (SKU/Code)',
    'ชื่อสินค้า (Product Name)',
    'หมวดหมู่ (Category)',
    'จำนวนขาย (Quantity)',
    'หน่วยนับ (Unit)',
    'ราคาต่อหน่วย (Unit Price THB)',
    'ยอดรวมก่อนลด (Subtotal THB)',
    'ส่วนลดรายการ (Discount THB)',
    'ยอดสุทธิสินค้า (Net Amount THB)',
    'ช่องทางชำระเงิน (Payment)',
    'หมายเหตุ/ล็อต (Notes/Lot)',
  ];

  const rows: string[] = [];

  orders.forEach((ord) => {
    const rawDate = ord.timestamp || (ord as any).createdAt || (ord as any).date;
    const dateFormatted = rawDate ? new Date(rawDate).toLocaleString('th-TH') : '-';
    const payMethods = getPaymentMethodNames(ord);

    (ord.items || []).forEach((item) => {
      const subtotal = item.subtotal || (item.price * (item.quantity || 1));
      const discount = item.discount || 0;
      const net = subtotal - discount;

      rows.push(
        [
          escapeCSV(ord.orderNo || ord.id),
          escapeCSV(dateFormatted),
          escapeCSV(item.productId || '-'),
          escapeCSV(item.productName),
          escapeCSV(getCategoryLabel(item.category)),
          escapeCSV(item.quantity || 1),
          escapeCSV(item.unit || 'ชิ้น'),
          escapeCSV((item.price || 0).toFixed(2)),
          escapeCSV(subtotal.toFixed(2)),
          escapeCSV(discount.toFixed(2)),
          escapeCSV(net.toFixed(2)),
          escapeCSV(payMethods),
          escapeCSV((item as any).notes || (item as any).lotNumber || '-'),
        ].join(',')
      );
    });
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `sales_items_breakdown_${timeframeLabel.replace(/\s+/g, '_')}_${nowStr}.csv`;
  downloadCSV(filename, csvContent);
}

/**
 * Export Inventory Stock & Valuation CSV (Accounting stock assets valuation)
 */
export function exportInventoryStockCSV(
  products: Product[],
  shopName: string = 'POS TOON 81'
): void {
  const headers = [
    'รหัสสินค้า (SKU / Barcode)',
    'ชื่อสินค้า (Product Name)',
    'หมวดหมู่ธุรกิจ (Category)',
    'หมวดย่อย (Subcategory)',
    'จำนวนคงเหลือในคลัง (Stock Qty)',
    'หน่วยนับ (Stock Unit)',
    'เกณฑ์แจ้งเตือนขั้นต่ำ (Min Alert Qty)',
    'ต้นทุนต่อหน่วย (Cost Price THB)',
    'ราคาขายต่อหน่วย (Selling Price THB)',
    'มูลค่าสต็อกราคาทุนรวม (Total Cost Valuation THB)',
    'มูลค่าสต็อกราคาขายรวม (Total Retail Valuation THB)',
    'กำไรขั้นต้นคาดหวังรวม (Expected Gross Profit THB)',
    'อัตรากำไรขั้นต้น % (Profit Margin %)',
    'สถานะสินค้า (Stock Status)',
  ];

  const rows = products.map((p) => {
    const cost = p.cost || 0;
    const price = p.price || 0;
    const qty = p.stockQuantity || 0;
    const totalCostValuation = cost * qty;
    const totalRetailValuation = price * qty;
    const expectedGrossProfit = totalRetailValuation - totalCostValuation;
    const marginPct = price > 0 ? ((price - cost) / price) * 100 : 0;

    let statusThai = 'พร้อมจำหน่าย (In Stock)';
    if (qty <= 0 || p.status === 'out_of_stock') {
      statusThai = 'สินค้าหมด (Out of Stock)';
    } else if (qty <= (p.minStockAlert || 0)) {
      statusThai = 'สินค้าใกล้หมด (Low Stock)';
    }

    return [
      escapeCSV(p.code || p.id),
      escapeCSV(p.name),
      escapeCSV(getCategoryLabel(p.category)),
      escapeCSV(p.subcategory || '-'),
      escapeCSV(qty),
      escapeCSV(p.stockUnit || 'ชิ้น'),
      escapeCSV(p.minStockAlert || 0),
      escapeCSV(cost.toFixed(2)),
      escapeCSV(price.toFixed(2)),
      escapeCSV(totalCostValuation.toFixed(2)),
      escapeCSV(totalRetailValuation.toFixed(2)),
      escapeCSV(expectedGrossProfit.toFixed(2)),
      escapeCSV(marginPct.toFixed(1) + '%'),
      escapeCSV(statusThai),
    ].join(',');
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `inventory_valuation_stock_${nowStr}.csv`;
  downloadCSV(filename, csvContent);
}

/**
 * Export Expense & Income Ledger CSV (Financial accounting transactions)
 */
export function exportExpensesLedgerCSV(
  expenses: Expense[],
  shopName: string = 'POS TOON 81'
): void {
  const headers = [
    'รหัสรายการ (ID)',
    'วันที่บันทึก (Date)',
    'ประเภทธุรกรรม (Type)',
    'ชื่อรายการ/คำอธิบาย (Title/Description)',
    'หมวดหมู่บัญชี (Category)',
    'จำนวนเงิน (Amount THB)',
    'ผู้บันทึกรายการ (Recorded By)',
    'หมายเหตุ/เลขที่ใบเสร็จ (Notes/Receipt Ref)',
  ];

  const rows = expenses.map((exp) => {
    const isIncome = exp.type === 'income';
    const typeLabel = isIncome ? 'รายรับอื่นๆ (Income)' : 'รายจ่ายร้านค้า (Expense)';
    
    let catLabel: string = exp.category;
    if (exp.category === 'ingredient') catLabel = 'วัตถุดิบอาหาร/เครื่องดื่ม';
    else if (exp.category === 'utility') catLabel = 'ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต';
    else if (exp.category === 'wage') catLabel = 'ค่าจ้างพนักงาน';
    else if (exp.category === 'rent') catLabel = 'ค่าเช่าสถานที่';
    else if (exp.category === 'asset') catLabel = 'อุปกรณ์/สินทรัพย์';
    else if (exp.category === 'other_income') catLabel = 'รายรับขายเศษวัสดุ/อื่นๆ';
    else if (exp.category === 'other') catLabel = 'อื่นๆ';

    return [
      escapeCSV(exp.id),
      escapeCSV(exp.date || '-'),
      escapeCSV(typeLabel),
      escapeCSV(exp.title),
      escapeCSV(catLabel),
      escapeCSV((isIncome ? exp.amount : -exp.amount).toFixed(2)),
      escapeCSV(exp.recordedBy || '-'),
      escapeCSV(exp.notes || '-'),
    ].join(',');
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `income_expense_ledger_${nowStr}.csv`;
  downloadCSV(filename, csvContent);
}

/**
 * Export Full Executive Accounting Summary CSV (Comprehensive P&L and Balance Overview)
 */
export function exportExecutiveFinancialReportCSV(
  orders: SaleOrder[],
  expenses: Expense[],
  products: Product[],
  timeframeLabel: string = 'ทั้งหมด',
  shopName: string = 'POS TOON 81'
): void {
  const totalSalesRevenue = orders.reduce((s, o) => s + (o.netTotal || 0), 0);
  const totalVAT = orders.reduce((s, o) => s + (o.taxAmount || 0), 0);
  const otherIncome = expenses.filter((e) => e.type === 'income').reduce((s, e) => s + (e.amount || 0), 0);
  const totalExpenses = expenses.filter((e) => (e.type || 'expense') === 'expense').reduce((s, e) => s + (e.amount || 0), 0);
  const grossIncome = totalSalesRevenue + otherIncome;
  const netProfit = grossIncome - totalExpenses;
  const totalStockCostValuation = products.reduce((s, p) => s + (p.cost * p.stockQuantity), 0);
  const totalStockRetailValuation = products.reduce((s, p) => s + (p.price * p.stockQuantity), 0);

  const lines = [
    `รายงานสรุปงบการเงินและบัญชีบริหาร (Executive Financial Accounting Report),${escapeCSV(shopName)}`,
    `ช่วงเวลาสรุปข้อมูล (Timeframe),${escapeCSV(timeframeLabel)}`,
    `วันที่จัดทำรายงาน (Generated Date),${escapeCSV(new Date().toLocaleString('th-TH'))}`,
    '',
    '[ 1. สรุปรายรับจากการขาย POS (POS Sales Revenue) ]',
    `จำนวนบิลขายทั้งหมด (Total Invoices),${orders.length} บิล`,
    `ยอดขายสุทธิ POS (Net POS Sales),${totalSalesRevenue.toFixed(2)} THB`,
    `ภาษีขายสะสม VAT 7% (Total Output VAT),${totalVAT.toFixed(2)} THB`,
    `รายรับอื่นๆ นอกเหนือ POS (Other Incomes),${otherIncome.toFixed(2)} THB`,
    `รายรับรวมทั้งสิ้น (Gross Total Revenue),${grossIncome.toFixed(2)} THB`,
    '',
    '[ 2. สรุปรายจ่ายและต้นทุนดำเนินงาน (Operating Expenses) ]',
    `รายจ่ายร้านค้ารวมทั้งสิ้น (Total Expenses),${totalExpenses.toFixed(2)} THB`,
    `กำไรสุทธิคงเหลือ (Net Profit/Loss),${netProfit.toFixed(2)} THB`,
    '',
    '[ 3. สรุปมูลค่าสินค้าคงคลัง (Inventory Valuation) ]',
    `จำนวนรายการสินค้าในระบบ (Total SKU Count),${products.length} รายการ`,
    `มูลค่าสต็อกสินค้าราคาทุนรวม (Total Stock Cost Assets),${totalStockCostValuation.toFixed(2)} THB`,
    `มูลค่าสต็อกสินค้าราคาขายรวม (Total Stock Retail Value),${totalStockRetailValuation.toFixed(2)} THB`,
    `กำไรส่วนต่างสต็อกคาดหวัง (Expected Stock Margin),${(totalStockRetailValuation - totalStockCostValuation).toFixed(2)} THB`,
  ];

  const nowStr = new Date().toISOString().split('T')[0];
  const csvContent = lines.join('\r\n');
  const filename = `executive_accounting_summary_${timeframeLabel.replace(/\s+/g, '_')}_${nowStr}.csv`;
  downloadCSV(filename, csvContent);
}

/**
 * Export Current Daily Sales Report & All Chart Analytics CSV
 * A single, comprehensive CSV containing daily performance KPIs, category breakdown,
 * hourly distribution chart data, 7-day trend chart data, 30-day category trend chart data,
 * payment methods, top selling items, and order transactions log for record-keeping.
 */
export function exportDailyReportAndChartsCSV(params: {
  orders: SaleOrder[];
  expenses?: Expense[];
  products?: Product[];
  targetDate?: string;
  shopName?: string;
  hourlyChartData?: { name: string; sales: number }[];
  sevenDaysChartData?: {
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
  }[];
  thirtyDaysChartData?: {
    date: string;
    displayDate: string;
    cannabis: number;
    kratom: number;
    food: number;
    total: number;
  }[];
}): void {
  const {
    orders = [],
    expenses = [],
    products = [],
    targetDate = new Date().toISOString().split('T')[0],
    shopName = 'POS TOON 81',
    hourlyChartData = [],
    sevenDaysChartData = [],
    thirtyDaysChartData = [],
  } = params;

  // Filter orders for the target date
  const todayOrders = orders.filter((o) => {
    if (!o) return false;
    const rawTime = o.timestamp || (o as any).createdAt || (o as any).date || '';
    const dStr = rawTime ? rawTime.split('T')[0] : '';
    return dStr === targetDate;
  });

  // Filter expenses for the target date
  const todayExpenses = expenses.filter((e) => {
    if (!e) return false;
    const dStr = e.date ? e.date.split('T')[0] : '';
    return dStr === targetDate;
  });

  // KPIs
  const totalBills = todayOrders.length;
  const netSales = todayOrders.reduce((sum, o) => sum + (o.netTotal || 0), 0);
  const grossSales = todayOrders.reduce((sum, o) => sum + (o.subtotal || o.netTotal || 0), 0);
  const totalDiscount = todayOrders.reduce((sum, o) => sum + (o.discountTotal || (o as any).discountAmount || 0), 0);
  const totalTax = todayOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);
  const totalItemsSold = todayOrders.reduce(
    (sum, o) => sum + (o.items || []).reduce((iSum, it) => iSum + (it.quantity || 1), 0),
    0
  );
  const avgTicket = totalBills > 0 ? (netSales / totalBills) : 0;
  const avgItemsPerTicket = totalBills > 0 ? (totalItemsSold / totalBills) : 0;

  const otherIncome = todayExpenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const operatingExpenses = todayExpenses
    .filter((e) => (e.type || 'expense') === 'expense')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const estimatedProfit = netSales + otherIncome - operatingExpenses;

  // Category Breakdown for Today
  const catStats: Record<string, { name: string; sales: number; qty: number }> = {
    cannabis: { name: 'กัญชา (Cannabis)', sales: 0, qty: 0 },
    kratom: { name: 'กระท่อม (Kratom)', sales: 0, qty: 0 },
    food: { name: 'อาหาร/ครัว (Food & Kitchen)', sales: 0, qty: 0 },
    general: { name: 'สินค้าทั่วไป (General)', sales: 0, qty: 0 },
  };

  const itemSalesMap: Record<string, { name: string; code: string; cat: string; qty: number; sales: number; unit: string }> = {};

  todayOrders.forEach((ord) => {
    (ord.items || []).forEach((it) => {
      const catKey = it.category in catStats ? it.category : 'general';
      const amt = it.subtotal || (it.price * (it.quantity || 1));
      const q = it.quantity || 1;

      catStats[catKey].sales += amt;
      catStats[catKey].qty += q;

      const pKey = it.productId || it.productName || 'unknown';
      if (!itemSalesMap[pKey]) {
        itemSalesMap[pKey] = {
          name: it.productName || 'สินค้า',
          code: it.productId || '-',
          cat: getCategoryLabel(it.category),
          qty: 0,
          sales: 0,
          unit: it.unit || 'ชิ้น',
        };
      }
      itemSalesMap[pKey].qty += q;
      itemSalesMap[pKey].sales += amt;
    });
  });

  // Payment Breakdown for Today
  const payMap: Record<string, number> = {
    cash: 0,
    promptpay: 0,
    card: 0,
    other: 0,
  };

  todayOrders.forEach((ord) => {
    const methods = Array.isArray(ord.paymentMethods) && ord.paymentMethods.length > 0
      ? ord.paymentMethods
      : [{ method: (ord as any).paymentMethod || 'cash', amount: ord.netTotal || 0 }];

    methods.forEach((pm: any) => {
      const m = String(pm.method || 'cash').toLowerCase();
      const amt = Number(pm.amount !== undefined ? pm.amount : (ord.netTotal || 0));
      if (m === 'cash') payMap.cash += amt;
      else if (m === 'promptpay' || m === 'transfer') payMap.promptpay += amt;
      else if (m === 'card' || m === 'credit_card') payMap.card += amt;
      else payMap.other += amt;
    });
  });

  // Top Items
  const topItems = Object.values(itemSalesMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  const lines: string[] = [
    `รายงานสรุปยอดขายประจำวันและข้อมูลสถิติกราฟ (Daily Sales & Charts Report),${escapeCSV(shopName)}`,
    `วันที่ประจำรอบรายงาน (Report Date),${escapeCSV(targetDate)}`,
    `วัน-เวลาที่ส่งออกไฟล์ (Exported At),${escapeCSV(new Date().toLocaleString('th-TH'))}`,
    `จำนวนบิลขายในวัน (Total Daily Orders),${totalBills} บิล`,
    '',
    '========================================================================================',
    '[ 1. สรุปภาพรวมยอดขายและผลการดำเนินงานประจำวัน (Daily Performance Summary) ]',
    '========================================================================================',
    `ยอดขายสุทธิประจำวัน (Net Sales Revenue),${netSales.toFixed(2)} THB`,
    `ยอดขายก่อนหักส่วนลด (Gross Sales Total),${grossSales.toFixed(2)} THB`,
    `ส่วนลดการค้าประจำวัน (Total Daily Discounts),${totalDiscount.toFixed(2)} THB`,
    `ภาษีมูลค่าเพิ่ม VAT 7% (Total Output VAT),${totalTax.toFixed(2)} THB`,
    `จำนวนชิ้นสินค้าที่ขายได้ (Total Items Sold),${totalItemsSold} ชิ้น`,
    `ยอดขายเฉลี่ยต่อบิล (Average Ticket Size),${avgTicket.toFixed(2)} THB`,
    `จำนวนชิ้นเฉลี่ยต่อบิล (Avg Items Per Ticket),${avgItemsPerTicket.toFixed(1)} ชิ้น`,
    `รายรับอื่นๆ นอกเหนือ POS (Other Daily Incomes),${otherIncome.toFixed(2)} THB`,
    `รายจ่ายร้านค้าประจำวัน (Daily Operating Expenses),${operatingExpenses.toFixed(2)} THB`,
    `กำไรสุทธิประมาณการประจำวัน (Estimated Net Daily Profit),${estimatedProfit.toFixed(2)} THB`,
    '',
    '========================================================================================',
    '[ 2. สรุปยอดขายแยกตามหมวดหมู่ธุรกิจประจำวัน (Daily Sales Breakdown by Category) ]',
    '========================================================================================',
    'หมวดหมู่ธุรกิจ (Category),ยอดขาย (Sales THB),สัดส่วน % (Share),จำนวนชิ้น (Qty Sold)',
    ...Object.values(catStats).map((c) => {
      const sharePct = netSales > 0 ? ((c.sales / netSales) * 100).toFixed(1) + '%' : '0.0%';
      return `${escapeCSV(c.name)},${c.sales.toFixed(2)},${escapeCSV(sharePct)},${c.qty}`;
    }),
    '',
    '========================================================================================',
    '[ 3. สรุปช่องทางการชำระเงินประจำวัน (Daily Payment Methods Breakdown) ]',
    '========================================================================================',
    'ช่องทางการชำระ (Payment Method),จำนวนเงินรวม (Amount THB),สัดส่วน % (Share)',
    `เงินสด (Cash),${payMap.cash.toFixed(2)},${netSales > 0 ? ((payMap.cash / netSales) * 100).toFixed(1) + '%' : '0.0%'}`,
    `โอนเงินพร้อมเพย์ / PromptPay,${payMap.promptpay.toFixed(2)},${netSales > 0 ? ((payMap.promptpay / netSales) * 100).toFixed(1) + '%' : '0.0%'}`,
    `บัตรเครดิต / เดบิต (Credit/Debit Card),${payMap.card.toFixed(2)},${netSales > 0 ? ((payMap.card / netSales) * 100).toFixed(1) + '%' : '0.0%'}`,
    `ช่องทางอื่นๆ (Other),${payMap.other.toFixed(2)},${netSales > 0 ? ((payMap.other / netSales) * 100).toFixed(1) + '%' : '0.0%'}`,
    '',
    '========================================================================================',
    '[ 4. อันดับสินค้าขายดีประจำวัน (Top Selling Products Today) ]',
    '========================================================================================',
    'อันดับ (Rank),รหัสสินค้า (Code),ชื่อสินค้า (Product Name),หมวดหมู่ (Category),จำนวนที่ขาย (Qty),หน่วย (Unit),ยอดขายรวม (Total Sales THB)',
    ...(topItems.length > 0
      ? topItems.map((it, idx) =>
          [
            idx + 1,
            escapeCSV(it.code),
            escapeCSV(it.name),
            escapeCSV(it.cat),
            it.qty,
            escapeCSV(it.unit),
            it.sales.toFixed(2),
          ].join(',')
        )
      : ['ไม่มีรายการสินค้าขายในวันนี้,,,,,,']),
    '',
    '========================================================================================',
    '[ 5. สถิติยอดขายตามช่วงเวลาในกราฟ (Hourly Sales Trend Chart Data) ]',
    '========================================================================================',
    'ช่วงเวลา (Time Bucket),ยอดขาย (Sales THB),สัดส่วน % ของยอดขายวัน',
    ...(hourlyChartData.length > 0
      ? hourlyChartData.map((h) => {
          const share = netSales > 0 ? ((h.sales / netSales) * 100).toFixed(1) + '%' : '0.0%';
          return `${escapeCSV(h.name)},${h.sales.toFixed(2)},${escapeCSV(share)}`;
        })
      : ['08:00 - 22:00,0.00,0.0%']),
    '',
    '========================================================================================',
    '[ 6. สถิติกราฟเปรียบเทียบยอดขาย 7 วันย้อนหลัง (7-Day Sales Trend Chart Data) ]',
    '========================================================================================',
    'วันที่ (Date),วันในสัปดาห์ (Day),ยอดขายรวม (Total Sales THB),จำนวนบิล (Orders),กัญชา (Cannabis THB),กระท่อม (Kratom THB),อาหาร (Food THB),สินค้าทั่วไป (General THB)',
    ...(sevenDaysChartData.length > 0
      ? sevenDaysChartData.map((d) =>
          [
            escapeCSV(d.date),
            escapeCSV(d.dayName),
            d.sales.toFixed(2),
            d.orderCount,
            d.cannabis.toFixed(2),
            d.kratom.toFixed(2),
            d.food.toFixed(2),
            d.general.toFixed(2),
          ].join(',')
        )
      : ['ไม่มีข้อมูล 7 วันย้อนหลัง,,,,,,,']),
    '',
    '========================================================================================',
    '[ 7. สถิติกราฟแนวโน้มยอดขาย 30 วันย้อนหลัง (30-Day Sales Trend Chart Data) ]',
    '========================================================================================',
    'วันที่ (Date),วันที่แสดงผล (Display Date),ยอดขายรวม (Total THB),กัญชา (Cannabis THB),กระท่อม (Kratom THB),อาหาร & เครื่องดื่ม (Food THB)',
    ...(thirtyDaysChartData.length > 0
      ? thirtyDaysChartData.map((d) =>
          [
            escapeCSV(d.date),
            escapeCSV(d.displayDate),
            d.total.toFixed(2),
            d.cannabis.toFixed(2),
            d.kratom.toFixed(2),
            d.food.toFixed(2),
          ].join(',')
        )
      : ['ไม่มีข้อมูล 30 วันย้อนหลัง,,,,,']),
    '',
    '========================================================================================',
    '[ 8. รายการบิลขายประจำวันทั้งหมด (Today\'s Detailed Sales Orders Log) ]',
    '========================================================================================',
    'เลขที่ออเดอร์ (Order No),วัน-เวลา (Date Time),ประเภทร้าน (Type),โต๊ะ (Table),จำนวนรายการ (Item Count),จำนวนชิ้น (Qty),ยอดก่อนลด (Subtotal THB),ส่วนลด (Discount THB),VAT 7% (THB),ยอดชำระสุทธิ (Net Total THB),ช่องทางชำระเงิน (Payment),พนักงานขาย (Cashier),ลูกค้า (Customer)',
    ...(todayOrders.length > 0
      ? todayOrders.map((ord) => {
          const rawDate = ord.timestamp || (ord as any).createdAt || (ord as any).date;
          const dateFormatted = rawDate ? new Date(rawDate).toLocaleString('th-TH') : '-';
          const totalQty = (ord.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
          const orderTypeLabel =
            ord.orderType === 'dine_in'
              ? 'ทานที่ร้าน (Dine-In)'
              : ord.orderType === 'takeaway'
              ? 'รับกลับบ้าน (Takeaway)'
              : 'เดลิเวอรี่ (Delivery)';

          return [
            escapeCSV(ord.orderNo || ord.id),
            escapeCSV(dateFormatted),
            escapeCSV(orderTypeLabel),
            escapeCSV(ord.tableNo || '-'),
            ord.items?.length || 0,
            totalQty,
            (ord.subtotal || ord.netTotal || 0).toFixed(2),
            (ord.discountTotal || (ord as any).discountAmount || 0).toFixed(2),
            (ord.taxAmount || 0).toFixed(2),
            (ord.netTotal || 0).toFixed(2),
            escapeCSV(getPaymentMethodNames(ord)),
            escapeCSV(ord.cashierName || (ord as any).createdBy || 'เจ้าหน้าที่'),
            escapeCSV(ord.customerName || '-'),
          ].join(',');
        })
      : ['ไม่มีบิลขายประจำวันนี้,,,,,,,,,,,,']),
  ];

  const csvContent = lines.join('\r\n');
  const filename = `daily_sales_and_charts_report_${targetDate}.csv`;
  downloadCSV(filename, csvContent);
}
