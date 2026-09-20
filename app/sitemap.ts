import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.aurabienesraices.com.ar";

  return [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/legal/privacidad`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/legal/terminos`, lastModified: new Date(), priority: 0.3 },
  ];
}
