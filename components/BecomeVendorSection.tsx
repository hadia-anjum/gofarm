import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Store,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Container from "./Container";

export default function BecomeVendorSection() {
  const features = [
    {
      icon: Store,
      title: "Your Storefront",
      description: "Create your own digital store",
    },
    {
      icon: TrendingUp,
      title: "Grow Sales",
      description: "Reach thousands of customers",
    },
    {
      icon: Users,
      title: "Customer Base",
      description: "Access our loyal community",
    },
    {
      icon: DollarSign,
      title: "Earn More",
      description: "Competitive commission rates",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-linear-to-br from-gofarm-green/5 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gofarm-green rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-gofarm-green/10 text-gofarm-green px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Join Our Vendor Community
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gofarm-black mb-6 leading-tight">
              Start Selling on <span className="text-gofarm-green">GoFarm</span>
            </h2>

            <p className="text-lg text-gofarm-gray mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Turn your passion into profit. Join thousands of successful
              vendors who trust GoFarm to grow their business and reach new
              customers every day.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/vendor-registration">
                <Button
                  size="lg"
                  className="bg-gofarm-green hover:bg-gofarm-green/90 text-white font-semibold px-8 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  Become a Vendor
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link href="/vendor-info">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gofarm-green text-gofarm-green hover:bg-gofarm-green/5 font-semibold px-8 h-12 rounded-xl w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-gofarm-green">
                  500+
                </div>
                <div className="text-xs lg:text-sm text-gofarm-gray">
                  Active Vendors
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-gofarm-green">
                  10K+
                </div>
                <div className="text-xs lg:text-sm text-gofarm-gray">
                  Monthly Orders
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-gofarm-green">
                  98%
                </div>
                <div className="text-xs lg:text-sm text-gofarm-gray">
                  Success Rate
                </div>
              </div>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="border-gofarm-light-green/30 hover:border-gofarm-green/50 hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-linear-to-br from-gofarm-green to-emerald-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <feature.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gofarm-black mb-2 text-base lg:text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-gofarm-gray leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
