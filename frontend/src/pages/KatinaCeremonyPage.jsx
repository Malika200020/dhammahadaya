import { useEffect, useState } from 'react';
import { listKatinaYears } from '../api/katina';
import { getGallery } from '../api/galleries';
import { PhotoGallery } from '../components/PhotoGallery';
import './KatinaCeremonyPage.css';

function YearSection({ year, organizers }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    getGallery('katina', year)
      .then((d) => setImages(d.images))
      .catch(() => setImages([]));
  }, [year]);

  return (
    <section className="katina__year card">
      <h2>{year}</h2>
      <h3 className="katina__organizers-heading">Organizers</h3>
      {organizers.length > 0 ? (
        <ul className="katina__organizers">
          {organizers.map((name, i) => (
            <li key={i}>{name}</li>
          ))}
        </ul>
      ) : (
        <p className="katina__no-organizers">Organizers to be announced.</p>
      )}
      <PhotoGallery images={images} />
    </section>
  );
}

// build-spec §11 — organizers + a photo gallery per Katina ceremony year.
// The gallery reuses gallery_images from step 7, scoped via
// gallery_key=<year>, exactly what that per-year scoping was built for.
export function KatinaCeremonyPage() {
  const [years, setYears] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    listKatinaYears()
      .then((d) => setYears(d.years))
      .catch(setError);
  }, []);

  return (
    <div className="katina">
      <h1>Katina Ceremony</h1>
      {error ? <p className="katina__error">{error.message}</p> : null}
      {years.length === 0 ? <p className="katina__empty">No Katina years published yet.</p> : null}
      {years.map((y) => (
        <YearSection key={y.year} year={y.year} organizers={y.organizers} />
      ))}
    </div>
  );
}
