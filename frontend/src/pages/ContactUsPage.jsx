import { InquiryForm } from '../components/InquiryForm';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { useTranslation } from '../i18n/LanguageContext';
import {
  contactLocationEn,
  contactDirectionsEn,
  contactPostalAddressLines,
  contactChannels,
  contactOfficeHours,
  contactMapEmbedSrc,
  contactMapLinkUrl,
} from '../content/contactContent';
import './ContactUsPage.css';

// build-spec §18 — static location/contact info + the shared InquiryForm
// and NewsletterSignup components (also used later on the home page).
export function ContactUsPage() {
  const { t } = useTranslation();
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

      {/* [CONTENT — English, migrate verbatim] build-spec §18 — English
          only, no Sinhala version exists, so this text doesn't switch with
          the language toggle. */}
      <section className="contact-us__section card">
        <h2>{t('contactUs.location')}</h2>
        <p>{contactLocationEn}</p>
        <ul>
          {contactDirectionsEn.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="contact-us__section card">
        <h2>{t('contactUs.postalAddress')}</h2>
        <address>
          {contactPostalAddressLines.map((line, i) => (
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
            {contactChannels.map(([channel, value]) => (
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
        <table className="contact-us__table">
          <tbody>
            {contactOfficeHours.map(([day, hours]) => (
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
