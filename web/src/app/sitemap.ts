import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://flowrail.vercel.app/" },
    { url: "https://flowrail.vercel.app/app" },
  ];
}
