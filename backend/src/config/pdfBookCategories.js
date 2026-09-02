// The four PDF Books category pages (build-spec §8.1-8.5). `category`
// must match the `pdf_books.category` column values exactly — confirmed
// against the imported data (293 rows split across exactly these 4).
const PDF_BOOK_CATEGORIES = {
  'tripitaka-pdf': {
    slug: 'tripitaka-pdf',
    category: 'Tripitaka (PDF)',
    titleEn: 'Tripitaka (PDF)',
    titleSi: 'ත්‍රිපිටක (PDF)',
  },
  atthakatha: {
    slug: 'atthakatha',
    category: 'Atthakatha (PDF)',
    titleEn: 'Atthakatha (PDF)',
    titleSi: 'අට්ඨකථා (PDF)',
  },
  tika: {
    slug: 'tika',
    category: 'Tika (PDF)',
    titleEn: 'Tīka (PDF)',
    titleSi: 'ටීකා (PDF)',
  },
  'other-valuable-books': {
    slug: 'other-valuable-books',
    category: 'Other Valuable Books',
    titleEn: 'Other Valuable Books',
    titleSi: 'වෙනත් වැදගත් පොත්',
    // The live site presents this category as tabs across its top-level
    // sections (Abhidhamma / Rerukane Chandawimala Thero / Other) rather
    // than the Vinaya/Sutta/Abhidhamma pitaka split the other 3 PDF Books
    // categories use — see classifySectionTabs in routes/pdf-books.js.
    tabsBySection: true,
  },
};

function getPdfBookCategory(slug) {
  return PDF_BOOK_CATEGORIES[slug] || null;
}

module.exports = { PDF_BOOK_CATEGORIES, getPdfBookCategory };
