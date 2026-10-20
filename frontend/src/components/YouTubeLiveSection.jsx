import { useEffect, useRef, useState } from 'react';
import { Maximize, Volume2, VolumeX } from 'lucide-react';
import { getYoutubeLive } from '../api/youtubeLive';
import { useReveal } from '../hooks/useReveal';
import { useTranslation } from '../i18n/LanguageContext';
import './YouTubeLiveSection.css';

// Home page YouTube Live section (client request, 2026-10) — entirely
// absent when no admin has set a live link (see AdminYouTubeLivePage.jsx /
// GET /api/youtube-live), not an empty placeholder. Reuses useReveal (the
// same hook behind every other Reveal-wrapped section on this page) for
// double duty: the usual fade-in, and — more importantly — gating when the
// iframe itself gets mounted at all, so the live embed doesn't load until
// the visitor actually scrolls to it.
//
// Controls: kept YouTube's own control bar (mute toggle + fullscreen button
// are both already there and reliable) rather than hiding it behind a
// fully custom chrome. The one addition is a clear "Tap to unmute" overlay,
// since autoplay has to start muted (browsers block audible autoplay
// outright) and people often miss YouTube's own small mute icon the first
// time. The fullscreen button here is a second, custom one — on the
// section's wrapper rather than the iframe — since fullscreening the
// wrapper keeps our own overlay/controls visible too, not just raw video.
export function YouTubeLiveSection() {
  const { t } = useTranslation();
  const [live, setLive] = useState(null); // { url, videoId } | null | undefined (loading)
  const [muted, setMuted] = useState(true);
  const wrapperRef = useRef(null);
  const iframeRef = useRef(null);
  const [revealRef, visible] = useReveal();

  useEffect(() => {
    getYoutubeLive()
      .then((d) => setLive(d.url ? d : null))
      .catch(() => setLive(null));
  }, []);

  function setRefs(node) {
    wrapperRef.current = node;
    revealRef.current = node;
  }

  function handleUnmute() {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      win.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
      win.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
    }
    setMuted(false);
  }

  function handleFullscreen() {
    const el = wrapperRef.current;
    if (!el) return;
    const request = el.requestFullscreen || el.webkitRequestFullscreen;
    if (request) request.call(el);
  }

  if (!live) return null;

  return (
    <section ref={setRefs} className={`youtube-live reveal${visible ? ' reveal--visible' : ''}`}>
      <h2>{t('home.youtubeLiveHeading')}</h2>
      <div className="youtube-live__frame card">
        {visible ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${live.videoId}?autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1`}
            title={t('home.youtubeLiveHeading')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : null}

        {visible && muted ? (
          <button type="button" className="youtube-live__unmute" onClick={handleUnmute}>
            <VolumeX size={18} aria-hidden="true" />
            {t('home.youtubeLiveUnmute')}
          </button>
        ) : null}

        {visible ? (
          <button
            type="button"
            className="youtube-live__fullscreen"
            onClick={handleFullscreen}
            aria-label={t('home.youtubeLiveFullscreen')}
          >
            <Maximize size={18} aria-hidden="true" />
          </button>
        ) : null}

        {!muted ? (
          <span className="youtube-live__unmuted-badge" aria-hidden="true">
            <Volume2 size={14} />
          </span>
        ) : null}
      </div>
    </section>
  );
}
