export const CANONICAL_CATEGORIES = Object.freeze([
  "Cardiovascular Disorders",
  "Infectious Diseases",
  "Endocrinology",
  "Respiratory Disorders",
  "Renal & Electrolyte Disorders",
  "Gastrointestinal Disorders",
  "Neurology & Psychiatry",
  "Hematology",
  "Oncology",
  "Rheumatology & Pain",
  "Women's & Men's Health",
  "Immunizations",
  "Manufacturing and Calculation",
  "Pharmacy Practice",
  "Pharmacy Law & Ethics",
  "Research",
]);

if (typeof window !== "undefined") {
  window.AJIX_CANONICAL_CATEGORIES = [...CANONICAL_CATEGORIES];
}