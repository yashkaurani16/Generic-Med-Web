import { Medicine, MedicinePack } from '../types';

export interface PriceTrendPoint {
  date: string;
  fullDate: string;
  lowestPrice: number;
  marketAverage: number;
  brandPrice: number;
  mrp: number;
  carepoint: number;
  medplus: number;
  apollo: number;
  wellness: number;
  netmedics: number;
}

export type Timeframe = '30d' | '90d' | '180d' | '1y';

export interface MarketRateAssessment {
  currentLowest: number;
  lowestSellerName: string;
  averagePrice: number;
  brandPrice: number;
  mrp: number;
  savingsVsBrandPct: number;
  savingsVsAvgPct: number;
  status: 'all-time-low' | 'best-rate' | 'fair-market' | 'above-average';
  badgeText: string;
  verdict: string;
  trendDirection: 'falling' | 'stable' | 'rising';
  trendPercent: number; // e.g. -7.8%
  periodHigh: number;
  periodLow: number;
  suggestedAction: string;
}

// Base seed data for each medicine pack to generate realistic historical curves
interface BasePackPricing {
  currentLowest: number;
  lowestSeller: string;
  baseMarketAvg: number;
  brandPrice: number;
  mrp: number;
  sellerBases: {
    carepoint: number;
    medplus: number;
    apollo: number;
    wellness: number;
    netmedics: number;
  };
}

