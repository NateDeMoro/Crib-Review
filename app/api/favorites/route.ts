import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/favorites - Get user's favorited housing
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        housing: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
              },
            },
            reviews: {
              select: {
                overallRating: true,
                monthlyRent: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to include computed fields
    const favoritesWithStats = favorites.map((fav) => {
      const reviews = fav.housing.reviews;
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.overallRating, 0) /
            reviews.length
          : null;

      const rentsWithValues = reviews
        .map((r) => r.monthlyRent)
        .filter((rent): rent is number => rent !== null);
      const averageRent =
        rentsWithValues.length > 0
          ? rentsWithValues.reduce((sum, rent) => sum + rent, 0) /
            rentsWithValues.length
          : null;

      return {
        id: fav.housing.id,
        name: fav.housing.name,
        address: fav.housing.address,
        city: fav.housing.city,
        state: fav.housing.state,
        zipCode: fav.housing.zipCode,
        isOnCampus: fav.housing.isOnCampus,
        school: fav.housing.school,
        averageRating,
        reviewCount: reviews.length,
        averageRent,
        favoritedAt: fav.createdAt,
      };
    });

    return NextResponse.json(favoritesWithStats);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a favorite
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { housingId } = body;

    if (!housingId) {
      return NextResponse.json(
        { error: "Housing ID is required" },
        { status: 400 }
      );
    }

    // Check if housing exists
    const housing = await prisma.housing.findUnique({
      where: { id: housingId },
    });

    if (!housing) {
      return NextResponse.json(
        { error: "Housing not found" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_housingId: {
          userId: session.user.id,
          housingId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Already favorited" },
        { status: 409 }
      );
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        housingId,
      },
      include: {
        housing: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error creating favorite:", error);
    return NextResponse.json(
      { error: "Failed to create favorite" },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a favorite
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const housingId = searchParams.get("housingId");

    if (!housingId) {
      return NextResponse.json(
        { error: "Housing ID is required" },
        { status: 400 }
      );
    }

    // Check if favorite exists
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_housingId: {
          userId: session.user.id,
          housingId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        userId_housingId: {
          userId: session.user.id,
          housingId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Failed to delete favorite" },
      { status: 500 }
    );
  }
}
