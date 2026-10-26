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
//
// Auto-recovery on tab refocus (client-reported, 2026-10: "the live video
// not loading... when opening the webapp again after watching it once...
// have to refresh"). A backgrounded mobile tab can silently kill a live
// embed's underlying connection — React has no way to detect that the
// iframe's browsing context died, so without this the page just sits there
// showing a dead player forever, since nothing about our own state ever
// changed. reloadKey, bumped on every hidden→visible transition and folded
// into the iframe's key, forces React to tear down and recreate the iframe
// from scratch (a real reload, not just a re-render) exactly when a manual
// page refresh previously would have been the only fix. Refetching the
// live link at the same time also picks up anything an admin changed while
// the visitor's tab was in the background.
export function YouTubeLiveSection() {
  const { t } = useTranslation();
  const [live, setLive] = useState(null); // { url, videoId } | null | undefined (loading)
  const [muted, setMuted] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const wrapperRef = useRef(null);
  const iframeRef = useRef(null);
  const [revealRef, visible] = useReveal();

  function refetchLive() {
    getYoutubeLive()
      .then((d) => setLive(d.url ? d : null))
      .catch(() => setLive(null));
  }

  useEffect(() => {
    refetchLive();
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        setMuted(true);
        setReloadKey((k) => k + 1);
        refetchLive();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
      {/* Instructional hint (client request, 2026-10) — the overlay button
          below is the actual unmute control; this just makes sure a
          visitor understands *why* there's no sound before they even reach
          it, since autoplay has to start muted everywhere. Only shown while
          still muted, same as the button itself — once unmuted it's no
          longer relevant. */}
      {muted ? <p className="youtube-live__hint">{t('home.youtubeLiveUnmuteHint')}</p> : null}
      <div className="youtube-live__frame card">
        {visible ? (
          <iframe
            key={reloadKey}
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
