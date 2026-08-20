import { useEffect, useRef, useState } from 'react';

// Fires once when the element first enters the viewport — used to trigger
// the .reveal / .reveal--visible fade-in (see styles/base.css). Falls back
// to immediately visible if IntersectionObserver isn't available, so
// content is never stuck hidden.
export function useReveal(options) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
