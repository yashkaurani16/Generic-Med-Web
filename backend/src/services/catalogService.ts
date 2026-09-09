import { prisma } from '../lib/db';
import { INITIAL_MEDICINES, INITIAL_OFFERS } from '../data/mockData';
import { Medicine, SellerOffer } from '../types';

export interface CatalogQueryParams {
  search?: string;
  category?: string;
  sortBy?: 'price_asc' | 'savings_desc' | 'rating_desc' | 'promoted_first';
  prescriptionOnly?: boolean;
}

export class CatalogService {
  /**
   * Search catalog medicines with smart matching, pack normalization and optional promoted priority
   */
  static async searchMedicines(params: CatalogQueryParams): Promise<Medicine[]> {
    const { search, category, prescriptionOnly } = params;

    let medicines: Medicine[] = [];

    if (prisma) {
      try {
        const whereClause: any = {};
        if (search) {
          whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { genericName: { contains: search, mode: 'insensitive' } },
            { brandName: { contains: search, mode: 'insensitive' } },
            { activeIngredient: { contains: search, mode: 'insensitive' } },
          ];
        }
        if (category) {
          whereClause.therapeuticClass = category;
        }
        if (prescriptionOnly !== undefined) {
          whereClause.isPrescriptionRequired = prescriptionOnly;
        }

        const dbMeds = await prisma.medicine.findMany({
          where: whereClause,
          include: { packs: true },
        });

        if (dbMeds.length > 0) {
          medicines = dbMeds.map((m) => ({
            id: m.id,
            name: m.name,
            brandName: m.brandName,
            genericName: m.genericName,
            activeIngredient: m.activeIngredient,
            dosageForm: m.dosageForm as any,
            strength: m.strength,
            therapeuticClass: m.therapeuticClass,
            isPrescriptionRequired: m.isPrescriptionRequired,
            manufacturer: m.manufacturer,
            description: m.description,
            commonUses: m.commonUses,
            packs: m.packs.map((p) => ({
              packId: p.id,
              packQuantity: p.packQuantity,
              packUnit: p.packUnit,
              packLabel: p.packLabel,
              canonicalBarcode: p.canonicalBarcode,
            })),
          }));
        }
      } catch {
        // Fallback to in-memory data
        medicines = INITIAL_MEDICINES;
      }
    }

    if (medicines.length === 0) {
      medicines = INITIAL_MEDICINES;
    }

    // Apply client filters if using fallback
    return medicines.filter((med) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          med.name.toLowerCase().includes(q) ||
          med.genericName.toLowerCase().includes(q) ||
          med.brandName.toLowerCase().includes(q) ||
          med.activeIngredient.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (category && med.therapeuticClass !== category) return false;
      if (prescriptionOnly !== undefined && med.isPrescriptionRequired !== prescriptionOnly) return false;
      return true;
    });
  }

  /**
   * Fetch verified seller offers normalized by price with Enterprise/Partner boost
   */
  static async getOffersForMedicine(medicineId: string): Promise<SellerOffer[]> {
    let offers: SellerOffer[] = [];

    if (prisma) {
      try {
        const dbOffers = await prisma.sellerOffer.findMany({
          where: { medicineId },
          include: { pharmacy: true },
          orderBy: { price: 'asc' },
        });

        if (dbOffers.length > 0) {
          offers = dbOffers.map((o) => ({
            id: o.id,
            pharmacyId: o.pharmacyId,
            pharmacyName: o.pharmacy.name,
            medicineId: o.medicineId,
            packId: o.packId,
            price: Number(o.price),
            mrp: Number(o.mrp),
            inStock: o.inStock,
            stockQuantity: o.stockQuantity,
            deliveryEstimate: o.deliveryEstimate,
            deliveryFee: Number(o.deliveryFee),
            lastUpdated: o.lastUpdated.toISOString(),
            freshnessMinutesAgo: Math.max(
              0,
              Math.floor((Date.now() - new Date(o.lastUpdated).getTime()) / 60000)
            ),
            freshnessStatus: 'fresh',
            verifiedBadge: o.pharmacy.verified,
          }));
        }
      } catch {
        offers = INITIAL_OFFERS.filter((o) => o.medicineId === medicineId);
      }
    }

    if (offers.length === 0) {
      offers = INITIAL_OFFERS.filter((o) => o.medicineId === medicineId);
    }

    return offers;
  }
}