const PACK_PRICING_SEEDS: Record<string, BasePackPricing> = {
  // Atorvastatin 10mg
  'med-1-pack-10': {
    currentLowest: 2.95,
    lowestSeller: 'MedPlus Direct',
    baseMarketAvg: 3.55,
    brandPrice: 14.5,
    mrp: 14.5,
    sellerBases: {
      carepoint: 3.2,
      medplus: 2.95,
      apollo: 3.9,
      wellness: 4.1,
      netmedics: 3.6,
    },
  },
  'med-1-pack-30': {
    currentLowest: 7.2,
    lowestSeller: 'NetMedics Express Hub',
    baseMarketAvg: 8.4,
    brandPrice: 38.0,
    mrp: 38.0,
    sellerBases: {
      carepoint: 8.5,
      medplus: 7.8,
      apollo: 9.1,
      wellness: 9.4,
      netmedics: 7.2,
    },
  },

  // Metformin 500mg
  'med-2-pack-10': {
    currentLowest: 1.8,
    lowestSeller: 'MedPlus Direct',
    baseMarketAvg: 2.15,
    brandPrice: 9.5,
    mrp: 9.5,
    sellerBases: {
      carepoint: 2.1,
      medplus: 1.8,
      apollo: 2.4,
      wellness: 2.5,
      netmedics: 1.95,
    },
  },
  'med-2-pack-30': {
    currentLowest: 4.5,
    lowestSeller: 'CarePoint Pharmacy',
    baseMarketAvg: 5.3,
    brandPrice: 24.0,
    mrp: 24.0,
    sellerBases: {
      carepoint: 4.5,
      medplus: 4.8,
      apollo: 5.7,
      wellness: 5.9,
      netmedics: 4.9,
    },
  },
  'med-2-pack-60': {
    currentLowest: 8.1,
    lowestSeller: 'MedPlus Direct',
    baseMarketAvg: 9.6,
    brandPrice: 44.0,
    mrp: 44.0,
    sellerBases: {
      carepoint: 8.7,
      medplus: 8.1,
      apollo: 10.2,
      wellness: 10.5,
      netmedics: 8.9,
    },
  },

  // Amoxicillin 500mg
  'med-3-pack-10': {
    currentLowest: 3.4,
    lowestSeller: 'CarePoint Pharmacy',
    baseMarketAvg: 4.05,
    brandPrice: 16.0,
    mrp: 16.0,
    sellerBases: {
      carepoint: 3.4,
      medplus: 3.65,
      apollo: 4.3,
      wellness: 4.5,
      netmedics: 3.8,
    },
  },
  'med-3-pack-20': {
    currentLowest: 6.2,
    lowestSeller: 'NetMedics Express Hub',
    baseMarketAvg: 7.3,
    brandPrice: 29.5,
    mrp: 29.5,
    sellerBases: {
      carepoint: 6.9,
      medplus: 6.5,
      apollo: 7.8,
      wellness: 8.1,
      netmedics: 6.2,
    },
  },

  // Paracetamol 650mg
  'med-4-pack-15': {
    currentLowest: 1.2,
    lowestSeller: 'MedPlus Direct',
    baseMarketAvg: 1.45,
    brandPrice: 4.8,
    mrp: 4.8,
    sellerBases: {
      carepoint: 1.35,
      medplus: 1.2,
      apollo: 1.6,
      wellness: 1.65,
      netmedics: 1.4,
    },
  },
  'med-4-pack-30': {
    currentLowest: 2.1,
    lowestSeller: 'CarePoint Pharmacy',
    baseMarketAvg: 2.6,
    brandPrice: 8.5,
    mrp: 8.5,
    sellerBases: {
      carepoint: 2.1,
      medplus: 2.3,
      apollo: 2.85,
      wellness: 2.95,
      netmedics: 2.4,
    },
  },

  // Escitalopram 10mg
  'med-5-pack-10': {
    currentLowest: 4.2,
    lowestSeller: 'MedPlus Direct',
    baseMarketAvg: 4.95,
    brandPrice: 22.0,
    mrp: 22.0,
    sellerBases: {
      carepoint: 4.6,
      medplus: 4.2,
      apollo: 5.3,
      wellness: 5.5,
      netmedics: 4.7,
    },
  },
  'med-5-pack-30': {
    currentLowest: 10.8,
    lowestSeller: 'NetMedics Express Hub',
    baseMarketAvg: 12.4,
    brandPrice: 58.0,
    mrp: 58.0,
    sellerBases: {
      carepoint: 11.9,
      medplus: 11.2,
      apollo: 13.1,
      wellness: 13.5,
      netmedics: 10.8,
    },
  },

  // Azithromycin 500mg
  'med-6-pack-3': {
    currentLowest: 3.1,
    lowestSeller: 'CarePoint Pharmacy',
    baseMarketAvg: 3.75,
    brandPrice: 15.5,
    mrp: 15.5,
    sellerBases: {
      carepoint: 3.1,
      medplus: 3.35,
      apollo: 4.0,
      wellness: 4.2,
      netmedics: 3.5,
    },
  },
  'med-6-pack-5': {
    currentLowest: 4.9,
    lowestSeller: 'MedPlus Direct',
    baseMarketAvg: 5.8,
    brandPrice: 23.0,
    mrp: 23.0,
    sellerBases: {
      carepoint: 5.4,
      medplus: 4.9,
      apollo: 6.2,
      wellness: 6.5,
      netmedics: 5.6,
    },
  },

  // Omeprazole 20mg
  'med-7-pack-15': {
    currentLowest: 2.8,
    lowestSeller: 'MedPlus Direct',
    baseMarketAvg: 3.35,
    brandPrice: 13.5,
    mrp: 13.5,
    sellerBases: {
      carepoint: 3.1,
      medplus: 2.8,
      apollo: 3.6,
      wellness: 3.8,
      netmedics: 3.2,
    },
  },
  'med-7-pack-30': {
    currentLowest: 5.2,
    lowestSeller: 'NetMedics Express Hub',
    baseMarketAvg: 6.1,
    brandPrice: 25.0,
    mrp: 25.0,
    sellerBases: {
      carepoint: 5.8,
      medplus: 5.4,
      apollo: 6.5,
      wellness: 6.8,
      netmedics: 5.2,
    },
  },

  // Rosuvastatin 10mg
  'med-8-pack-10': {
    currentLowest: 3.9,
    lowestSeller: 'MedPlus Direct',
    baseMarketAvg: 4.7,
    brandPrice: 21.0,
    mrp: 21.0,
    sellerBases: {
      carepoint: 4.3,
      medplus: 3.9,
      apollo: 5.1,
      wellness: 5.3,
      netmedics: 4.4,
    },
  },
};

/**
 * Returns historical price trend time-series for a given pack and timeframe
 */
