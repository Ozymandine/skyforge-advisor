import { createFileRoute } from "@tanstack/react-router";
import { BazaarBoard } from "@/components/bazaar-board";

export const Route = createFileRoute("/bazaar")({
  head: () => ({
    meta: [
      { title: "Bazaar — SkyForge" },
      {
        name: "description",
        content: "Live Bazaar liquidity, margin and order-flip analysis from Hypixel.",
      },
      { property: "og:title", content: "Bazaar — SkyForge" },
      {
        property: "og:description",
        content: "Live market pricing, order tracking and high-margin flip opportunities.",
      },
      { property: "og:url", content: "https://skyforge-advisor.vercel.app/bazaar" },
      {
        property: "og:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
      {
        name: "twitter:title",
        content: "Bazaar — SkyForge",
      },
      {
        name: "twitter:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://skyforge-advisor.vercel.app/bazaar" }],
  }),
  component: Bazaar,
});

function Bazaar() {
  return <BazaarBoard />;
}
