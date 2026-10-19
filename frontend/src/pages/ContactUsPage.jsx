import { InquiryForm } from '../components/InquiryForm';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { useTranslation } from '../i18n/LanguageContext';
import {
  contactLocation,
  contactDirections,
  contactPostalAddressLines,
  contactChannels,
  contactOfficeHours,
  contactOfficeHoursIntroSi,
  contactMapEmbedSrc,
  contactMapLinkUrl,
} from '../content/contactContent';
import './ContactUsPage.css';

// build-spec §18 — static location/contact info + the shared InquiryForm
// and NewsletterSignup components (also used later on the home page).
// Sinhala added later (client doc, 2026-10) — this whole section was
// English-only until then (no Sinhala version existed at the time of the
// original migration).
export function ContactUsPage() {
  const { language, t } = useTranslation();
  return (
    <div className="contact-us">
      <h1>{t('nav.contactUs')}</h1>

      <iframe
        className="contact-us__map"
        title="Dhammahadaya Senasanaya location"
        src={contactMapEmbedSrc}
        loading="lazy"
      />
      <a className="contact-us__map-link" href={contactMapLinkUrl} target="_blank" rel="noreferrer">
        {t('contactUs.viewOnGoogleMaps')}
      </a>

      {/* [CONTENT — English/Sinhala, migrate verbatim] build-spec §18 */}
      <section className="contact-us__section card">
        <h2>{t('contactUs.location')}</h2>
        <p>{contactLocation[language]}</p>
        <ul>
          {contactDirections[language].map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="contact-us__section card">
        <h2>{t('contactUs.postalAddress')}</h2>
        <address>
          {contactPostalAddressLines[language].map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </address>
      </section>

      <section className="contact-us__section card">
        <h2>{t('contactUs.contactDetails')}</h2>
        <table className="contact-us__table">
          <tbody>
            {contactChannels[language].map(([channel, value]) => (
              <tr key={channel}>
                <th>{channel}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="contact-us__section card">
        <h2>{t('contactUs.officePhoneHours')}</h2>
        {language === 'si' ? <p>{contactOfficeHoursIntroSi}</p> : null}
        <table className="contact-us__table">
          <tbody>
            {contactOfficeHours[language].map(([day, hours]) => (
              <tr key={day}>
                <th>{day}</th>
                <td>{hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="contact-us__section card">
        <h2>{t('contactUs.sendInquiry')}</h2>
        <InquiryForm />
      </section>

      <section className="contact-us__section card">
        <h2>{t('contactUs.newsletter')}</h2>
        <NewsletterSignup />
      </section>
    </div>
  );
}
