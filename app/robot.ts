import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://e-booth.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [], // Ensure nothing is blocked
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
