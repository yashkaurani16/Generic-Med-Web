import { matchPrescriptionToCatalog } from '../../utils/prescriptionMatcher';
import type { Medicine, ExtractedPrescriptionMedicine } from '../../types';

const mockCatalog: Medicine[] = [
  {
    id: 'med-1',
    name: 'Atorvastatin (Generic)',
    brandName: 'Lipitor',
    genericName: 'Atorvastatin Calcium',
    activeIngredient: 'Atorvastatin',
    dosageForm: 'Tablet',
    strength: '10 mg',
    therapeuticClass: 'Cardiovascular / Lipid-Lowering Statin',
    isPrescriptionRequired: true,
    manufacturer: 'Sun Pharma',
    description: 'Statin medication',
    commonUses: ['High Cholesterol'],
    packs: [{ packId: 'p1', packQuantity: 10, packUnit: 'Tablets', packLabel: 'Pack of 10', canonicalBarcode: '12345' }],
  },
  {
    id: 'med-2',
    name: 'Metformin Hydrochloride (Generic)',
    brandName: 'Glucophage',
    genericName: 'Metformin HCl',
    activeIngredient: 'Metformin',
    dosageForm: 'Tablet',
    strength: '500 mg',
    therapeuticClass: 'Antidiabetic / Biguanide',
    isPrescriptionRequired: true,
    manufacturer: 'Torrent',
    description: 'Antidiabetic medication',
    commonUses: ['Type 2 Diabetes'],
    packs: [{ packId: 'p2', packQuantity: 30, packUnit: 'Tablets', packLabel: 'Pack of 30', canonicalBarcode: '12346' }],
  },
  {
    id: 'med-3',
    name: 'Paracetamol',
    brandName: 'Calpol',
    genericName: 'Paracetamol',
    activeIngredient: 'Acetaminophen',
    dosageForm: 'Tablet',
    strength: '650 mg',
    therapeuticClass: 'Analgesic & Antipyretic',
    isPrescriptionRequired: false,
    manufacturer: 'GSK',
    description: 'Pain reliever',
    commonUses: ['Fever', 'Pain'],
    packs: [{ packId: 'p3', packQuantity: 15, packUnit: 'Tablets', packLabel: 'Strip of 15', canonicalBarcode: '12347' }],
  },
];

describe('matchPrescriptionToCatalog', () => {
  describe('Exact active ingredient matching', () => {
    it('should match Atorvastatin by searchQuery', () => {
      const extracted: ExtractedPrescriptionMedicine = {
        name: 'Lipitor 10mg',
        genericName: 'Atorvastatin Calcium',
        strength: '10 mg',
        dosageForm: 'Tablet',
        frequency: '1 tab daily',
        searchQuery: 'Atorvastatin',
        confidenceScore: 98,
      };
      const result = matchPrescriptionToCatalog(extracted, mockCatalog);
      expect(result.medicine).not.toBeNull();
      expect(result.medicine?.id).toBe('med-1');
      expect(result.matchScore).toBeGreaterThanOrEqual(80);
    });

    it('should match Metformin by active ingredient', () => {
      const extracted: ExtractedPrescriptionMedicine = {
        name: 'Glucophage 500mg',
        genericName: 'Metformin HCl',
        strength: '500 mg',
        dosageForm: 'Tablet',
        frequency: '1 tab twice daily',
        searchQuery: 'Metformin',
        confidenceScore: 96,
      };
      const result = matchPrescriptionToCatalog(extracted, mockCatalog);
      expect(result.medicine?.id).toBe('med-2');
    });
  });

  describe('Brand name matching', () => {
    it('should match by brand name (Lipitor)', () => {
      const extracted: ExtractedPrescriptionMedicine = {
        name: 'Lipitor',
        genericName: 'Unknown',
        strength: '10 mg',
        dosageForm: 'Tablet',
        frequency: 'daily',
        searchQuery: 'Unknown',
        confidenceScore: 80,
      };
      const result = matchPrescriptionToCatalog(extracted, mockCatalog);
      expect(result.medicine?.id).toBe('med-1');
      expect(result.matchScore).toBeGreaterThanOrEqual(80);
    });

    it('should match Calpol to Paracetamol', () => {
      const extracted: ExtractedPrescriptionMedicine = {
        name: 'Calpol 650',
        genericName: 'Paracetamol',
        strength: '650 mg',
        dosageForm: 'Tablet',
        frequency: 'SOS',
        searchQuery: 'Paracetamol',
        confidenceScore: 95,
      };
      const result = matchPrescriptionToCatalog(extracted, mockCatalog);
      expect(result.medicine?.id).toBe('med-3');
    });
  });

  describe('No match scenarios', () => {
    it('should return null medicine when no catalog match found', () => {
      const extracted: ExtractedPrescriptionMedicine = {
        name: 'UnknownDrug 500mg',
        genericName: 'Completelymadeupname',
        strength: '500 mg',
        dosageForm: 'Tablet',
        frequency: 'daily',
        searchQuery: 'NonExistentMolecule',
        confidenceScore: 70,
      };
      const result = matchPrescriptionToCatalog(extracted, mockCatalog);
      expect(result.medicine).toBeNull();
      expect(result.matchScore).toBe(0);
    });

    it('should return suggestedSearchQuery even with no match', () => {
      const extracted: ExtractedPrescriptionMedicine = {
        name: 'RareDrug',
        genericName: 'RareMolecule',
        strength: '100 mg',
        dosageForm: 'Capsule',
        frequency: 'once daily',
        searchQuery: 'RareMolecule',
        confidenceScore: 85,
      };
      const result = matchPrescriptionToCatalog(extracted, mockCatalog);
      expect(result.suggestedSearchQuery).toBe('RareMolecule');
    });
  });

  describe('Empty catalog', () => {
    it('should handle empty catalog gracefully', () => {
      const extracted: ExtractedPrescriptionMedicine = {
        name: 'Atorvastatin',
        genericName: 'Atorvastatin',
        strength: '10 mg',
        dosageForm: 'Tablet',
        frequency: 'daily',
        searchQuery: 'Atorvastatin',
        confidenceScore: 95,
      };
      const result = matchPrescriptionToCatalog(extracted, []);
      expect(result.medicine).toBeNull();
      expect(result.matchScore).toBe(0);
    });
  });
});
