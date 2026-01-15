import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, address, city, state, zipCode, isOnCampus } = body;

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user's school
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { schoolId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if housing already exists (prevent duplicates)
    const existingHousing = await prisma.housing.findFirst({
      where: {
        name,
        address,
        schoolId: user.schoolId,
      },
    });

    if (existingHousing) {
      return NextResponse.json(
        { error: "This property already exists in the database" },
        { status: 400 }
      );
    }

    // Create housing
    const housing = await prisma.housing.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        isOnCampus: isOnCampus === true,
        schoolId: user.schoolId,
      },
    });

    return NextResponse.json(housing, { status: 201 });
  } catch (error) {
    console.error("Add housing error:", error);
    return NextResponse.json(
      { error: "Failed to add housing. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    // Build query
    const where = schoolId ? { schoolId } : {};

    // Fetch housing with reviews for ratings
    const housing = await prisma.housing.findMany({
      where,
      include: {
        school: {
          select: {
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: {
            overallRating: true,
            monthlyRent: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average ratings and rent
    const housingWithStats = housing.map((h) => {
      const avgRating = h.reviews.length > 0
        ? h.reviews.reduce((sum, r) => sum + r.overallRating, 0) / h.reviews.length
        : 0;

      const rentsWithValue = h.reviews.filter((r) => r.monthlyRent !== null);
      const avgRent = rentsWithValue.length > 0
        ? rentsWithValue.reduce((sum, r) => sum + (r.monthlyRent || 0), 0) / rentsWithValue.length
        : null;

      return {
        id: h.id,
        name: h.name,
        address: h.address,
        city: h.city,
        state: h.state,
        zipCode: h.zipCode,
        isOnCampus: h.isOnCampus,
        school: h.school,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: h._count.reviews,
        averageRent: avgRent ? Math.round(avgRent) : null,
      };
    });

    return NextResponse.json(housingWithStats);
  } catch (error) {
    console.error("Fetch housing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch housing" },
      { status: 500 }
    );
  }
}
