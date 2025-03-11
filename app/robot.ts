import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://e-booth.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/generatebooth", "/photopreview"],
      disallow: [],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
