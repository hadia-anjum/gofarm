import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

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

// A wrapper handler to intercept write operations on the client
const clientWrapper = (targetClient: any) => {
  return new Proxy(targetClient, {
    get(target, prop, receiver) {
      if (prop === "fetch") {
        // Safe wrap fetch to ensure it doesn't crash on network or parameter issues
        return async (query: string, params: any = {}, options: any = {}) => {
          try {
            return await target.fetch(query, params, options);
          } catch (error) {
            console.error("Sanity fetch error: ", error);
            // Return empty arrays/objects to prevent rendering crashes
            if (query.includes("count(")) return 0;
            if (query.includes("[]") || query.includes("blogs")) return [];
            return null;
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
