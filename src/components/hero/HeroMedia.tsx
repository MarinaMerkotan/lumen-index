import { useEffect, useRef, useState } from 'react';
import { useMotion } from '../ambient/MotionContext';

/**
 * Third-party hosted asset of unconfirmed licence (see docs/SECURITY.md). Not copied into the repo.
 * Replace with an owned/licensed source before public launch.
 */
export const HERO_VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260813_115057_94c3699b-0fd1-4124-bcf3-3626bb8c1f77.mp4';

const LOAD_TIMEOUT_MS = 15000;

type MediaStatus = 'loading' | 'ready' | 'failed';

/** Static luminous composition shown when the video cannot load. Echoes the floating forms without imitating them. */
function MediaFallback() {
  return (
    <div className="absolute inset-0 anim-fade-in" aria-hidden="true">
      <div className="hero-fallback-form" style={{ top: '14%', left: '50%', width: '22vmax', height: '16vmax' }} />
      <div className="hero-fallback-form" style={{ top: '40%', left: '34%', width: '18vmax', height: '13vmax', opacity: 0.7 }} />
      <div className="hero-fallback-form" style={{ top: '52%', left: '58%', width: '14vmax', height: '10vmax', opacity: 0.55 }} />
    </div>
  );
}

export function HeroMedia() {
  const { motionEnabled } = useMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<MediaStatus>('loading');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || status === 'failed') return;
    if (motionEnabled) {
      // Muted inline autoplay can still be refused (e.g. power saving); the paused first frame is an acceptable result.
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [motionEnabled, status]);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus((current) => (current === 'loading' ? 'failed' : current)), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <div className="absolute inset-0" aria-hidden="true" data-media-status={status}>
      {status === 'failed' && <MediaFallback />}
      {status !== 'failed' && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover anim-fade-in"
          src={HERO_VIDEO_SRC}
          autoPlay={motionEnabled}
          muted
          loop
          playsInline
          preload={motionEnabled ? 'auto' : 'metadata'}
          disablePictureInPicture
          tabIndex={-1}
          onLoadedData={() => setStatus('ready')}
          onError={() => setStatus('failed')}
        />
      )}
      {/* Light scrims keep overlay copy legible where the video passes behind text. */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/40 to-transparent pointer-events-none md:hidden" />
    </div>
  );
}
