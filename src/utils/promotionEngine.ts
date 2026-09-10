import { CartItem, Promotion, AppliedPromotion, Product } from '../types';

export interface PromotionEvaluationResult {
  appliedPromotions: AppliedPromotion[];
  totalDiscount: number;
  cartWithDiscounts: CartItem[];
  upsellSuggestions: {
    promotion: Promotion;
    message: string;
    itemsNeeded?: number;
    amountNeeded?: number;
  }[];
}

/**
 * Checks if a product matches a promotion's target criteria
 */
export function isProductEligibleForPromotion(
  product: { id: string; category: string },
  promo: Promotion
): boolean {
  if (!promo.enabled) return false;

  // Date validity check
  const now = new Date();
  if (promo.startDate && new Date(promo.startDate) > now) return false;
  if (promo.endDate) {
    const end = new Date(promo.endDate);
    end.setHours(23, 59, 59, 999);
    if (end < now) return false;
  }

  if (promo.applicableType === 'all') return true;

  if (promo.applicableType === 'specific_products') {
    return (promo.applicableProductIds || []).includes(product.id);
  }

  if (promo.applicableType === 'category') {
    return (promo.applicableCategories || []).includes(product.category);
  }

  return false;
}

/**
 * Evaluates active promotions on the cart and calculates discounts
 */
