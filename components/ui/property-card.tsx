"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  city: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  monthlyRent?: number;
  isOnCampus: boolean;
  className?: string;
}

export function PropertyCard({
  id,
  name,
  address,
  city,
  imageUrl,
  rating,
  reviewCount,
  monthlyRent,
  isOnCampus,
  className,
}: PropertyCardProps) {
  return (
    <Link href={`/housing/${id}`}>
      <Card
        className={cn(
          "group overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-school-secondary",
          className
        )}
      >
        {/* Image */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-gray-200">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            unoptimized={imageUrl?.endsWith('.svg')}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {isOnCampus && (
              <Badge className="bg-school-secondary text-white">
                On Campus
              </Badge>
            )}
            {monthlyRent && (
              <Badge className="bg-black/70 text-white backdrop-blur-sm">
                ${monthlyRent}/mo
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to favorites
            }}
          >
            <Heart className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-school-secondary transition-colors line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">
                {address}, {city}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <StarRating rating={rating} size="sm" />
            <span className="text-sm text-gray-500">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
