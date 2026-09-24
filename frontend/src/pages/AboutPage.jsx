import { useEffect, useState } from 'react';
import { getGallery } from '../api/galleries';
import { PhotoGallery } from '../components/PhotoGallery';
import { useTranslation } from '../i18n/LanguageContext';
import { aboutEn, aboutSi, visitorGuidelinesEn } from '../content/aboutContent';
import './AboutPage.css';

// build-spec §14 — EN/SI static text + a photo gallery reusing the step-7
// gallery mechanism (gallery='about', no gallery_key — a single gallery,
// same shape as Buddha Puja's). The page's own EN/SI toggle was replaced
// by the global nav-bar language toggle (client request, 2026-09) — this
// page now just reads the current language instead of keeping its own.
export function AboutPage() {
  const { language, t } = useTranslation();
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    getGallery('about')
      .then((d) => setImages(d.images))
      .catch(() => setImages([]))
      .finally(() => setImagesLoading(false));
  }, []);

  const content = language === 'en' ? aboutEn : aboutSi;

  return (
    <div className="about">
      <h1>{t('about.pageTitle')}</h1>

      {/* [CONTENT — English/Sinhala, migrate verbatim] build-spec §14 */}
      <div className="about__text card">
        <p className="about__reg-no">{content.registrationNo}</p>
        {content.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* English only — no Sinhala version of this content exists (added
          2026-09, not part of the original bilingual migration), so unlike
          the text above it doesn't switch with the language toggle. */}
      <div className="about__guidelines card">
        <h2>{visitorGuidelinesEn.heading}</h2>
        {visitorGuidelinesEn.sections.map((section) => (
          <div key={section.heading} className="about__guideline-section">
            <h3>{section.heading}</h3>
            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {section.hours ? (
              <ul>
                {section.hours.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>

      <h2 className="about__gallery-heading">{t('about.photoGallery')}</h2>
      <PhotoGallery images={images} loading={imagesLoading} />
    </div>
  );
}
