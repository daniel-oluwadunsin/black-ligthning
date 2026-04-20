import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Black Lightning",
    short_name: "BlackLightning",
    description:
      "Premium electric music recognition app for adding songs and identifying tracks.",
    start_url: "/",
    display: "standalone",
    background_color: "#060708",
    theme_color: "#f6e71d",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
