import { client } from "./client";

export const sanityFetch = async ({ query, params, options }: any) => {
  try {
    const data = await client.fetch(query, params || {}, options || {});
    // Always ensure data wrapped for consumers expecting { data }
    return { data: data ?? [] };
  } catch (error) {
    console.error("sanityFetch error:", error);
    return { data: [] };
  }
};

export const SanityLive = () => {
  return null;
};
