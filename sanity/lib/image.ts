import { createImageUrlBuilder } from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "../env";

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => {
  try {
    if (!source) {
      throw new Error("No source provided to urlFor");
    }
    
    // Check if source is already a direct HTTP/S string
    if (typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))) {
      const mockBuilder = {
        url: () => source,
        width: () => mockBuilder,
        height: () => mockBuilder,
        fit: () => mockBuilder,
        blur: () => mockBuilder,
        quality: () => mockBuilder,
        auto: () => mockBuilder,
      };
      return mockBuilder as any;
    }

    // Intercept malformed asset references (like custom Unsplash assets) to avoid builder crashes
    const assetRef = (source as any)?.asset?._ref || (source as any)?._ref || "";
    if (assetRef && !assetRef.startsWith("image-")) {
      let resolvedUrl = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&h=500&fit=crop";
      if (assetRef.includes("photo-")) {
        // Extract Unsplash image name/id
        const cleanRef = assetRef.replace("image-", "");
        resolvedUrl = `https://images.unsplash.com/${cleanRef}`;
      }
      
      const mockBuilder = {
        url: () => resolvedUrl,
        width: () => mockBuilder,
        height: () => mockBuilder,
        fit: () => mockBuilder,
        blur: () => mockBuilder,
        quality: () => mockBuilder,
        auto: () => mockBuilder,
      };
      return mockBuilder as any;
    }

    return builder.image(source);
  } catch (error) {
    console.error("Safe urlFor builder caught error: ", error);
    // Return fallback URL builder to prevent page breaks
    const fallbackUrl = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&h=500&fit=crop";
    const mockBuilder = {
      url: () => fallbackUrl,
      width: () => mockBuilder,
      height: () => mockBuilder,
      fit: () => mockBuilder,
      blur: () => mockBuilder,
      quality: () => mockBuilder,
      auto: () => mockBuilder,
      rect: () => mockBuilder,
    };
    return mockBuilder as any;
  }
};
