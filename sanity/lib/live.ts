import { client } from "./client";

export const sanityFetch = async ({ query, params, options }: any) => {
  const data = await client.fetch(query, params, options);
  return { data };
};

export const SanityLive = () => {
  return null;
};
