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
    const previousTitle = document.title;
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
      document.title = previousTitle;
      setMetaContent('robots', PREVIOUS_DEFAULTS.robots);
    };
  }, [meta.title, meta.description, meta.robots, meta.canonical, meta.ogImage]);
}
