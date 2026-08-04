import { createServerFn } from "@tanstack/react-start";

export const fetchBazaar = createServerFn({ method: "GET" }).handler(async () => {
  const { getBazaar } = await import("./hypixel.server");
  return getBazaar();
});

export const fetchAuctions = createServerFn({ method: "GET" }).handler(async () => {
  const { getAuctions } = await import("./hypixel.server");
  const data = await getAuctions(6);
  // Trim payload: only the most interesting listings travel to the client.
  const entries = [...data.entries]
    .sort((a, b) => b.profit - a.profit || b.price - a.price)
    .slice(0, 240);
  return { ...data, entries };
});

export const fetchItems = createServerFn({ method: "GET" }).handler(async () => {
  const { getItems } = await import("./hypixel.server");
  return getItems();
});

export const fetchPlayer = createServerFn({ method: "POST" })
  .inputValidator((input: { apiKey: string; username: string; profileId?: string }) => {
    if (!input?.apiKey?.trim()) throw new Error("A Hypixel API key is required");
    if (!input?.username?.trim()) throw new Error("A Minecraft username is required");
    return {
      apiKey: input.apiKey.trim(),
      username: input.username.trim(),
      profileId: input.profileId?.trim() || undefined,
    };
  })
  .handler(async ({ data }) => {
    const { getPlayerData } = await import("./hypixel.server");
    return getPlayerData(data.apiKey, data.username, data.profileId);
  });
