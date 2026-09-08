import { Medicine, ExtractedPrescriptionMedicine } from '../types';

export interface CatalogMatchResult {
  medicine: Medicine | null;
  matchScore: number; // 0-100
  suggestedSearchQuery: string;
}

/**
 * Matches an AI-extracted prescription medicine against the genericMed catalog
 */
export function matchPrescriptionToCatalog(
  extracted: ExtractedPrescriptionMedicine,
  catalog: Medicine[]
): CatalogMatchResult {
  const query = extracted.searchQuery.toLowerCase().trim();
  const generic = extracted.genericName.toLowerCase().trim();
  const name = extracted.name.toLowerCase().trim();

  let bestMatch: Medicine | null = null;
  let bestScore = 0;

  for (const med of catalog) {
    const medName = med.name.toLowerCase();
    const medBrand = med.brandName.toLowerCase();
    const medGeneric = med.genericName.toLowerCase();
    const medActive = med.activeIngredient.toLowerCase();

    // Exact active ingredient or generic match
    if (
      medActive === generic ||
      medGeneric === generic ||
      medActive.includes(query) ||
      query.includes(medActive)
    ) {
      const score = 95;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = med;
      }
    }
    // Brand name match (e.g. Lipitor, Glucophage, Amoxil)
    else if (medBrand.includes(name) || name.includes(medBrand)) {
      const score = 90;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = med;
      }
    }
    // Partial name match
    else if (medName.includes(query) || medGeneric.includes(query)) {
      const score = 80;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = med;
      }
    }
  }

  return {
    medicine: bestMatch,
    matchScore: bestScore,
    suggestedSearchQuery: bestMatch ? bestMatch.activeIngredient : extracted.searchQuery,
  };
}
