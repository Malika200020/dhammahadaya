// Shared with backend/scripts/import-pdf-books.js and the admin pdf-books
// route: derives (link_prefix, link_book_code) from a title like
// "SP_DN1_Dighanikaya 01 – ..." or "PA06_DN1_Seelakkandhavagga_..." — a
// letter prefix, an optional sequence number, then the book code. See
// backend/src/routes/tripitaka-catalogue.js for how the catalogue matches
// against this.
const CODE_RE = /^([A-Za-z]+)(\d*)_([A-Za-z0-9]+)_/;

function extractLinkCode(title) {
  const match = (title || '').match(CODE_RE);
  return match ? { linkPrefix: match[1], linkBookCode: match[3] } : { linkPrefix: null, linkBookCode: null };
}

module.exports = { extractLinkCode };
