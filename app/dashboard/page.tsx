"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PenSquare, Home, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyCard } from "@/components/ui/property-card";
import { StarRating } from "@/components/ui/star-rating";
import { useFavorites } from "@/hooks/useFavorites";

type Review = {
  id: string;
  title: string | null;
  overallRating: number;
  createdAt: string;
  housing: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
};

type FavoriteHousing = {
  id: string;
  name: string;
  address: string;
  city: string;
  averageRating: number | null;
  reviewCount: number;
  averageRent: number | null;
  isOnCampus: boolean;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [favoriteHousing, setFavoriteHousing] = useState<FavoriteHousing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isFavorited, toggleFavorite } = useFavorites();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  }, [status, router]);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);

        // Fetch user's reviews and favorites in parallel
        const [reviewsRes, favoritesRes] = await Promise.all([
          fetch(`/api/reviews?userId=${session.user.id}`),
          fetch("/api/favorites"),
        ]);

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setUserReviews(reviewsData.slice(0, 5)); // Latest 5 reviews
        }

        if (favoritesRes.ok) {
          const favoritesData = await favoritesRes.json();
          setFavoriteHousing(favoritesData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-school-secondary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-school-primary to-gray-900 py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Welcome back, <span className="text-school-secondary">{session.user.name}</span>!
          </h1>
          <p className="text-white/90 mt-2">Here's your housing activity overview</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-school-secondary/10 rounded-lg">
                  <PenSquare className="h-6 w-6 text-school-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userReviews.length}</p>
                  <p className="text-sm text-gray-600">Reviews Written</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{favoriteHousing.length}</p>
                  <p className="text-sm text-gray-600">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {userReviews.length + favoriteHousing.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Activity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Reviews Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Reviews</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/review/new">
                  <PenSquare className="h-4 w-4 mr-2" />
                  Write New Review
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't written any reviews yet</p>
                <Button asChild>
                  <Link href="/review/new">Write Your First Review</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/housing/${review.housing.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-school-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StarRating rating={review.overallRating / 2} size="sm" />
                          <span className="font-semibold">
                            {(review.overallRating / 2).toFixed(1)}/5
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {review.housing.name}
                        </h4>
                        {review.title && (
                          <p className="text-sm text-gray-700 mb-1">{review.title}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {review.housing.address}, {review.housing.city}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Favorites Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Favorites</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/housing">
                  <Home className="h-4 w-4 mr-2" />
                  Browse Housing
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {favoriteHousing.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't saved any favorites yet</p>
                <Button asChild>
                  <Link href="/housing">Browse Housing</Link>
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteHousing.map((housing) => (
                  <PropertyCard
                    key={housing.id}
                    id={housing.id}
                    name={housing.name}
                    address={housing.address}
                    city={housing.city}
                    imageUrl="/placeholder.svg"
                    rating={(housing.averageRating ?? 0) / 2}
                    reviewCount={housing.reviewCount}
                    monthlyRent={housing.averageRent ?? undefined}
                    isOnCampus={housing.isOnCampus}
                    isFavorited={isFavorited(housing.id)}
                    onFavoriteToggle={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/review/new">
              <PenSquare className="h-5 w-5 mr-2" />
              Write New Review
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/housing">
              <Home className="h-5 w-5 mr-2" />
              Browse Housing
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
