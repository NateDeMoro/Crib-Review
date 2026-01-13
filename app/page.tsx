import Link from "next/link";
import { ArrowRight, Home as HomeIcon, Star, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/ui/property-card";

// Mock featured properties (you'll replace this with real data later)
const featuredProperties = [
  {
    id: "1",
    name: "Bluebird Apartments",
    address: "2350 NW Kings Blvd",
    city: "Corvallis",
    imageUrl: "/placeholder.svg",
    rating: 4.5,
    reviewCount: 23,
    monthlyRent: 850,
    isOnCampus: false,
  },
  {
    id: "2",
    name: "Callahan Hall",
    address: "Campus Way",
    city: "Corvallis",
    imageUrl: "/placeholder.svg",
    rating: 4.2,
    reviewCount: 45,
    monthlyRent: 920,
    isOnCampus: true,
  },
  {
    id: "3",
    name: "The Grove",
    address: "1234 SW Monroe Ave",
    city: "Corvallis",
    imageUrl: "/placeholder.svg",
    rating: 4.7,
    reviewCount: 31,
    monthlyRent: 1100,
    isOnCampus: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-school-primary via-gray-900 to-school-primary py-20 md:py-32 px-4 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-school-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-school-secondary/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-school-secondary rounded-2xl">
                <HomeIcon className="h-16 w-16 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Find Your Perfect{" "}
              <span className="text-school-secondary">Nest</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Student reviews of college housing, by students for students
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <Shield className="h-5 w-5 text-school-secondary" />
              <span className="text-sm">
                Currently serving <strong>Oregon State University</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                size="lg"
                className="bg-school-secondary hover:bg-school-secondary/90 text-white text-lg px-8"
                asChild
              >
                <Link href="/housing">
                  Browse Housing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-school-primary text-lg px-8"
                asChild
              >
                <Link href="/review/new">Write a Review</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-school-secondary/10 rounded-xl">
                  <Users className="h-8 w-8 text-school-secondary" />
                </div>
              </div>
              <h3 className="font-bold text-xl">Student Verified</h3>
              <p className="text-gray-600">
                Only .edu email addresses can post reviews. Real students, real experiences.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-school-secondary/10 rounded-xl">
                  <Star className="h-8 w-8 text-school-secondary" />
                </div>
              </div>
              <h3 className="font-bold text-xl">Detailed Ratings</h3>
              <p className="text-gray-600">
                Rate utilities, location, management, amenities, and more for complete reviews.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-school-secondary/10 rounded-xl">
                  <Shield className="h-8 w-8 text-school-secondary" />
                </div>
              </div>
              <h3 className="font-bold text-xl">Anonymous Option</h3>
              <p className="text-gray-600">
                Choose to post reviews anonymously or with your name attached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Featured <span className="text-school-secondary">Housing</span>
              </h2>
              <p className="text-gray-600 mt-2">
                Top-rated properties near Oregon State
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-school-secondary hover:text-school-secondary/80"
              asChild
            >
              <Link href="/housing">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-school-primary to-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Nest?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of Oregon State students sharing honest housing reviews
          </p>
          <Button
            size="lg"
            className="bg-school-secondary hover:bg-school-secondary/90 text-white text-lg px-8"
            asChild
          >
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
