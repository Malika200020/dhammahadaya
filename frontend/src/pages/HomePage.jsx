import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listEntries } from '../api/entries';
import { EntryCard } from '../components/EntryCard';
import { getSponsorshipCalendar } from '../api/sponsorship';
import { BookingCalendar, getSponsorshipCalendarRange } from '../components/BookingCalendar';
import { InquiryForm } from '../components/InquiryForm';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { Reveal } from '../components/Reveal';
import { sponsorshipNoteEn } from '../content/sponsorshipContent';
import { aboutEn } from '../content/aboutContent';
import { contactPostalAddressLines, contactChannels, contactMapEmbedSrc, contactMapLinkUrl } from '../content/contactContent';
import { heroVerse1, heroVerse2, tripitakaCatalogueCaption, tripitakaSearchCaption, pdfBookCaption } from '../content/homeContent';
import './HomePage.css';

function phoneFor(label) {
  return contactChannels.find(([l]) => l === label)?.[1];
}

// Home page (build-spec §4) — almost entirely composition: every section
// below reuses the component/API built for its own dedicated page rather
// than re-implementing anything (newest-4 newsletters via the same
// entries API as /post/, the sponsorship calendar via the same
// booking-calendar component/endpoint as /sponsorship/, the same
// InquiryForm/NewsletterSignup as /contact-us/, the same About text as
// /about/).
export function HomePage() {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    listEntries('post', { page: 1, pageSize: 4 })
      .then((d) => setNewsletters(d.entries))
      .catch(() => setNewsletters([]));
  }, []);

  useEffect(() => {
    const { from, to } = getSponsorshipCalendarRange();
    getSponsorshipCalendar(from, to)
      .then((d) => setBookings(d.bookings))
      .catch(() => setBookings([]));
  }, []);

  return (
    <div className="home">
      {/* 4.1 Hero / salutation — [CONTENT — Sinhala, migrate verbatim] */}
      <Reveal as="section" className="home__hero">
        <div className="home__hero-image-wrap">
          <div className="home__hero-glow" aria-hidden="true" />
          <img src="/images/golden-buddha.jpg" alt="" className="home__hero-image" />
        </div>
        <div className="home__hero-text card">
          {heroVerse1.split('\n').map((line, i) => (
            <p key={`v1-${i}`}>{line}</p>
          ))}
          {heroVerse2.split('\n').map((line, i) => (
            <p key={`v2-${i}`}>{line}</p>
          ))}
        </div>
      </Reveal>

      {/* 4.2 Monastery intro — reuses aboutEn.paragraphs (same text as /about/) */}
      <Reveal as="section" className="home__intro">
        <img src="/images/Damma-Senasanaya-Logo.png" alt="Dhammahadaya Senasanaya" className="home__intro-logo" />
        <div className="home__intro-text">
          {aboutEn.paragraphs.slice(0, 3).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <Link to="/about/" className="btn btn--primary">
            About Us
          </Link>
        </div>
      </Reveal>

      {/* 4.3 Last Newsletters — newest 4 via the same /api/entries used by /post/ */}
      <Reveal as="section" className="home__section">
        <h2>Last Newsletters</h2>
        <div className="home__newsletter-cards">
          {newsletters.map((entry) => (
            <EntryCard key={entry.id} entry={entry} basePath="/post/" />
          ))}
          {newsletters.length === 0 ? <p>No newsletters yet.</p> : null}
        </div>

        {/* 4.4 Posts button */}
        <Link to="/post/" className="btn btn--primary">
          Posts
        </Link>

        {/* 4.5 Three horizontal buttons */}
        <div className="home__three-buttons">
          <Link to="/ape-budu-hamuduruwo-all/" className="btn btn--secondary">
            Ape Budu Hamuduruwo
          </Link>
          <Link to="/asu-maha-srawakayan-wahansela/" className="btn btn--secondary">
            Asu Maha Srawakayan Wahansela
          </Link>
          <Link to="/important-articles/" className="btn btn--secondary">
            Important Articles
          </Link>
        </div>
      </Reveal>

      {/* 4.6 Tripitaka section */}
      <Reveal as="section" className="home__section">
        <h2>Tripitaka</h2>
        <div className="home__image-row">
          <div className="home__image-item card card--interactive">
            <img src="/images/Thripitaka-Catalogue-Img.jpg" alt="" />
            <Link to="/tripitaka-catalogs/" className="btn btn--primary">
              Tripitaka Catalogue
            </Link>
            <p className="home__caption">{tripitakaCatalogueCaption}</p>
          </div>
          <div className="home__image-item card card--interactive">
            <img src="/images/Thripitaka-Search-Img.jpg" alt="" />
            <Link to="/tripitaka/" className="btn btn--primary">
              Tripitaka Search
            </Link>
            <p className="home__caption">{tripitakaSearchCaption}</p>
          </div>
          <div className="home__image-item card card--interactive">
            <img src="/images/Pdf-Book-Img.jpg" alt="" />
            <Link to="/pdf-books/" className="btn btn--primary">
              PDF Book
            </Link>
            <p className="home__caption">{pdfBookCaption}</p>
          </div>
        </div>
      </Reveal>

      {/* 4.7 Dhamma Sermons section */}
      <Reveal as="section" className="home__section">
        <h2>Dhamma Sermons</h2>
        <div className="home__image-row">
          <div className="home__image-item card card--interactive">
            <img src="/images/Dhamma-Sermons-Img.jpg" alt="" />
            <Link to="/dhamma-sermon/" className="btn btn--primary">
              Dhamma Sermons
            </Link>
          </div>
          <div className="home__image-item card card--interactive">
            <img src="/images/youtube-logo-icon.jpg" alt="" />
            <a
              href="https://www.youtube.com/channel/UCJCpaizlVHxNzWi3tvEmsaw"
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary"
            >
              YouTube
            </a>
          </div>
        </div>
      </Reveal>

      {/* 4.8 Sponsorships section — reuses the step-8 booking calendar + data */}
      <Reveal as="section" className="home__section">
        <h2>Sponsorships</h2>
        <div className="home__sponsorship-card card">
          <div className="home__sponsorship-calendar">
            <BookingCalendar bookings={bookings} selectedDate={null} onSelectDate={() => navigate('/sponsorship/')} />
          </div>
          <div className="home__sponsorship-message">
            {[sponsorshipNoteEn.paragraphs[0], sponsorshipNoteEn.paragraphs[1], sponsorshipNoteEn.paragraphs[3]].map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <Link to="/sponsorship/" className="btn btn--primary">
          Sponsorships
        </Link>
      </Reveal>

      {/* 4.9 Meritorious deeds & Our Programs */}
      <Reveal as="section" className="home__section">
        <h2>Meritorious Deeds &amp; Our Programs</h2>
        <div className="home__image-row">
          <div className="home__image-item card card--interactive">
            <img src="/images/Katina-Img.jpg" alt="" />
            <Link to="/kathina-ceremony/" className="btn btn--primary">
              Katina Ceremony
            </Link>
          </div>
          <div className="home__image-item card card--interactive">
            <img src="/images/Buddha-Puja-Img.jpg" alt="" />
            <Link to="/buddha-puja/" className="btn btn--primary">
              Buddha Puja
            </Link>
          </div>
          <div className="home__image-item card card--interactive">
            <img src="/images/Meditation-Img.jpg" alt="" />
            <Link to="/meditation-programs/" className="btn btn--primary">
              Meditation
            </Link>
          </div>
        </div>
      </Reveal>

      {/* 4.10 Contact Us section — reuses the step-10 InquiryForm as-is */}
      <Reveal as="section" className="home__section">
        <h2>Contact Us</h2>
        <iframe className="home__map" title="Dhammahadaya Senasanaya location" src={contactMapEmbedSrc} loading="lazy" />
        <a className="home__map-link" href={contactMapLinkUrl} target="_blank" rel="noreferrer">
          View on Google Maps
        </a>
        <InquiryForm />
      </Reveal>

      {/* 4.11 Newsletter signup — reuses the step-10 NewsletterSignup as-is */}
      <Reveal as="section" className="home__section">
        <NewsletterSignup />
      </Reveal>

      {/* 4.12 Social + contact links */}
      <Reveal as="section" className="home__section home__social">
        <a href="https://chat.whatsapp.com/By2DvSjmiaK23Wmw90Jj5D" target="_blank" rel="noreferrer">
          WhatsApp Group
        </a>
        <a href="https://api.whatsapp.com/send/?phone=702164642&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a href="https://www.youtube.com/channel/UCJCpaizlVHxNzWi3tvEmsaw" target="_blank" rel="noreferrer">
          YouTube
        </a>
        <a href="https://www.facebook.com/dhammahadaya.net/" target="_blank" rel="noreferrer">
          Facebook
        </a>
      </Reveal>

      {/* 4.13 Static contact block */}
      <Reveal as="section" className="home__section home__static-contact">
        <address>{contactPostalAddressLines.join(', ')}</address>
        <p>
          Office phone: {phoneFor('Phone 2')}, {phoneFor('Phone 1')}
        </p>
      </Reveal>
    </div>
  );
}
