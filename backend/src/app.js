const express = require('express');
const cors = require('cors');
const sessionMiddleware = require('./session');
const { requireAdminAuth } = require('./middleware/requireAdminAuth');

const dictionariesRouter = require('./routes/dictionaries');
const tripitakaCatalogueRouter = require('./routes/tripitaka-catalogue');
const entriesRouter = require('./routes/entries');
const pdfBooksRouter = require('./routes/pdf-books');
const videosRouter = require('./routes/videos');
const galleriesRouter = require('./routes/galleries');
const adminAuthRouter = require('./routes/admin-auth');
const adminEntriesRouter = require('./routes/admin-entries');
const adminUploadsRouter = require('./routes/admin-uploads');
const adminPdfBooksRouter = require('./routes/admin-pdf-books');
const adminVideoSeriesRouter = require('./routes/admin-video-series');
const adminVideosRouter = require('./routes/admin-videos');
const adminGalleriesRouter = require('./routes/admin-galleries');
const sponsorshipRouter = require('./routes/sponsorship');
const adminSponsorshipRouter = require('./routes/admin-sponsorship');
const meditationRouter = require('./routes/meditation');
const adminMeditationRouter = require('./routes/admin-meditation');
const katinaRouter = require('./routes/katina');
const adminKatinaRouter = require('./routes/admin-katina');
const pohoyaCalendarRouter = require('./routes/pohoya-calendar');
const adminPohoyaCalendarRouter = require('./routes/admin-pohoya-calendar');
const specialThanksRouter = require('./routes/special-thanks');
const adminSpecialThanksRouter = require('./routes/admin-special-thanks');
const staticDocumentsRouter = require('./routes/static-documents');
const adminStaticDocumentsRouter = require('./routes/admin-static-documents');
const inquiriesRouter = require('./routes/inquiries');
const adminInquiriesRouter = require('./routes/admin-inquiries');
const newsletterRouter = require('./routes/newsletter');
const adminNewsletterRouter = require('./routes/admin-newsletter');
const adminTripitakaCatalogueRouter = require('./routes/admin-tripitaka-catalogue');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(sessionMiddleware);

if ((process.env.STORAGE_DRIVER || 'local') === 'local') {
  const { UPLOAD_DIR } = require('./storage/localStorage');
  app.use('/uploads', express.static(UPLOAD_DIR));
}

app.use('/api/dictionaries', dictionariesRouter);
app.use('/api/tripitaka-catalogue', tripitakaCatalogueRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/pdf-books', pdfBooksRouter);
app.use('/api/videos', videosRouter);
app.use('/api/galleries', galleriesRouter);
app.use('/api/sponsorship', sponsorshipRouter);
app.use('/api/meditation-applications', meditationRouter);
app.use('/api/katina', katinaRouter);
app.use('/api/pohoya-calendar', pohoyaCalendarRouter);
app.use('/api/special-thanks', specialThanksRouter);
app.use('/api/static-documents', staticDocumentsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/newsletter-subscribers', newsletterRouter);

app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/entries', requireAdminAuth, adminEntriesRouter);
app.use('/api/admin/uploads', requireAdminAuth, adminUploadsRouter);
app.use('/api/admin/pdf-books', requireAdminAuth, adminPdfBooksRouter);
app.use('/api/admin/video-series', requireAdminAuth, adminVideoSeriesRouter);
app.use('/api/admin/videos', requireAdminAuth, adminVideosRouter);
app.use('/api/admin/galleries', requireAdminAuth, adminGalleriesRouter);
app.use('/api/admin/sponsorship', requireAdminAuth, adminSponsorshipRouter);
app.use('/api/admin/meditation-applications', requireAdminAuth, adminMeditationRouter);
app.use('/api/admin/katina', requireAdminAuth, adminKatinaRouter);
app.use('/api/admin/pohoya-calendar', requireAdminAuth, adminPohoyaCalendarRouter);
app.use('/api/admin/special-thanks', requireAdminAuth, adminSpecialThanksRouter);
app.use('/api/admin/static-documents', requireAdminAuth, adminStaticDocumentsRouter);
app.use('/api/admin/inquiries', requireAdminAuth, adminInquiriesRouter);
app.use('/api/admin/newsletter-subscribers', requireAdminAuth, adminNewsletterRouter);
app.use('/api/admin/tripitaka-catalogue', requireAdminAuth, adminTripitakaCatalogueRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
