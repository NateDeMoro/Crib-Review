import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email is .edu
    if (!email.endsWith(".edu")) {
      return NextResponse.json(
        { error: "Only .edu email addresses are allowed" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Extract domain from email (e.g., "oregonstate.edu")
    const domain = email.split("@")[1];

    // Check if school exists
    let school = await prisma.school.findUnique({
      where: { domain },
    });

    // If school doesn't exist, create it with default values
    // In a real app, you'd want an admin to approve new schools
    if (!school) {
      // For now, auto-create with default branding
      // TODO: Implement proper school onboarding
      const schoolName = domain
        .split(".")[0]
        .split(/(?=[A-Z])/)
        .join(" ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      school = await prisma.school.create({
        data: {
          name: schoolName,
          domain: domain,
          slug: domain.split(".")[0].toLowerCase(),
          colorPrimary: "#DC4405", // Default OSU orange
          colorSecondary: "#000000", // Default black
        },
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        schoolId: school.id,
        isVerified: false, // Email verification can be added later
      },
      select: {
        id: true,
        name: true,
        email: true,
        school: {
          select: {
            name: true,
            domain: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
