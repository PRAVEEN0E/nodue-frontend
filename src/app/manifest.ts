import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vcet No Due Clearance Portal",
    short_name: "VCET NoDue",
    description: "Vcet No Due Clearance Portal — One Portal. Zero Pending. Automated student clearance workflows and digital sign-offs.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
