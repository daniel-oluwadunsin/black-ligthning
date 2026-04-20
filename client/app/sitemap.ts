import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const current = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: current,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/add-song`,
      lastModified: current,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/identify`,
      lastModified: current,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
