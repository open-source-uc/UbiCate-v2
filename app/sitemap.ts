import { MetadataRoute } from "next";

import { getAllPlaces } from "@/lib/db/places";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const { approved } = await getAllPlaces();

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
    },
  ];

  for (const place of approved) {
    if (place.properties?.identifier) {
      sitemapEntries.push({
        url: `${baseUrl}/?place=${encodeURIComponent(place.properties.identifier)}`,
        lastModified: new Date(),
        priority: 0.8,
      });
    }
  }

  return sitemapEntries;
}
