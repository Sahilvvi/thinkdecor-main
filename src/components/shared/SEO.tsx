import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  schema?: object | object[];
}

export function SEO({ title, description, canonical, schema }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && canonical) ogUrl.setAttribute('content', canonical);

    // Canonical link
    const canonicalId = 'seo-canonical';
    let canonicalEl = document.getElementById(canonicalId) as HTMLLinkElement | null;
    if (canonical) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.id = canonicalId;
        canonicalEl.rel = 'canonical';
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.href = canonical;
    }

    // JSON-LD schema
    const schemaId = 'seo-schema-ld';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();

    if (schema) {
      const script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(
        Array.isArray(schema)
          ? { '@context': 'https://schema.org', '@graph': schema }
          : schema
      );
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById(schemaId);
      if (s) s.remove();
    };
  }, [title, description, canonical, schema]);

  return null;
}
