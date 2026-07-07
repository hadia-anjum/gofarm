import { createImageUrlBuilder } from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

// A chainable helper proxy that handles any method call and returns itself,
// except for .url() which returns the target string URL.
const createMockBuilder = (imageUrl: string) => {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'url') {
        return () => imageUrl;
      }
      return () => proxy;
    }
  };
  const proxy = new Proxy({}, handler);
  return proxy;
};

export const urlFor = (source: SanityImageSource) => {
  try {
    if (!source) {
      throw new Error("No source provided to urlFor");
    }
    
    // Check if source is already a direct HTTP/S string
    if (typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))) {
      return createMockBuilder(source) as any;
    }

    // Intercept malformed asset references (like custom Unsplash assets) to avoid builder crashes
    const assetRef = (source as any)?.asset?._ref || (source as any)?._ref || "";
    if (assetRef && !assetRef.startsWith("image-")) {
      let resolvedUrl = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&h=500&fit=crop";
      if (assetRef.includes("photo-")) {
        const cleanRef = assetRef.replace("image-", "");
        resolvedUrl = `https://images.unsplash.com/${cleanRef}`;
      }
      return createMockBuilder(resolvedUrl) as any;
    }

    return builder.image(source);
  } catch (error) {
    console.error("Safe urlFor builder caught error: ", error);
    const fallbackUrl = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&h=500&fit=crop";
    return createMockBuilder(fallbackUrl) as any;
  }
};
