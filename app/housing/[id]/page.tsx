"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Heart, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { useFavorites } from "@/hooks/useFavorites";
import { useSession } from "next-auth/react";

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
};

type Review = {
  id: string;
  title: string | null;
  description: string;
  overallRating: number;
  locationRating: number | null;
  valueRating: number | null;
  maintenanceRating: number | null;
  managementRating: number | null;
  amenitiesRating: number | null;
  monthlyRent: number | null;
  utilitiesIncluded: boolean;
  isFurnished: boolean;
  petsAllowed: boolean;
  isAnonymous: boolean;
  images: string[];
  createdAt: string;
  user: {
    name: string;
  } | null;
};

type RatingCategory = {
  name: string;
  rating: number;
};

export default function HousingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const housingId = params.id as string;

  const [housing, setHousing] = useState<Housing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isFavorited, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch housing and reviews in parallel
        const [housingRes, reviewsRes] = await Promise.all([
          fetch("/api/housing"),
          fetch(`/api/reviews?housingId=${housingId}`),
        ]);

        if (!housingRes.ok || !reviewsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const allHousing = await housingRes.json();
        const reviewsData = await reviewsRes.json();

        // Find the specific housing
        const housingData = allHousing.find((h: Housing) => h.id === housingId);

        if (!housingData) {
          setError("Housing not found");
          return;
        }

        setHousing(housingData);
        setReviews(reviewsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [housingId]);

  // Calculate rating averages
  const ratingCategories: RatingCategory[] = [];
  if (reviews.length > 0) {
    const calculateAverage = (
      ratings: (number | null)[]
    ): number | null => {
      const validRatings = ratings.filter((r): r is number => r !== null);
      if (validRatings.length === 0) return null;
      return validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
    };

    const avgOverall = calculateAverage(reviews.map((r) => r.overallRating));
    const avgLocation = calculateAverage(reviews.map((r) => r.locationRating));
    const avgValue = calculateAverage(reviews.map((r) => r.valueRating));
    const avgMaintenance = calculateAverage(
      reviews.map((r) => r.maintenanceRating)
    );
    const avgManagement = calculateAverage(
      reviews.map((r) => r.managementRating)
    );
    const avgAmenities = calculateAverage(reviews.map((r) => r.amenitiesRating));

    if (avgLocation !== null) ratingCategories.push({ name: "Location", rating: avgLocation });
    if (avgValue !== null) ratingCategories.push({ name: "Value", rating: avgValue });
    if (avgMaintenance !== null) ratingCategories.push({ name: "Maintenance", rating: avgMaintenance });
    if (avgManagement !== null) ratingCategories.push({ name: "Management", rating: avgManagement });
    if (avgAmenities !== null) ratingCategories.push({ name: "Amenities", rating: avgAmenities });
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
      : 0;

  const averageRent = reviews.length > 0
    ? reviews
        .map((r) => r.monthlyRent)
        .filter((rent): rent is number => rent !== null)
        .reduce((sum, rent, _, arr) => sum + rent / arr.length, 0)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-school-secondary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !housing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Housing not found"}
          </h1>
          <Button onClick={() => router.push("/housing")}>
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-school-primary to-gray-900 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {housing.name}
              </h1>
              <div className="flex items-center gap-2 text-white/90 mb-4">
                <MapPin className="h-5 w-5" />
                <span>
                  {housing.address}, {housing.city}, {housing.state} {housing.zipCode}
                </span>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <StarRating rating={averageRating / 2} size="md" />
                  <span className="text-white font-semibold">
                    {(averageRating / 2).toFixed(1)}/5
                  </span>
                </div>
                <span className="text-white/90">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
                {housing.isOnCampus && (
                  <Badge className="bg-school-secondary text-white">
                    On Campus
                  </Badge>
                )}
                {averageRent && (
                  <Badge className="bg-white/20 text-white backdrop-blur-sm">
                    Avg: ${Math.round(averageRent)}/mo
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-100"
                onClick={() => toggleFavorite(housingId)}
              >
                <Heart
                  className={
                    isFavorited(housingId)
                      ? "h-5 w-5 fill-red-500 text-red-500"
                      : "h-5 w-5"
                  }
                />
              </Button>
              <Button
                size="lg"
                className="bg-school-secondary hover:bg-school-secondary/90 text-white"
                onClick={() =>
                  session
                    ? router.push(`/review/new?housingId=${housingId}`)
                    : router.push("/auth/signin")
                }
              >
                <PenSquare className="h-5 w-5 mr-2" />
                Write Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details & Rating Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">School</p>
                  <p className="font-semibold">{housing.school.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">
                    {housing.isOnCampus ? "On Campus" : "Off Campus"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Full Address</p>
                  <p className="text-sm">
                    {housing.address}
                    <br />
                    {housing.city}, {housing.state} {housing.zipCode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rating Breakdown */}
            {ratingCategories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Rating Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ratingCategories.map((category) => (
                    <div key={category.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-gray-600">
                          {category.rating.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-school-secondary rounded-full h-2 transition-all"
                          style={{ width: `${(category.rating / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Reviews */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">No reviews yet</p>
                  <Button
                    onClick={() =>
                      session
                        ? router.push(`/review/new?housingId=${housingId}`)
                        : router.push("/auth/signin")
                    }
                  >
                    Be the first to review
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {reviews
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <StarRating rating={review.overallRating / 2} size="sm" />
                              <span className="font-semibold">
                                {(review.overallRating / 2).toFixed(1)}/5
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {review.isAnonymous ? "Anonymous User" : review.user?.name} •{" "}
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {review.title && (
                          <h3 className="font-bold text-lg mb-2">{review.title}</h3>
                        )}

                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                          {review.description}
                        </p>

                        {/* Additional Details */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {review.monthlyRent && (
                            <Badge variant="secondary">
                              ${review.monthlyRent}/mo
                            </Badge>
                          )}
                          {review.utilitiesIncluded && (
                            <Badge variant="secondary">Utilities Included</Badge>
                          )}
                          {review.isFurnished && (
                            <Badge variant="secondary">Furnished</Badge>
                          )}
                          {review.petsAllowed && (
                            <Badge variant="secondary">Pets Allowed</Badge>
                          )}
                        </div>

                        {/* Review Images */}
                        {review.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {review.images.map((imageUrl, idx) => (
                              <div
                                key={idx}
                                className="aspect-video bg-gray-200 rounded-lg overflow-hidden"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Review image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
