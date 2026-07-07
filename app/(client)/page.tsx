import HomeCategories from "@/components/HomeCategories";
import LatestBlog from "@/components/LatestBlog";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import ShopByBrands from "@/components/ShopByBrands";
import ShopFeatures from "@/components/ShopFeatures";
import BecomeVendorSection from "@/components/BecomeVendorSection";
import AvailableCoupons from "@/components/AvailableCoupons";
import ScrollToTop from "@/components/ScrollToTop";
import { getCategories, getAllProducts } from "@/sanity/queries";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, allProducts] = await Promise.all([
    getCategories(8),
    getAllProducts(),
  ]);
  const totalProductCount = allProducts?.length || 0;

  // Generate structured data
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <div>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <HomeBanner />
      <div>
        <ProductGrid />
        <AvailableCoupons />
        <BecomeVendorSection />
        <HomeCategories
          categories={categories}
          totalProducts={totalProductCount}
        />
        <ShopFeatures />
        <ShopByBrands />
        <LatestBlog />
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
