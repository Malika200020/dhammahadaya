import { useEffect, useRef } from 'react';

export const RECAPTCHA_ENABLED = import.meta.env.VITE_RECAPTCHA_ENABLED === 'true';
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// "I'm not a robot" reCAPTCHA (build-spec §13), gated by
// VITE_RECAPTCHA_ENABLED — off by default so local dev/testing isn't
// blocked on a live Google key. Disabled, this renders nothing and the
// form submits without a token; the backend's RECAPTCHA_ENABLED mirrors
// this toggle and skips verification the same way.
export function Recaptcha({ onChange }) {
  const containerRef = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!RECAPTCHA_ENABLED) return;

    function render() {
      if (widgetId.current !== null || !window.grecaptcha || !containerRef.current) return;
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: onChange,
        'expired-callback': () => onChange(null),
      });
    }

    if (window.grecaptcha && window.grecaptcha.render) {
      render();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.body.appendChild(script);
  }, [onChange]);

  if (!RECAPTCHA_ENABLED) return null;
  return <div ref={containerRef} />;
}
