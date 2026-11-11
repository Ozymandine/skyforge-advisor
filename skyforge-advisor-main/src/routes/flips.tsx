import { createFileRoute, Link } from "@tanstack/react-router";
import { BazaarBoard } from "@/components/bazaar-board";

export const Route = createFileRoute("/flips")({
  head: () => ({ meta: [{ title: "Bazaar spreads — SkyForge" }] }),
  component: Flips,
});

function Flips() {
  return (
    <>
      <BazaarBoard spreadMode />
      <p className="mx-auto mt-4 max-w-7xl text-sm text-muted-foreground">
        Auction profit estimates are unavailable until comparable listings can be verified.{" "}
        <Link to="/auction-house" className="text-primary hover:underline">
          Browse auction listings
        </Link>
      </p>
    </>
  );
}
