"use client";

import { Search, SlidersHorizontal, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/ui/property-card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useMemo } from "react";
import { useFavorites } from "@/hooks/useFavorites";

type Housing = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isOnCampus: boolean;
  school: {
    id: string;
    name: string;
  };
  averageRating: number | null;
  reviewCount: number;
  averageRent: number | null;
};

type FilterType = "all" | "on-campus" | "off-campus" | "under-900";
type SortType = "highest-rated" | "lowest-price" | "most-reviews";

function HousingContent() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  // Data state
  const [properties, setProperties] = useState<Housing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("highest-rated");
  const [displayCount, setDisplayCount] = useState(9);

  // Favorites
  const { isFavorited, toggleFavorite } = useFavorites();

  // Fetch housing data
  useEffect(() => {
    const fetchHousing = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/housing");

        if (!response.ok) {
          throw new Error("Failed to load housing data");
        }

        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHousing();
  }, []);

  // Success message handling
  useEffect(() => {
    if (searchParams.get("review") === "success") {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Filter, sort, and paginate properties
  const filteredAndSortedProperties = useMemo(() => {
    let result = [...properties];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query)
      );
    }

    // Apply filters
    switch (activeFilter) {
      case "on-campus":
        result = result.filter((p) => p.isOnCampus);
        break;
      case "off-campus":
        result = result.filter((p) => !p.isOnCampus);
        break;
      case "under-900":
        result = result.filter((p) => p.averageRent !== null && p.averageRent < 900);
        break;
      case "all":
      default:
        break;
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "highest-rated":
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        case "lowest-price":
          if (a.averageRent === null) return 1;
          if (b.averageRent === null) return -1;
          return a.averageRent - b.averageRent;
        case "most-reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    return result;
  }, [properties, searchQuery, activeFilter, sortBy]);

  const displayedProperties = filteredAndSortedProperties.slice(0, displayCount);
  const hasMore = displayCount < filteredAndSortedProperties.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 9);
  };

  const handleRetry = () => {
    window.location.reload();
  };

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
                placeholder="Search by name, address, or city..."
                className="pl-10 h-12 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              size="lg"
              variant="outline"
              className="bg-white hover:bg-gray-100"
              disabled
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline ml-2">Filters</span>
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button
              variant={activeFilter === "all" ? "secondary" : "ghost"}
              className={
                activeFilter === "all"
                  ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                  : "text-white hover:bg-white/10"
              }
              onClick={() => setActiveFilter("all")}
            >
              All Housing
            </Button>
            <Button
              variant={activeFilter === "on-campus" ? "secondary" : "ghost"}
              className={
                activeFilter === "on-campus"
                  ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                  : "text-white hover:bg-white/10"
              }
              onClick={() => setActiveFilter("on-campus")}
            >
              On Campus
            </Button>
            <Button
              variant={activeFilter === "off-campus" ? "secondary" : "ghost"}
              className={
                activeFilter === "off-campus"
                  ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                  : "text-white hover:bg-white/10"
              }
              onClick={() => setActiveFilter("off-campus")}
            >
              Off Campus
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 opacity-50"
              disabled
            >
              Pets Allowed
            </Button>
            <Button
              variant={activeFilter === "under-900" ? "secondary" : "ghost"}
              className={
                activeFilter === "under-900"
                  ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                  : "text-white hover:bg-white/10"
              }
              onClick={() => setActiveFilter("under-900")}
            >
              Under $900
            </Button>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-school-secondary border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Properties</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRetry} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Properties Content */}
        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <strong>{displayedProperties.length}</strong> of{" "}
                <strong>{filteredAndSortedProperties.length}</strong> properties
              </p>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
              >
                <option value="highest-rated">Highest Rated</option>
                <option value="lowest-price">Lowest Price</option>
                <option value="most-reviews">Most Reviews</option>
              </select>
            </div>

            {/* Empty State */}
            {filteredAndSortedProperties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No properties found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Property Grid */}
            {filteredAndSortedProperties.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {displayedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      id={property.id}
                      name={property.name}
                      address={property.address}
                      city={property.city}
                      imageUrl="/placeholder.svg"
                      rating={(property.averageRating ?? 0) / 2}
                      reviewCount={property.reviewCount}
                      monthlyRent={property.averageRent ?? undefined}
                      isOnCampus={property.isOnCampus}
                      isFavorited={isFavorited(property.id)}
                      onFavoriteToggle={toggleFavorite}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-school-secondary text-school-secondary hover:bg-school-secondary hover:text-white"
                      onClick={handleLoadMore}
                    >
                      Load More Properties
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
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
