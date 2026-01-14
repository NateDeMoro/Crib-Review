import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to write a review." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { housing, review } = body;

    // Validate housing data
    if (!housing?.name || !housing?.address || !housing?.city || !housing?.state || !housing?.zipCode) {
      return NextResponse.json(
        { error: "Missing required housing information" },
        { status: 400 }
      );
    }

    // Validate review data
    if (!review?.description || !review?.overallRating) {
      return NextResponse.json(
        { error: "Missing required review information" },
        { status: 400 }
      );
    }

    // Validate ratings are in range 1-10
    const ratings = [
      review.overallRating,
      review.locationRating,
      review.valueRating,
      review.maintenanceRating,
      review.managementRating,
      review.amenitiesRating,
    ];

    for (const rating of ratings) {
      if (rating && (rating < 1 || rating > 10)) {
        return NextResponse.json(
          { error: "Ratings must be between 1 and 10" },
          { status: 400 }
        );
      }
    }

    // Get user with school
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        schoolId: true
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if housing exists (search by name and address to find duplicates)
    let housingRecord = await prisma.housing.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: housing.name,
              mode: "insensitive",
            },
            schoolId: user.schoolId,
          },
          {
            address: {
              equals: housing.address,
              mode: "insensitive",
            },
            schoolId: user.schoolId,
          },
        ],
      },
    });

    // If housing doesn't exist, create it
    if (!housingRecord) {
      housingRecord = await prisma.housing.create({
        data: {
          name: housing.name,
          address: housing.address,
          city: housing.city,
          state: housing.state,
          zipCode: housing.zipCode,
          isOnCampus: housing.isOnCampus === true,
          schoolId: user.schoolId,
        },
      });
    }

    // Check if user already reviewed this property
    const existingReview = await prisma.review.findFirst({
      where: {
        housingId: housingRecord.id,
        userId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this property" },
        { status: 400 }
      );
    }

    // Create the review
    const newReview = await prisma.review.create({
      data: {
        housingId: housingRecord.id,
        userId: user.id,
        isAnonymous: review.isAnonymous === true,
        overallRating: review.overallRating,
        locationRating: review.locationRating || null,
        valueRating: review.valueRating || null,
        maintenanceRating: review.maintenanceRating || null,
        managementRating: review.managementRating || null,
        amenitiesRating: review.amenitiesRating || null,
        title: review.title || null,
        description: review.description,
        monthlyRent: review.monthlyRent || null,
        utilitiesIncluded: review.utilitiesIncluded || null,
        isFurnished: review.isFurnished || null,
        petsAllowed: review.petsAllowed || null,
        images: review.images || [],
      },
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        reviewId: newReview.id,
        housingId: housingRecord.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit review error:", error);
    return NextResponse.json(
      { error: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const housingId = searchParams.get("housingId");
    const userId = searchParams.get("userId");

    // Build where clause
    const where: any = {};
    if (housingId) where.housingId = housingId;
    if (userId) where.userId = userId;

    // Fetch reviews with relations
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            school: {
              select: {
                name: true,
              },
            },
          },
        },
        housing: {
          select: {
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map reviews to hide user info if anonymous
    const reviewsWithPrivacy = reviews.map((review) => ({
      ...review,
      user: review.isAnonymous
        ? { name: "Anonymous", school: review.user.school }
        : review.user,
    }));

    return NextResponse.json(reviewsWithPrivacy);
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
