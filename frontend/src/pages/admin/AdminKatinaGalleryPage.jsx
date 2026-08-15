import { useParams } from 'react-router-dom';
import { AdminGalleryPage } from './AdminGalleryPage';

// Thin wrapper reading :year from the route so the reusable AdminGalleryPage
// (built prop-driven in step 7) can manage the Katina gallery for that year
// without any Katina-specific code of its own.
export function AdminKatinaGalleryPage() {
  const { year } = useParams();
  return <AdminGalleryPage gallery="katina" galleryKey={year} title={`Katina ${year} Photo Gallery`} />;
}
