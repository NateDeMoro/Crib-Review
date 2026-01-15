"use client";

import { Search, SlidersHorizontal, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/ui/property-card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

// Mock data - replace with real database queries later
const properties = [
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
  {
    id: "4",
    name: "Sackett Hall",
    address: "Campus Way",
    city: "Corvallis",
    imageUrl: "/placeholder.svg",
    rating: 3.9,
    reviewCount: 18,
    monthlyRent: 880,
    isOnCampus: true,
  },
  {
    id: "5",
    name: "Campus Village",
    address: "1500 SW Western Blvd",
    city: "Corvallis",
    imageUrl: "/placeholder.svg",
    rating: 4.3,
    reviewCount: 27,
    monthlyRent: 950,
    isOnCampus: false,
  },
  {
    id: "6",
    name: "The Retreat",
    address: "2200 NW Monroe Ave",
    city: "Corvallis",
    imageUrl: "/placeholder.svg",
    rating: 4.6,
    reviewCount: 38,
    monthlyRent: 1050,
    isOnCampus: false,
  },
];

function HousingContent() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("review") === "success") {
      setShowSuccess(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 max-w-md">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Review Submitted!</p>
              <p className="text-sm text-green-700">Thank you for sharing your experience.</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header with Search */}
      <div className="bg-gradient-to-r from-school-primary to-gray-900 py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Browse <span className="text-school-secondary">Housing</span>
          </h1>

          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name or address..."
                className="pl-10 h-12 bg-white"
              />
            </div>
            <Button
              size="lg"
              variant="outline"
              className="bg-white hover:bg-gray-100"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline ml-2">Filters</span>
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              All Housing
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              On Campus
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              Off Campus
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              Pets Allowed
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              Under $900
            </Button>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <strong>{properties.length}</strong> properties
          </p>
          <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <option>Highest Rated</option>
            <option>Lowest Price</option>
            <option>Highest Price</option>
            <option>Most Reviews</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-school-secondary text-school-secondary hover:bg-school-secondary hover:text-white"
          >
            Load More Properties
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HousingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <HousingContent />
    </Suspense>
  );
}
