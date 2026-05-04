// apps/web/src/routes/Invest/meta.ts
import { useEffect } from 'react';

interface RouteMeta {
  title: string;
  description: string;
  robots: 'index, follow' | 'noindex, nofollow';
  canonical?: string;
  ogImage?: string;
}

const PREVIOUS_DEFAULTS = {
  title: 'Lucia',
  description: '',
  robots: 'noindex, nofollow' as const,
};

function setMetaContent(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOgContent(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useRouteMeta(meta: RouteMeta) {
  useEffect(() => {
    // Capture previous values so we can restore on unmount (SPA nav back to a non-Invest route).
    const prevTitle = document.title;
    const prevDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.getAttribute('content') ?? '';
    const prevRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.getAttribute('content') ?? PREVIOUS_DEFAULTS.robots;
    const prevOgTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.getAttribute('content') ?? '';
    const prevOgDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.getAttribute('content') ?? '';
    const prevOgUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.getAttribute('content') ?? '';
    const prevOgType = document.querySelector<HTMLMetaElement>('meta[property="og:type"]')?.getAttribute('content') ?? '';
    const prevOgImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.getAttribute('content') ?? '';
    const prevCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.getAttribute('href') ?? '';

    document.title = meta.title;
    setMetaContent('description', meta.description);
    setMetaContent('robots', meta.robots);
    setOgContent('og:title', meta.title);
    setOgContent('og:description', meta.description);
    setOgContent('og:type', 'website');
    setOgContent('og:url', window.location.origin + window.location.pathname);
    if (meta.ogImage) setOgContent('og:image', window.location.origin + meta.ogImage);
    if (meta.canonical) setCanonical(window.location.origin + meta.canonical);

    return () => {
      document.title = prevTitle;
      setMetaContent('description', prevDescription);
      setMetaContent('robots', prevRobots);
      setOgContent('og:title', prevOgTitle);
      setOgContent('og:description', prevOgDescription);
      setOgContent('og:url', prevOgUrl);
      setOgContent('og:type', prevOgType);
      setOgContent('og:image', prevOgImage);
      setCanonical(prevCanonical);
    };
  }, [meta.title, meta.description, meta.robots, meta.canonical, meta.ogImage]);
}
