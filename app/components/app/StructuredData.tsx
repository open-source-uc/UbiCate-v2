export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Ubicate UC",
    "description": "Mapa interactivo para encontrar salas, baños, bibliotecas y casinos en los campus de la Pontificia Universidad Católica. Navega fácil y rápido.",
    "url": "https://ubicate.uc.cl/",
    "logo": "https://ubicate.uc.cl/icons/icon-192x192.png",
    "image": "https://ubicate.uc.cl/icons/icon-192x192.png",
    "sameAs": [
      "https://github.com/open-source-uc/UbiCate-v2"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CL",
      "addressLocality": "Santiago",
      "addressRegion": "Región Metropolitana"
    },
    "areaServed": [
      {
        "@type": "Place",
        "name": "Campus San Joaquín"
      },
      {
        "@type": "Place",
        "name": "Campus Casa Central"
      },
      {
        "@type": "Place",
        "name": "Campus Lo Contador"
      },
      {
        "@type": "Place",
        "name": "Campus Oriente"
      },
      {
        "@type": "Place",
        "name": "Campus Villarrica"
      }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephoneNumber": "+56 2 2354 1500",
      "contactType": "Customer Service"
    },
    "organization": {
      "@type": "Organization",
      "name": "Open Source UC",
      "url": "https://opensourceuc.org"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
