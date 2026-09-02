// Mirrors backend/src/config/pdfBookCategories.js — the four PDF Books
// category pages (build-spec §8.1-8.5).
export const PDF_BOOK_CATEGORIES = [
  { slug: 'tripitaka-pdf', titleEn: 'Tripitaka (PDF)', titleSi: 'ත්‍රිපිටක (PDF)' },
  { slug: 'atthakatha', titleEn: 'Atthakatha (PDF)', titleSi: 'අට්ඨකථා (PDF)' },
  { slug: 'tika', titleEn: 'Tīka (PDF)', titleSi: 'ටීකා (PDF)' },
  { slug: 'other-valuable-books', titleEn: 'Other Valuable Books', titleSi: 'වෙනත් වැදගත් පොත්' },
];

export const PDF_BOOK_CATEGORY_LABELS = Object.fromEntries(
  PDF_BOOK_CATEGORIES.map((c) => [c.slug, c.titleEn])
);
