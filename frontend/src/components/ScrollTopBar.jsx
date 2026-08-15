import { useEffect, useState } from 'react';
import './ScrollTopBar.css';

// build-spec §2.1 — global layout, appears on every page once the user
// starts scrolling. Mounted once at the app root (outside <Routes>) rather
// than per-page.
export function ScrollTopBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 0);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`scroll-top-bar${visible ? ' scroll-top-bar--visible' : ''}`}>
      <a href="tel:+94702164642">+94 70 216 4642</a>
      <a href="mailto:dhammahadayasenasanaya@gmail.com">dhammahadayasenasanaya@gmail.com</a>
    </div>
  );
}
