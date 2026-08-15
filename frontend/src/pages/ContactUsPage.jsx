import { InquiryForm } from '../components/InquiryForm';
import { NewsletterSignup } from '../components/NewsletterSignup';
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
  return (
    <div className="contact-us">
      <h1>Contact Us</h1>

      <iframe
        className="contact-us__map"
        title="Dhammahadaya Senasanaya location"
        src={contactMapEmbedSrc}
        loading="lazy"
      />
      <a className="contact-us__map-link" href={contactMapLinkUrl} target="_blank" rel="noreferrer">
        View on Google Maps
      </a>

      {/* [CONTENT — English, migrate verbatim] build-spec §18 */}
      <section className="contact-us__section">
        <h2>Location</h2>
        <p>{contactLocationEn}</p>
        <ul>
          {contactDirectionsEn.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="contact-us__section">
        <h2>Postal Address</h2>
        <address>
          {contactPostalAddressLines.map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </address>
      </section>

      <section className="contact-us__section">
        <h2>Contact Details</h2>
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

      <section className="contact-us__section">
        <h2>Office Phone Hours</h2>
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

      <section className="contact-us__section">
        <h2>Send an Inquiry</h2>
        <InquiryForm />
      </section>

      <section className="contact-us__section">
        <h2>Newsletter</h2>
        <NewsletterSignup />
      </section>
    </div>
  );
}
