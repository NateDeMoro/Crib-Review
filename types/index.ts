import { School, User, Housing, Review, Comment, Favorite, Message } from "@prisma/client";

// Extended types with relations
export type UserWithSchool = User & {
  school: School;
};

export type HousingWithReviews = Housing & {
  reviews: Review[];
  school: School;
};

export type ReviewWithRelations = Review & {
  user: User;
  housing: Housing;
  comments: Comment[];
};

export type CommentWithUser = Comment & {
  user: User;
};

// Form types
export type ReviewFormData = {
  housingId: string;
  isAnonymous: boolean;
  overallRating: number;
  locationRating?: number;
  valueRating?: number;
  maintenanceRating?: number;
  managementRating?: number;
  amenitiesRating?: number;
  title?: string;
  description: string;
  monthlyRent?: number;
  utilitiesIncluded?: boolean;
  isFurnished?: boolean;
  petsAllowed?: boolean;
  images: string[];
};

export type HousingFormData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isOnCampus: boolean;
};

// Filter types
export type HousingFilters = {
  minRent?: number;
  maxRent?: number;
  petsAllowed?: boolean;
  utilitiesIncluded?: boolean;
  isFurnished?: boolean;
  isOnCampus?: boolean;
  city?: string;
};
