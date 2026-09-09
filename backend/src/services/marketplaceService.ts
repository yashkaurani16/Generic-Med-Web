import { logger } from '../lib/logger';
import { eventBus } from '../lib/eventBus';

export type PharmacyTier = 'Basic' | 'Verified' | 'Enterprise';

export interface TierConfig {
  name: PharmacyTier;
  commissionRate: number; // e.g., 0.08 for 8%
  slaHours: number;
  featuredBadge: boolean;
  priorityPlacement: boolean;
}

export const PHARMACY_TIERS: Record<PharmacyTier, TierConfig> = {
  Basic: {
    name: 'Basic',
    commissionRate: 0.08,
    slaHours: 24,
    featuredBadge: false,
    priorityPlacement: false,
  },
  Verified: {
    name: 'Verified',
    commissionRate: 0.05,
    slaHours: 4,
    featuredBadge: true,
    priorityPlacement: true,
  },
  Enterprise: {
    name: 'Enterprise',
    commissionRate: 0.03,
    slaHours: 2,
    featuredBadge: true,
    priorityPlacement: true,
  },
};

export interface SettlementLedgerEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  pharmacyId: string;
  pharmacyName: string;
  grossAmount: number;
  tier: PharmacyTier;
  commissionRate: number;
  commissionAmount: number;
  netPayoutAmount: number;
  escrowStatus: 'Held' | 'Released' | 'Refunded';
  createdAt: string;
  releasedAt?: string;
}

export interface PayoutRequest {
  id: string;
  pharmacyId: string;
  amount: number;
  status: 'Pending' | 'Processed' | 'Rejected';
  requestedAt: string;
  processedAt?: string;
  bankAccountRef: string;
}

// In-memory settlement ledger for demonstration and development
let settlementLedger: SettlementLedgerEntry[] = [
  {
    id: 'stl-001',
    orderId: 'ord-101',
    orderNumber: 'GM-2026-0901',
    pharmacyId: 'pharm-1',
    pharmacyName: 'Apollo Pharmacy - Indiranagar',
    grossAmount: 480,
    tier: 'Enterprise',
    commissionRate: 0.03,
    commissionAmount: 14.4,
    netPayoutAmount: 465.6,
    escrowStatus: 'Released',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    releasedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'stl-002',
    orderId: 'ord-102',
    orderNumber: 'GM-2026-0902',
    pharmacyId: 'pharm-2',
    pharmacyName: 'MedPlus - Koramangala',
    grossAmount: 320,
    tier: 'Verified',
    commissionRate: 0.05,
    commissionAmount: 16.0,
    netPayoutAmount: 304.0,
    escrowStatus: 'Held',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

let payoutRequests: PayoutRequest[] = [
  {
    id: 'payout-101',
    pharmacyId: 'pharm-1',
    amount: 15000,
    status: 'Processed',
    requestedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    processedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    bankAccountRef: 'HDFC Bank - •••• 4092',
  },
];

export class MarketplaceService {
  /**
   * Determine the tier of a pharmacy (defaults to Verified or Basic)
   */
  static getPharmacyTier(pharmacyId: string): PharmacyTier {
    if (pharmacyId === 'pharm-1' || pharmacyId === 'pharm-3') return 'Enterprise';
    if (pharmacyId === 'pharm-2' || pharmacyId === 'pharm-4') return 'Verified';
    return 'Basic';
  }

  /**
   * Calculate platform commission & escrow for an order
   */
  static calculateOrderEscrow(
    orderId: string,
    orderNumber: string,
    pharmacyId: string,
    pharmacyName: string,
    subtotal: number
  ): SettlementLedgerEntry {
    const tier = this.getPharmacyTier(pharmacyId);
    const config = PHARMACY_TIERS[tier];
    const commissionAmount = Math.round(subtotal * config.commissionRate * 100) / 100;
    const netPayoutAmount = Math.round((subtotal - commissionAmount) * 100) / 100;

    const entry: SettlementLedgerEntry = {
      id: `stl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      orderNumber,
      pharmacyId,
      pharmacyName,
      grossAmount: subtotal,
      tier,
      commissionRate: config.commissionRate,
      commissionAmount,
      netPayoutAmount,
      escrowStatus: 'Held',
      createdAt: new Date().toISOString(),
    };

    settlementLedger.unshift(entry);

    logger.info(`Escrow created for order ${orderNumber}: ₹${subtotal} (Commission: ₹${commissionAmount})`, {
      module: 'MarketplaceService',
      orderId,
      tier,
    });

    return entry;
  }

  /**
   * Release escrow funds to pharmacy balance upon order completion
   */
  static releaseEscrowForOrder(orderId: string): boolean {
    const entry = settlementLedger.find((item) => item.orderId === orderId);
    if (!entry) return false;

    if (entry.escrowStatus === 'Held') {
      entry.escrowStatus = 'Released';
      entry.releasedAt = new Date().toISOString();

      logger.info(`Escrow released for order ${entry.orderNumber}: net ₹${entry.netPayoutAmount} to ${entry.pharmacyName}`, {
        module: 'MarketplaceService',
        orderId,
      });

      eventBus.publish('settlement.released', {
        orderId,
        pharmacyId: entry.pharmacyId,
        netPayoutAmount: entry.netPayoutAmount,
      });

      return true;
    }
    return false;
  }

  /**
   * Refund escrow when order is cancelled
   */
  static refundEscrowForOrder(orderId: string): boolean {
    const entry = settlementLedger.find((item) => item.orderId === orderId);
    if (!entry) return false;

    entry.escrowStatus = 'Refunded';
    logger.info(`Escrow refunded for order ${entry.orderNumber}`, {
      module: 'MarketplaceService',
      orderId,
    });
    return true;
  }

  /**
   * Get marketplace settlement summary for Admin or a specific Pharmacy
   */
  static getSettlementSummary(pharmacyId?: string) {
    const items = pharmacyId
      ? settlementLedger.filter((s) => s.pharmacyId === pharmacyId)
      : settlementLedger;

    const totalGross = items.reduce((acc, s) => acc + s.grossAmount, 0);
    const totalCommission = items.reduce((acc, s) => acc + s.commissionAmount, 0);
    const totalNet = items.reduce((acc, s) => acc + s.netPayoutAmount, 0);
    const pendingEscrow = items
      .filter((s) => s.escrowStatus === 'Held')
      .reduce((acc, s) => acc + s.netPayoutAmount, 0);
    const availablePayout = items
      .filter((s) => s.escrowStatus === 'Released')
      .reduce((acc, s) => acc + s.netPayoutAmount, 0);

    return {
      totalGross: Math.round(totalGross * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
      pendingEscrow: Math.round(pendingEscrow * 100) / 100,
      availablePayout: Math.round(availablePayout * 100) / 100,
      ledgerCount: items.length,
      recentTransactions: items.slice(0, 10),
    };
  }

  /**
   * Get itemized ledger
   */
  static getLedger(pharmacyId?: string): SettlementLedgerEntry[] {
    return pharmacyId
      ? settlementLedger.filter((s) => s.pharmacyId === pharmacyId)
      : settlementLedger;
  }

  /**
   * Request a payout disbursement
   */
  static requestPayout(pharmacyId: string, amount: number, bankAccountRef: string): PayoutRequest {
    const request: PayoutRequest = {
      id: `payout-${Date.now()}`,
      pharmacyId,
      amount,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      bankAccountRef,
    };
    payoutRequests.unshift(request);
    return request;
  }
}
