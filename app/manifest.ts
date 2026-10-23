import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Little Paper Bookshop Studio",
    short_name: "Little Paper",
    description: "Offline-ready local workspace for bookshop stationery and print designs.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f5",
    theme_color: "#315f54",
    icons: [{ src: "/bookshop-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
  };
}