export function evaluatePromotions(
  cart: CartItem[],
  promotions: Promotion[],
  selectedPromoCodes: string[] = []
): PromotionEvaluationResult {
  if (!cart || cart.length === 0 || !promotions || promotions.length === 0) {
    return {
      appliedPromotions: [],
      totalDiscount: 0,
      cartWithDiscounts: (cart || []).map((item) => ({
        ...item,
        discount: 0,
        subtotal: item.price * item.quantity,
      })),
      upsellSuggestions: [],
    };
  }

  // Filter active promotions
  const activePromotions = promotions.filter((p) => {
    if (!p.enabled) return false;
    // Check manual promo code requirement
    if (!p.isAutoApply) {
      if (!p.code) return false;
      const normalizedCode = p.code.trim().toUpperCase();
      return selectedPromoCodes.some((c) => c.trim().toUpperCase() === normalizedCode);
    }
    // Check date bounds
    const now = new Date();
    if (p.startDate && new Date(p.startDate) > now) return false;
    if (p.endDate) {
      const end = new Date(p.endDate);
      end.setHours(23, 59, 59, 999);
      if (end < now) return false;
    }
    return true;
  });

  const appliedPromotions: AppliedPromotion[] = [];
  const itemDiscounts: Record<string, number> = {};
  const itemPromoNames: Record<string, string> = {};
  const upsellSuggestions: {
    promotion: Promotion;
    message: string;
    itemsNeeded?: number;
    amountNeeded?: number;
  }[] = [];

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Process item-level promotions first (bundle_price, buy_x_get_y, tiered_qty, percentage, fixed_amount)
  activePromotions.forEach((promo) => {
    const eligibleItems = cart.filter((item) =>
      isProductEligibleForPromotion({ id: item.productId, category: item.category }, promo)
    );

    if (eligibleItems.length === 0) return;

    const totalEligibleQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 1. Bundle Price (e.g. 3 for 100 THB)
    if (promo.type === 'bundle_price' && promo.bundleQuantity && promo.bundlePrice) {
      const bundleSize = promo.bundleQuantity;
      const bundlePrice = promo.bundlePrice;

      if (totalEligibleQty >= bundleSize) {
        const bundlesCount = Math.floor(totalEligibleQty / bundleSize);
        const promoQtyCovered = bundlesCount * bundleSize;

        // Calculate average original price of the bundled items
        const avgUnitPrice = eligibleSubtotal / totalEligibleQty;
        const originalPriceOfBundled = avgUnitPrice * promoQtyCovered;
        const promoPriceTotal = bundlePrice * bundlesCount;
        const discountAmount = Math.max(0, Math.round(originalPriceOfBundled - promoPriceTotal));

        if (discountAmount > 0) {
          appliedPromotions.push({
            promoId: promo.id,
            promoName: promo.name,
            promoCode: promo.code,
            promoType: promo.type,
            discountAmount,
            description: `ชุดโปร ${bundleSize} ชิ้น ${bundlePrice} บ. (ประหยัด ฿${discountAmount.toLocaleString()})`,
            badgeColor: promo.badgeColor || 'emerald',
          });

          // Distribute discount proportionally among eligible items
          eligibleItems.forEach((item) => {
            const itemShare = (item.price * item.quantity) / (eligibleSubtotal || 1);
            const itemDiscount = Math.round(discountAmount * itemShare);
            itemDiscounts[item.id] = (itemDiscounts[item.id] || 0) + itemDiscount;
            itemPromoNames[item.id] = promo.name;
          });
        }
      } else if (promo.bundleQuantity && totalEligibleQty > 0) {
        // Upsell suggestion: Buy X more to get bundle deal
        const needed = promo.bundleQuantity - totalEligibleQty;
        upsellSuggestions.push({
          promotion: promo,
          message: `ซื้อเพิ่มอีก ${needed} ชิ้น เพื่อรับโปร "${promo.name}" (${promo.bundleQuantity} ชิ้น ฿${promo.bundlePrice})`,
          itemsNeeded: needed,
        });
      }
    }

    // 2. Buy X Get Y Free (e.g. Buy 2 Get 1 Free)
    else if (promo.type === 'buy_x_get_y' && promo.buyQuantity && promo.getFreeQuantity) {
      const setSize = promo.buyQuantity + promo.getFreeQuantity;
      if (totalEligibleQty >= setSize) {
        const setsCount = Math.floor(totalEligibleQty / setSize);
        const freeItemsCount = setsCount * promo.getFreeQuantity;

        // Find average unit price of eligible items
        const avgUnitPrice = eligibleSubtotal / totalEligibleQty;
        const discountAmount = Math.round(avgUnitPrice * freeItemsCount);

        if (discountAmount > 0) {
          appliedPromotions.push({
            promoId: promo.id,
            promoName: promo.name,
            promoCode: promo.code,
            promoType: promo.type,
            discountAmount,
            description: `ซื้อ ${promo.buyQuantity} แถม ${promo.getFreeQuantity} ฟรี ${freeItemsCount} ชิ้น (ประหยัด ฿${discountAmount.toLocaleString()})`,
            badgeColor: promo.badgeColor || 'amber',
          });

          eligibleItems.forEach((item) => {
            const itemShare = (item.price * item.quantity) / (eligibleSubtotal || 1);
            const itemDiscount = Math.round(discountAmount * itemShare);
            itemDiscounts[item.id] = (itemDiscounts[item.id] || 0) + itemDiscount;
            itemPromoNames[item.id] = promo.name;
          });
        }
      } else if (totalEligibleQty >= promo.buyQuantity) {
        // Eligible for free item suggestion!
        const needed = setSize - totalEligibleQty;
        upsellSuggestions.push({
          promotion: promo,
          message: `หยิบเพิ่มอีก ${needed} ชิ้น เพื่อรับฟรีตามโปร "${promo.name}"!`,
          itemsNeeded: needed,
        });
      }
    }

    // 3. Tiered Quantity Price (e.g. Buy 3+ get 10 THB off per piece)
    else if (promo.type === 'tiered_qty' && promo.minQuantity && promo.discountAmount) {
      if (totalEligibleQty >= promo.minQuantity) {
        const discountAmount = promo.discountAmount * totalEligibleQty;
        appliedPromotions.push({
          promoId: promo.id,
          promoName: promo.name,
          promoCode: promo.code,
          promoType: promo.type,
          discountAmount,
          description: `ซื้อครบ ${promo.minQuantity} ชิ้น ลดชิ้นละ ฿${promo.discountAmount} (ประหยัด ฿${discountAmount.toLocaleString()})`,
          badgeColor: promo.badgeColor || 'blue',
        });

        eligibleItems.forEach((item) => {
          const itemDiscount = promo.discountAmount! * item.quantity;
          itemDiscounts[item.id] = (itemDiscounts[item.id] || 0) + itemDiscount;
          itemPromoNames[item.id] = promo.name;
        });
      } else if (totalEligibleQty > 0) {
        const needed = promo.minQuantity - totalEligibleQty;
        upsellSuggestions.push({
          promotion: promo,
          message: `ซื้อเพิ่มอีก ${needed} ชิ้น เพื่อรับส่วนลดชิ้นละ ฿${promo.discountAmount}!`,
          itemsNeeded: needed,
        });
      }
    }

    // 4. Percentage Discount on Category/Products
    else if (promo.type === 'percentage' && promo.discountPercent) {
      const minAmount = promo.minOrderAmount || 0;
      if (eligibleSubtotal >= minAmount) {
        const discountAmount = Math.round((eligibleSubtotal * promo.discountPercent) / 100);
        if (discountAmount > 0) {
          appliedPromotions.push({
            promoId: promo.id,
            promoName: promo.name,
            promoCode: promo.code,
            promoType: promo.type,
            discountAmount,
            description: `ลด ${promo.discountPercent}% (ประหยัด ฿${discountAmount.toLocaleString()})`,
            badgeColor: promo.badgeColor || 'rose',
          });

          eligibleItems.forEach((item) => {
            const itemShare = (item.price * item.quantity) / (eligibleSubtotal || 1);
            const itemDiscount = Math.round(discountAmount * itemShare);
            itemDiscounts[item.id] = (itemDiscounts[item.id] || 0) + itemDiscount;
            itemPromoNames[item.id] = promo.name;
          });
        }
      } else if (minAmount > 0 && eligibleSubtotal > 0) {
        const diff = minAmount - eligibleSubtotal;
        upsellSuggestions.push({
          promotion: promo,
          message: `ซื้อเพิ่มอีก ฿${diff.toLocaleString()} เพื่อรับส่วนลด ${promo.discountPercent}%!`,
          amountNeeded: diff,
        });
      }
    }

    // 5. Fixed Amount Discount on Category/Products
    else if (promo.type === 'fixed_amount' && promo.discountAmount) {
      const minAmount = promo.minOrderAmount || 0;
      if (eligibleSubtotal >= minAmount) {
        const discountAmount = Math.min(eligibleSubtotal, promo.discountAmount);
        if (discountAmount > 0) {
          appliedPromotions.push({
            promoId: promo.id,
            promoName: promo.name,
            promoCode: promo.code,
            promoType: promo.type,
            discountAmount,
            description: `ลด ฿${discountAmount.toLocaleString()}`,
            badgeColor: promo.badgeColor || 'purple',
          });

          eligibleItems.forEach((item) => {
            const itemShare = (item.price * item.quantity) / (eligibleSubtotal || 1);
            const itemDiscount = Math.round(discountAmount * itemShare);
            itemDiscounts[item.id] = (itemDiscounts[item.id] || 0) + itemDiscount;
            itemPromoNames[item.id] = promo.name;
          });
        }
      } else if (minAmount > 0 && eligibleSubtotal > 0) {
        const diff = minAmount - eligibleSubtotal;
        upsellSuggestions.push({
          promotion: promo,
          message: `ซื้อเพิ่มอีก ฿${diff.toLocaleString()} เพื่อรับส่วนลด ฿${promo.discountAmount}!`,
          amountNeeded: diff,
        });
      }
    }

    // 6. Cart Threshold Discount (Bill-level)
    else if (promo.type === 'cart_threshold') {
      const minAmount = promo.minOrderAmount || 0;
      if (cartSubtotal >= minAmount) {
        let discountAmount = 0;
        if (promo.discountAmount) {
          discountAmount = promo.discountAmount;
        } else if (promo.discountPercent) {
          discountAmount = Math.round((cartSubtotal * promo.discountPercent) / 100);
        }

        discountAmount = Math.min(cartSubtotal, discountAmount);

        if (discountAmount > 0) {
          appliedPromotions.push({
            promoId: promo.id,
            promoName: promo.name,
            promoCode: promo.code,
            promoType: promo.type,
            discountAmount,
            description: `ยอดบิลครบ ฿${minAmount.toLocaleString()} ลด ฿${discountAmount.toLocaleString()}`,
            badgeColor: promo.badgeColor || 'teal',
          });

          // Distribute across all cart items
          cart.forEach((item) => {
            const itemShare = (item.price * item.quantity) / (cartSubtotal || 1);
            const itemDiscount = Math.round(discountAmount * itemShare);
            itemDiscounts[item.id] = (itemDiscounts[item.id] || 0) + itemDiscount;
            itemPromoNames[item.id] = promo.name;
          });
        }
      } else if (minAmount > 0 && cartSubtotal > 0) {
        const diff = minAmount - cartSubtotal;
        upsellSuggestions.push({
          promotion: promo,
          message: `ซื้อเพิ่มอีก ฿${diff.toLocaleString()} เพื่อรับส่วนลดท้ายบิล!`,
          amountNeeded: diff,
        });
      }
    }
  });

  // Calculate final cart items with discount
  const cartWithDiscounts: CartItem[] = cart.map((item) => {
    const originalPrice = item.price;
    const originalSubtotal = originalPrice * item.quantity;
    // Cap discount to never exceed item total
    const itemDiscount = Math.min(originalSubtotal, Math.max(0, itemDiscounts[item.id] || 0));
    const subtotal = Math.max(0, originalSubtotal - itemDiscount);

    return {
      ...item,
      discount: itemDiscount,
      subtotal,
      appliedPromotionName: itemPromoNames[item.id],
      originalPrice,
      originalSubtotal,
    };
  });

  const totalDiscount = appliedPromotions.reduce((sum, p) => sum + p.discountAmount, 0);

  return {
    appliedPromotions,
    totalDiscount,
    cartWithDiscounts,
    upsellSuggestions,
  };
}
