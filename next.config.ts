import type { NextConfig } from "next";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

/** Fotos subidas al bucket "propiedades" de Supabase Storage. */
function supabaseStoragePattern(): RemotePattern {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    if (hostname) {
      return {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/propiedades/**",
      };
    }
  } catch {
    // Sin la variable cargada, se acepta cualquier proyecto de Supabase.
  }
  return {
    protocol: "https",
    hostname: "*.supabase.co",
    pathname: "/storage/v1/object/public/propiedades/**",
  };
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      supabaseStoragePattern(),
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
