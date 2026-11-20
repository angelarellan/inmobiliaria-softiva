import type { MetadataRoute } from "next";
import { getVisibleProperties } from "@/lib/data/properties";
import { absoluteUrl, propertyPath } from "@/lib/site";

// Se arma en cada pedido (con las propiedades en caché), así incluye las
// propiedades nuevas apenas se cargan.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = (await getVisibleProperties()).filter(
    (p) => p.status === "publicada"
  );

  return [
    { url: absoluteUrl("/"), lastModified: new Date(), priority: 1 },
    ...properties.map((p) => {
      const updated = new Date(p.updatedAt);
      return {
        url: absoluteUrl(propertyPath(p.slug)),
        lastModified: Number.isNaN(updated.getTime()) ? undefined : updated,
        priority: 0.8,
      };
    }),
    { url: absoluteUrl("/legal/privacidad"), priority: 0.3 },
    { url: absoluteUrl("/legal/terminos"), priority: 0.3 },
  ];
}
