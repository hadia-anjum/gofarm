"use server";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export async function serverSanityFetch(query: string, params?: any, options?: any) {
  try {
    // If it's a mutation query, return empty mock
    if (query.includes("create") || query.includes("patch") || query.includes("delete")) {
      return { ms: 0, query, result: {} };
    }
    const result = await serverClient.fetch(query, params, options);
    return result;
  } catch (error) {
    console.error("serverSanityFetch caught error during server-side fetch:", error);
    // Return empty fallback array or object to prevent client-side crashes
    if (query.trim().startsWith("*") && !query.includes("[0]")) {
      return [];
    }
    return null;
  }
}
