import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";
import { serverSanityFetch } from "./actions";

// Real client for fetching data (uses CDN for better performance)
const realClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl:
      process.env.NODE_ENV === "production"
        ? `https://${process.env.VERCEL_URL}/studio`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/studio`,
  },
});

// Ensure result is always an array when query expects one
function ensureSafeResult(result: any, query: string) {
  // If result is already a valid value, return it
  if (result !== null && result !== undefined) {
    return result;
  }
  // If query looks like it returns a list (contains *[ or [] patterns), return empty array
  if (query.includes("*[") || query.includes("[]")) {
    return [];
  }
  // For count queries return 0
  if (query.includes("count(")) {
    return 0;
  }
  // Default fallback — return empty array (safest for .map() calls)
  return [];
}

// A wrapper handler to intercept write operations on the client
const clientWrapper = (targetClient: any) => {
  return new Proxy(targetClient, {
    get(target, prop, receiver) {
      if (prop === "fetch") {
        // Safe wrap fetch to ensure it doesn't crash on network or parameter issues
        return async (query: string, params: any = {}, options: any = {}) => {
          try {
            let result;
            // If running in browser, proxy through serverless function to bypass CORS policies
            if (typeof window !== "undefined") {
              // Only forward query and params (options might contain non-serializable objects)
              result = await serverSanityFetch(query, params);
            } else {
              result = await target.fetch(query, params, options);
            }
            return ensureSafeResult(result, query);
          } catch (error) {
            console.error("Sanity fetch error: ", error);
            return ensureSafeResult(null, query);
          }
        };
      }
      
      // Mock write/mutation methods
      if (["create", "createIfNotExists", "createOrReplace", "patch", "delete", "mutate", "commit"].includes(prop as string)) {
        return () => {
          console.log(`Mocking Sanity write: ${prop as string}`);
          // Return a chainable object for patch/commit
          const chain = {
            set: () => chain,
            setIfMissing: () => chain,
            unset: () => chain,
            inc: () => chain,
            dec: () => chain,
            insert: () => chain,
            append: () => chain,
            prepend: () => chain,
            commit: async () => ({ _id: "mock-id", _type: "mutation" }),
          };
          return chain;
        };
      }

      return Reflect.get(target, prop, receiver);
    }
  });
};

export const client = clientWrapper(realClient);
export const writeClient = clientWrapper(realClient);