export function getHistoricalPriceTrends(
  packId: string,
  timeframe: Timeframe = '180d'
): PriceTrendPoint[] {
  const seed = PACK_PRICING_SEEDS[packId] || PACK_PRICING_SEEDS['med-1-pack-10'];

  // Point count and interval definition
  let intervals: { label: string; fullDate: string; factor: number; compVariation: number }[] = [];

  if (timeframe === '30d') {
    // 6 intervals (every 5 days)
    intervals = [
      { label: '30d ago', fullDate: 'Aug 09', factor: 1.07, compVariation: 0.05 },
      { label: '25d ago', fullDate: 'Aug 14', factor: 1.05, compVariation: 0.03 },
      { label: '20d ago', fullDate: 'Aug 19', factor: 1.04, compVariation: 0.02 },
      { label: '15d ago', fullDate: 'Aug 24', factor: 1.02, compVariation: 0.01 },
      { label: '10d ago', fullDate: 'Aug 29', factor: 1.01, compVariation: -0.01 },
      { label: '5d ago', fullDate: 'Sep 03', factor: 1.005, compVariation: -0.02 },
      { label: 'Today', fullDate: 'Sep 08', factor: 1.0, compVariation: 0.0 },
    ];
  } else if (timeframe === '90d') {
    // 7 intervals (every ~12-15 days)
    intervals = [
      { label: 'Jun 10', fullDate: 'Jun 10, 2026', factor: 1.14, compVariation: 0.08 },
      { label: 'Jun 25', fullDate: 'Jun 25, 2026', factor: 1.11, compVariation: 0.06 },
      { label: 'Jul 10', fullDate: 'Jul 10, 2026', factor: 1.08, compVariation: 0.04 },
      { label: 'Jul 25', fullDate: 'Jul 25, 2026', factor: 1.06, compVariation: 0.03 },
      { label: 'Aug 10', fullDate: 'Aug 10, 2026', factor: 1.03, compVariation: 0.01 },
      { label: 'Aug 25', fullDate: 'Aug 25, 2026', factor: 1.01, compVariation: -0.01 },
      { label: 'Current', fullDate: 'Sep 08, 2026', factor: 1.0, compVariation: 0.0 },
    ];
  } else if (timeframe === '180d') {
    // 6 monthly intervals
    intervals = [
      { label: 'Apr \'26', fullDate: 'Apr 2026', factor: 1.21, compVariation: 0.12 },
      { label: 'May \'26', fullDate: 'May 2026', factor: 1.16, compVariation: 0.09 },
      { label: 'Jun \'26', fullDate: 'Jun 2026', factor: 1.12, compVariation: 0.06 },
      { label: 'Jul \'26', fullDate: 'Jul 2026', factor: 1.07, compVariation: 0.04 },
      { label: 'Aug \'26', fullDate: 'Aug 2026', factor: 1.03, compVariation: 0.01 },
      { label: 'Sep \'26', fullDate: 'Sep 2026 (Now)', factor: 1.0, compVariation: 0.0 },
    ];
  } else {
    // 1y: 8 intervals over 12 months
    intervals = [
      { label: 'Oct \'25', fullDate: 'Oct 2025', factor: 1.34, compVariation: 0.18 },
      { label: 'Dec \'25', fullDate: 'Dec 2025', factor: 1.28, compVariation: 0.15 },
      { label: 'Feb \'26', fullDate: 'Feb 2026', factor: 1.22, compVariation: 0.11 },
      { label: 'Apr \'26', fullDate: 'Apr 2026', factor: 1.18, compVariation: 0.08 },
      { label: 'Jun \'26', fullDate: 'Jun 2026', factor: 1.11, compVariation: 0.05 },
      { label: 'Jul \'26', fullDate: 'Jul 2026', factor: 1.06, compVariation: 0.03 },
      { label: 'Aug \'26', fullDate: 'Aug 2026', factor: 1.02, compVariation: 0.01 },
      { label: 'Sep \'26', fullDate: 'Sep 2026', factor: 1.0, compVariation: 0.0 },
    ];
  }

  return intervals.map((pt) => {
    const lowest = Number((seed.currentLowest * pt.factor).toFixed(2));
    const marketAvg = Number((seed.baseMarketAvg * pt.factor * 1.02).toFixed(2));
    // Brand prices slowly climb or stay flat
    const brand = Number((seed.brandPrice * (1 + (1 - pt.factor) * 0.15)).toFixed(2));

    const cp = Number((seed.sellerBases.carepoint * pt.factor * (1 + pt.compVariation * 0.3)).toFixed(2));
    const mp = Number((seed.sellerBases.medplus * pt.factor).toFixed(2));
    const ap = Number((seed.sellerBases.apollo * pt.factor * (1 + pt.compVariation * 0.5)).toFixed(2));
    const wf = Number((seed.sellerBases.wellness * pt.factor * (1 + pt.compVariation * 0.4)).toFixed(2));
    const nm = Number((seed.sellerBases.netmedics * pt.factor * (1 - pt.compVariation * 0.2)).toFixed(2));

    return {
      date: pt.label,
      fullDate: pt.fullDate,
      lowestPrice: lowest,
      marketAverage: marketAvg,
      brandPrice: brand,
      mrp: seed.mrp,
      carepoint: cp,
      medplus: mp,
      apollo: ap,
      wellness: wf,
      netmedics: nm,
    };
  });
}

