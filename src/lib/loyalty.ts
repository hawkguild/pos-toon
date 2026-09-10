import { MembershipTier, Customer, CustomerPointLog } from '../types';

export interface LoyaltyTierConfig {
  tier: MembershipTier;
  label: string;
  minSpend: number;
  multiplier: number; // Points multiplier
  badgeColor: string; // Tailwind class badge
  textColor: string;
  borderColor: string;
  icon: string;
  perks: string[];
}

export const LOYALTY_TIERS: Record<MembershipTier, LoyaltyTierConfig> = {
  Bronze: {
    tier: 'Bronze',
    label: 'Bronze Member',
    minSpend: 0,
    multiplier: 1.0,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    icon: '🥉',
    perks: ['สะสมแต้ม 50 บาท = 1 แต้ม', 'สิทธิประโยชน์โปรโมชั่นสมาชิก'],
  },
  Silver: {
    tier: 'Silver',
    label: 'Silver Member',
    minSpend: 2000,
    multiplier: 1.2,
    badgeColor: 'bg-slate-200 text-slate-800 border-slate-400',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-400',
    icon: '🥈',
    perks: ['สะสมแต้ม x1.2 เท่า', 'รับส่วนลดพิเศษวันเกิด 5%', 'ของขวัญต้อนรับ Silver'],
  },
  Gold: {
    tier: 'Gold',
    label: 'Gold VIP',
    minSpend: 5000,
    multiplier: 1.5,
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-400',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-400',
    icon: '🥇',
    perks: ['สะสมแต้ม x1.5 เท่า', 'รับส่วนลดพิเศษวันเกิด 10%', 'ของแถมพิเศษประจำเดือน'],
  },
  VIP: {
    tier: 'VIP',
    label: 'Diamond VIP',
    minSpend: 15000,
    multiplier: 2.0,
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-400',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-400',
    icon: '👑',
    perks: ['สะสมแต้ม x2.0 เท่า (คูณสองทุกบิล)', 'สิทธิ์เข้าถึงสินค้าลิมิเต็ดก่อนใคร', 'บริการ VIP Lounge'],
  },
};

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsRequired: number;
  discountAmount?: number;
  freeItemName?: string;
  icon: string;
  description: string;
  category: 'discount' | 'free_item' | 'merch';
}

export const LOYALTY_REWARDS_CATALOG: LoyaltyReward[] = [
  {
    id: 'rew-10-thb',
    name: 'คูปองส่วนลด 10 บาท',
    pointsRequired: 10,
    discountAmount: 10,
    icon: '🏷️',
    description: 'ใช้ 10 แต้ม แลกส่วนลดเงินสดทันที 10 บาท',
    category: 'discount',
  },
  {
    id: 'rew-50-thb',
    name: 'คูปองส่วนลด 50 บาท',
    pointsRequired: 50,
    discountAmount: 50,
    icon: '💵',
    description: 'ใช้ 50 แต้ม แลกส่วนลดเงินสดทันที 50 บาท',
    category: 'discount',
  },
  {
    id: 'rew-100-thb',
    name: 'คูปองส่วนลด 100 บาท',
    pointsRequired: 100,
    discountAmount: 100,
    icon: '🎉',
    description: 'ใช้ 100 แต้ม แลกส่วนลดเงินสดทันที 100 บาท',
    category: 'discount',
  },
  {
    id: 'rew-kratom-free',
    name: 'ฟรี น้ำต้มกระท่อมสูตรเข้มข้น 1 ขวด',
    pointsRequired: 80,
    freeItemName: 'น้ำกระท่อมต้มสด 500ml',
    icon: '🥤',
    description: 'ใช้ 80 แต้ม แลกรับเครื่องดื่มสมุนไพรฟรี 1 ขวด',
    category: 'free_item',
  },
  {
    id: 'rew-joint-free',
    name: 'ฟรี ช่อดอกเกรดพรีเมียม Pre-roll 1 มวน',
    pointsRequired: 150,
    freeItemName: 'OG Kush Pre-roll',
    icon: '🌿',
    description: 'ใช้ 150 แต้ม แลกรับช่อดอกพร้อมสูบเกรดพรีเมียม',
    category: 'free_item',
  },
  {
    id: 'rew-vip-grinder',
    name: 'ชุดเครื่องบดอะลูมิเนียม TOON 81 Limited',
    pointsRequired: 300,
    freeItemName: 'Premium 4-Layer Grinder',
    icon: '⚙️',
    description: 'ใช้ 300 แต้ม แลกของพรีเมียมลิขสิทธิ์เฉพาะร้าน',
    category: 'merch',
  },
];

/**
 * Calculate customer's membership tier based on their cumulative spend
 */
export function calculateMembershipTier(totalSpend: number): MembershipTier {
  if (totalSpend >= LOYALTY_TIERS.VIP.minSpend) return 'VIP';
  if (totalSpend >= LOYALTY_TIERS.Gold.minSpend) return 'Gold';
  if (totalSpend >= LOYALTY_TIERS.Silver.minSpend) return 'Silver';
  return 'Bronze';
}

/**
 * Calculate loyalty points earned from a sale
 * Base: 1 point per 50 THB spent, multiplied by customer tier factor
 */
export function calculatePointsEarned(netTotal: number, tier: MembershipTier = 'Bronze'): number {
  if (netTotal <= 0) return 0;
  const basePoints = Math.floor(netTotal / 50); // 1 pt / 50 THB
  const multiplier = LOYALTY_TIERS[tier]?.multiplier || 1.0;
  return Math.max(0, Math.floor(basePoints * multiplier));
}

/**
 * Get tier progression info for progress bar and next rank target
 */
export function getTierProgression(totalSpend: number) {
  const currentTier = calculateMembershipTier(totalSpend);
  let nextTier: MembershipTier | null = null;
  let nextMinSpend = 0;

  if (currentTier === 'Bronze') {
    nextTier = 'Silver';
    nextMinSpend = LOYALTY_TIERS.Silver.minSpend;
  } else if (currentTier === 'Silver') {
    nextTier = 'Gold';
    nextMinSpend = LOYALTY_TIERS.Gold.minSpend;
  } else if (currentTier === 'Gold') {
    nextTier = 'VIP';
    nextMinSpend = LOYALTY_TIERS.VIP.minSpend;
  }

  const currentMinSpend = LOYALTY_TIERS[currentTier].minSpend;
  const spendRemaining = nextTier ? Math.max(0, nextMinSpend - totalSpend) : 0;
  const percentage = nextTier
    ? Math.min(100, Math.max(0, Math.round(((totalSpend - currentMinSpend) / (nextMinSpend - currentMinSpend)) * 100)))
    : 100;

  return {
    currentTier,
    tierConfig: LOYALTY_TIERS[currentTier],
    nextTier,
    nextTierConfig: nextTier ? LOYALTY_TIERS[nextTier] : null,
    nextMinSpend,
    spendRemaining,
    percentage,
  };
}
