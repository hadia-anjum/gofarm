import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  BarChart3,
  Package,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Container from "@/components/Container";
import Link from "next/link";

export default function VendorInfoPage() {
  const facilities = [
    {
      icon: Store,
      title: "Your Own Storefront",
      description:
        "Create and customize your digital store with your branding and products",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Sales Analytics",
      description:
        "Track your sales, revenue, and performance with detailed analytics",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Users,
      title: "Customer Reach",
      description: "Access thousands of active customers across the platform",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: DollarSign,
      title: "Competitive Rates",
      description: "Enjoy industry-leading commission rates and fast payouts",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Reliable payment processing with fraud protection and dispute resolution",
      color: "from-red-500 to-red-600",
    },
    {
      icon: BarChart3,
      title: "Dashboard & Reports",
      description:
        "Comprehensive vendor dashboard with real-time insights and reports",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Easy-to-use tools for managing your products, stock, and fulfillment",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description:
        "Dedicated vendor support team to help you succeed every step of the way",
      color: "from-teal-500 to-teal-600",
    },
  ];

  const benefits = [
    "No setup fees or monthly charges",
    "Low commission rates on sales",
    "Fast and reliable payment processing",
    "Access to marketing tools and promotions",
    "Detailed sales and performance analytics",
    "Easy product listing and management",
    "Mobile-friendly vendor dashboard",
    "Opportunity to reach new customers nationwide",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-green-600 to-emerald-600 text-white py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Become a GoFarm Vendor
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-50">
              Join our growing marketplace and start selling your products to
              thousands of customers
            </p>
            <Link href="/vendor-registration">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 font-semibold px-8 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Apply Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Facilities Section */}
      <section className="py-16">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-gray-600">
                Powerful tools and features designed to help you grow your
                business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.map((facility, index) => {
                const Icon = facility.icon;
                return (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-linear-to-br ${facility.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {facility.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {facility.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Additional Benefits
              </h2>
              <p className="text-lg text-gray-600">
                More reasons to choose GoFarm as your selling platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-linear-to-br from-green-50 to-emerald-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of successful vendors and start selling your
                products on GoFarm today. Our simple application process gets
                you started in minutes.
              </p>
            </div>

            <Link href="/vendor-registration">
              <Button
                size="lg"
                className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Apply to Become a Vendor
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-6">
              Already applied?{" "}
              <Link
                href="/vendor-registration"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Check your application status
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
