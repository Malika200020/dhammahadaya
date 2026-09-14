import { useEffect, useState } from 'react';
import { getGallery } from '../api/galleries';
import { PhotoGallery } from '../components/PhotoGallery';
import { aboutEn, aboutSi, visitorGuidelinesEn } from '../content/aboutContent';
import './AboutPage.css';

// build-spec §14 — EN/SI toggle static text + a photo gallery reusing the
// step-7 gallery mechanism (gallery='about', no gallery_key — a single
// gallery, same shape as Buddha Puja's).
export function AboutPage() {
  const [language, setLanguage] = useState('en');
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
      <h1>About | අප ගැන</h1>

      <div className="about__toggle">
        <button
          type="button"
          className={language === 'en' ? 'about__toggle-btn about__toggle-btn--active' : 'about__toggle-btn'}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
        <button
          type="button"
          className={language === 'si' ? 'about__toggle-btn about__toggle-btn--active' : 'about__toggle-btn'}
          onClick={() => setLanguage('si')}
        >
          සිංහල
        </button>
      </div>

      {/* [CONTENT — English/Sinhala, migrate verbatim] build-spec §14 */}
      <div className="about__text card">
        <p className="about__reg-no">{content.registrationNo}</p>
        {content.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

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

      <h2 className="about__gallery-heading">Photo Gallery</h2>
      <PhotoGallery images={images} loading={imagesLoading} />
    </div>
  );
}
