"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Building2, PenSquare, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  school: {
    id: string;
    name: string;
    colorPrimary: string;
    colorSecondary: string;
  };
  _count: {
    reviews: number;
    favorites: number;
  };
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
    }
  }, [status, router]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);

        // For now, we'll construct profile from session and fetch counts
        // In a production app, you'd create a dedicated API endpoint
        const [reviewsRes, favoritesRes] = await Promise.all([
          fetch(`/api/reviews?userId=${session.user.id}`),
          fetch("/api/favorites"),
        ]);

        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];
        const favoritesData = favoritesRes.ok ? await favoritesRes.json() : [];

        // Mock profile data (would come from a dedicated API in production)
        setProfile({
          id: session.user.id,
          name: session.user.name || "User",
          email: session.user.email || "",
          createdAt: new Date().toISOString(), // Mock - would come from DB
          school: {
            id: "1",
            name: "Oregon State University",
            colorPrimary: "#000000",
            colorSecondary: "#dc4405",
          },
          _count: {
            reviews: reviewsData.length,
            favorites: favoritesData.length,
          },
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-school-secondary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-school-primary to-gray-900 py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full bg-school-secondary flex items-center justify-center text-white text-3xl font-bold">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2 text-white/90">
                <Building2 className="h-5 w-5" />
                <span>{profile.school.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* User Information Card */}
          <Card className="bg-white text-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold">{profile.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold">
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">School Affiliation</p>
                  <p className="font-semibold">{profile.school.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats Card */}
          <Card className="bg-white text-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900">Activity Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-school-secondary/10 rounded-lg">
                      <PenSquare className="h-6 w-6 text-school-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{profile._count.reviews}</p>
                      <p className="text-sm text-gray-600">
                        {profile._count.reviews === 1 ? "Review" : "Reviews"} Written
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push("/dashboard")}
                  >
                    View My Reviews
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Heart className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{profile._count.favorites}</p>
                      <p className="text-sm text-gray-600">
                        {profile._count.favorites === 1 ? "Favorite" : "Favorites"} Saved
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push("/dashboard#favorites")}
                  >
                    View My Favorites
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card className="bg-white text-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                Change Password
                <span className="ml-auto text-xs text-gray-500">(Coming Soon)</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild>
              <a href="/dashboard">View Dashboard</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/review/new">Write a Review</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