/**
 * Computes deep market intelligence metrics to determine if the user is getting the best market rate
 */
export function assessMarketRate(
  packId: string,
  timeframe: Timeframe = '180d'
): MarketRateAssessment {
  const points = getHistoricalPriceTrends(packId, timeframe);
  const current = points[points.length - 1];
  const first = points[0];

  const prices = points.map((p) => p.lowestPrice);
  const periodLow = Math.min(...prices);
  const periodHigh = Math.max(...prices);

  const avgPrice = Number(
    (points.reduce((acc, curr) => acc + curr.marketAverage, 0) / points.length).toFixed(2)
  );

  const savingsVsBrand = Number((((current.brandPrice - current.lowestPrice) / current.brandPrice) * 100).toFixed(1));
  const savingsVsAvg = Number((((avgPrice - current.lowestPrice) / avgPrice) * 100).toFixed(1));

  // Trend percent (difference between start of period and now)
  const trendPercent = Number((((current.lowestPrice - first.lowestPrice) / first.lowestPrice) * 100).toFixed(1));

  let trendDirection: 'falling' | 'stable' | 'rising' = 'stable';
  if (trendPercent < -1.5) {
    trendDirection = 'falling';
  } else if (trendPercent > 1.5) {
    trendDirection = 'rising';
  }

  // Determine if this is the Best Market Rate
  let status: 'all-time-low' | 'best-rate' | 'fair-market' | 'above-average' = 'best-rate';
  let badgeText = 'Optimal Market Rate';
  let verdict = 'You are getting the best market rate available across all verified pharmacy networks.';
  let suggestedAction = 'Excellent time to purchase your monthly supply.';

  if (current.lowestPrice <= periodLow + 0.05) {
    status = 'all-time-low';
    badgeText = 'All-Time Low Rate (99th Percentile)';
    verdict = `Current price ($${current.lowestPrice.toFixed(2)}) is at the lowest recorded level in this period, saving ${savingsVsAvg}% against market average.`;
    suggestedAction = 'Maximum savings opportunity. Recommended to lock in 30-90 day pack supply.';
  } else if (savingsVsAvg > 10) {
    status = 'best-rate';
    badgeText = 'Prime Market Rate';
    verdict = `Priced ${savingsVsAvg}% lower than the regional market average ($${avgPrice.toFixed(2)}). Verified under freshness SLA.`;
    suggestedAction = 'Strong market rate. Best price available from verified partners.';
  } else if (savingsVsAvg >= 0) {
    status = 'fair-market';
    badgeText = 'Fair Market Value';
    verdict = `Priced within normal market tolerance of $${avgPrice.toFixed(2)}. Still saves ${savingsVsBrand}% vs innovator brand.`;
    suggestedAction = 'Standard competitive rate with verified batch tracking.';
  } else {
    status = 'above-average';
    badgeText = 'Slightly Above Average';
    verdict = `Current offers are higher than historical lows. Consider checking alternate pack sizes for better unit economics.`;
    suggestedAction = 'Check alternate pack quantities (e.g. 30 vs 10 tablets) for volume discounts.';
  }

  const seed = PACK_PRICING_SEEDS[packId] || PACK_PRICING_SEEDS['med-1-pack-10'];

  return {
    currentLowest: current.lowestPrice,
    lowestSellerName: seed.lowestSeller,
    averagePrice: avgPrice,
    brandPrice: current.brandPrice,
    mrp: current.mrp,
    savingsVsBrandPct: savingsVsBrand,
    savingsVsAvgPct: savingsVsAvg,
    status,
    badgeText,
    verdict,
    trendDirection,
    trendPercent,
    periodHigh,
    periodLow,
    suggestedAction,
  };
}
