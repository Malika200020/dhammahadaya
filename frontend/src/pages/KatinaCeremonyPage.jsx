import { useEffect, useState } from 'react';
import { listKatinaYears } from '../api/katina';
import { getGallery } from '../api/galleries';
import { PhotoGallery } from '../components/PhotoGallery';
import { LoadingState } from '../components/LoadingState';
import './KatinaCeremonyPage.css';

function YearSection({ year, organizers }) {
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    getGallery('katina', year)
      .then((d) => setImages(d.images))
      .catch(() => setImages([]))
      .finally(() => setImagesLoading(false));
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
      <PhotoGallery images={images} loading={imagesLoading} />
    </section>
  );
}

// build-spec §11 — organizers + a photo gallery per Katina ceremony year.
// The gallery reuses gallery_images from step 7, scoped via
// gallery_key=<year>, exactly what that per-year scoping was built for.
export function KatinaCeremonyPage() {
  const [years, setYears] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listKatinaYears()
      .then((d) => setYears(d.years))
      .catch(setError)
      .finally(() => setYearsLoading(false));
  }, []);

  return (
    <div className="katina">
      <h1>Katina Ceremony</h1>
      {error ? <p className="katina__error">{error.message}</p> : null}
      {yearsLoading ? <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." /> : null}
      {!yearsLoading && years.length === 0 ? <p className="katina__empty">No Katina years published yet.</p> : null}
      {years.map((y) => (
        <YearSection key={y.year} year={y.year} organizers={y.organizers} />
      ))}
    </div>
  );
}
