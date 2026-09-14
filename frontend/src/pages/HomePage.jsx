import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, MessageCircle, PlaySquare, ThumbsUp, MapPin, Phone } from 'lucide-react';
import { listEntries } from '../api/entries';
import { EntryCard } from '../components/EntryCard';
import { getSponsorshipCalendar } from '../api/sponsorship';
import { BookingCalendar, getMonthRange } from '../components/BookingCalendar';
import { LoadingState } from '../components/LoadingState';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { Reveal } from '../components/Reveal';
import { sponsorshipNoteEn } from '../content/sponsorshipContent';
import { aboutEn } from '../content/aboutContent';
import { contactPostalAddressLines, contactChannels } from '../content/contactContent';
import {
  heroConstantLine,
  heroClosingLine,
  heroRandomLines,
  tripitakaCatalogueCaption,
  tripitakaSearchCaption,
  pdfBookCaption,
} from '../content/homeContent';
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
  // Picked once per page load/visit (client request, 2026-09) — a fresh
  // random line every time a user lands on or refreshes the Home page,
  // not re-rolled on every re-render while they stay on it.
  const [heroRandomLine] = useState(() => heroRandomLines[Math.floor(Math.random() * heroRandomLines.length)]);
  const [newsletters, setNewsletters] = useState([]);
  const [newslettersLoading, setNewslettersLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  // See SponsorshipPage.jsx — bookings default to "all available" until
  // real data arrives, so the preview calendar below must not render until
  // this resolves either.
  const [calendarLoading, setCalendarLoading] = useState(true);

  useEffect(() => {
    listEntries('post', { page: 1, pageSize: 4 })
      .then((d) => setNewsletters(d.entries))
      .catch(() => setNewsletters([]))
      .finally(() => setNewslettersLoading(false));
  }, []);

  function handleCalendarMonthChange(year, month) {
    setCalendarLoading(true);
    const { from, to } = getMonthRange(year, month);
    getSponsorshipCalendar(from, to)
      .then((d) => setBookings(d.bookings))
      .catch(() => setBookings([]))
      .finally(() => setCalendarLoading(false));
  }

  return (
    <div className="home">
      {/* 4.1 Hero / salutation — [CONTENT — Sinhala, migrate verbatim] */}
      <Reveal as="section" className="home__hero">
        <div className="home__hero-image-wrap">
          <div className="home__hero-glow" aria-hidden="true" />
          <img src="/images/golden-buddha.jpg" alt="" className="home__hero-image" />
        </div>
        <div className="home__hero-text card">
          <p>{heroConstantLine}</p>
          {heroRandomLine.split('\n').map((line, i) => (
            <p key={`random-${i}`}>{line}</p>
          ))}
          {heroClosingLine.split('\n').map((line, i) => (
            <p key={`closing-${i}`}>{line}</p>
          ))}
        </div>
      </Reveal>

      {/* 4.2 Monastery intro — reuses aboutEn.paragraphs (same text as /about/).
          Only the 1st and 3rd paragraphs are shown here (client request,
          2026-09: drop the 2nd from this home-page excerpt) — the full text
          is unaffected and still shows in full on /about/. */}
      <Reveal as="section" className="home__intro">
        <img src="/images/Damma-Senasanaya-Logo.png" alt="Dhammahadaya Senasanaya" className="home__intro-logo" />
        <div className="home__intro-text">
          {[aboutEn.paragraphs[0], aboutEn.paragraphs[2]].map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <Link to="/about/" className="btn btn--primary">
            About Us
          </Link>
        </div>
      </Reveal>

      {/* 4.3 Latest Newsletters — newest 4 via the same /api/entries used by
          /post/. The three sub-category boxes that used to sit under the
          Posts button moved to the Newsletters page itself (/post/), since
          that's also where their nav dropdown entries moved to. */}
      <Reveal as="section" className="home__section">
        <h2>Latest Newsletters</h2>
        {newslettersLoading ? (
          <LoadingState message="Loading newsletters…" />
        ) : (
          <div className="home__newsletter-cards">
            {newsletters.map((entry) => (
              <EntryCard key={entry.id} entry={entry} basePath="/post/" catalogue />
            ))}
            {newsletters.length === 0 ? <p>No newsletters yet.</p> : null}
          </div>
        )}

        <Link to="/post/" className="btn btn--primary">
          More Newsletters
        </Link>
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
              PDF Books
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
            <BookingCalendar
              bookings={bookings}
              loading={calendarLoading}
              selectedDate={null}
              onSelectDate={() => navigate('/sponsorship/')}
              onMonthChange={handleCalendarMonthChange}
            />
          </div>
          <div className="home__sponsorship-message">
            {[sponsorshipNoteEn.paragraphs[0], sponsorshipNoteEn.paragraphs[1], sponsorshipNoteEn.paragraphs[3]].map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <Link to="/sponsorship/" className="btn btn--primary">
          More Sponsorships
        </Link>
      </Reveal>

      {/* 4.9 Meritorious deeds & Our Programs */}
      <Reveal as="section" className="home__section">
        <h2>Meritorious Deeds &amp; Our Programs</h2>
        <div className="home__image-row">
          <div className="home__image-item card card--interactive">
            <img src="/images/Katina-Img.jpg" alt="" />
            <Link to="/katina-ceremony/" className="btn btn--primary">
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

      {/* 4.11 Newsletter signup — reuses the step-10 NewsletterSignup as-is */}
      <Reveal as="section" className="home__section">
        <div className="home__connect-group card">
          <NewsletterSignup />
        </div>
      </Reveal>

      {/* 4.12 Social + contact links */}
      <Reveal as="section" className="home__section">
        <div className="home__social card">
          <a
            className="home__social-link"
            href="https://chat.whatsapp.com/By2DvSjmiaK23Wmw90Jj5D"
            target="_blank"
            rel="noreferrer"
          >
            <Users size={20} aria-hidden="true" />
            <span>WhatsApp Group</span>
          </a>
          <a
            className="home__social-link"
            href="https://api.whatsapp.com/send/?phone=702164642&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={20} aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
          <a
            className="home__social-link"
            href="https://www.youtube.com/channel/UCJCpaizlVHxNzWi3tvEmsaw"
            target="_blank"
            rel="noreferrer"
          >
            <PlaySquare size={20} aria-hidden="true" />
            <span>YouTube</span>
          </a>
          <a className="home__social-link" href="https://www.facebook.com/dhammahadaya.net/" target="_blank" rel="noreferrer">
            <ThumbsUp size={20} aria-hidden="true" />
            <span>Facebook</span>
          </a>
        </div>
      </Reveal>

      {/* 4.13 Static contact block */}
      <Reveal as="section" className="home__section">
        <div className="home__static-contact card">
          <div className="home__static-contact-row">
            <MapPin size={18} aria-hidden="true" />
            <address>{contactPostalAddressLines.join(', ')}</address>
          </div>
          <div className="home__static-contact-row">
            <Phone size={18} aria-hidden="true" />
            <p>
              Office phone: {phoneFor('Phone 2')}, {phoneFor('Phone 1')}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
