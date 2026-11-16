import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gamma Alert",
    short_name: "Gamma Alert",
    description: "Disaster alerts near you and how the Earth's surface changed. Not an official alert.",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#171A23",
    theme_color: "#171A23",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
