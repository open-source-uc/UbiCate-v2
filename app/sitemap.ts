import { MetadataRoute } from "next";

import PlacesJSON from "@/lib/places/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Homepage
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
    },
  ];

  // Agregar todos los lugares como query params en homepage
  if (PlacesJSON.features && Array.isArray(PlacesJSON.features)) {
    PlacesJSON.features.forEach((place) => {
      if (place.properties?.identifier) {
        sitemapEntries.push({
          url: `${baseUrl}/?place=${encodeURIComponent(place.properties.identifier)}`,
          lastModified: new Date(),
          priority: 0.8,
        });
      }
    });
  }

  return sitemapEntries;
}
