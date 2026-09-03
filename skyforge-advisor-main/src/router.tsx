import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Window-focus refetch OFF globally: multi-tab focus storms were
        // multiplying shared-pool Hypixel load. Interval polling per page
        // (60–180s) is the refresh mechanism. No auto-retry on Hypixel
        // failures — pages render stale/error states instead of hammering.
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: false,
        staleTime: 60_000,
        gcTime: 10 * 60_000,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
