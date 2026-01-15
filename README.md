# Crib Review

A full-stack web platform enabling college students to share and discover honest housing reviews. Built with modern web technologies and designed for scalability across multiple universities.

**Live Demo**: [housing-project-production.up.railway.app](https://housing-project-production.up.railway.app)

## Overview

Crib Review solves the problem of information asymmetry in student housing by providing a trusted platform where verified students (.edu emails only) can review both on-campus and off-campus properties. The application features multi-category ratings, photo uploads, favorites, and a clean, responsive interface.

## Key Features

- **Verified Student Access**: .edu email authentication ensures authentic reviews
- **Comprehensive Reviews**: Multi-category ratings (location, value, maintenance, management, amenities) with detailed written feedback
- **Rich Media**: Image upload support via UploadThing
- **Smart Filtering**: Search and filter by price, location, on/off-campus status
- **User Features**: Favorites system, personal dashboard, anonymous posting option
- **Multi-Tenant Architecture**: School-specific theming and branding support

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM 6
- **Authentication**: NextAuth.js v5 (JWT-based sessions)
- **Styling**: Tailwind CSS with shadcn/ui components
- **File Upload**: UploadThing
- **Deployment**: Railway (managed PostgreSQL + Node.js)

## Architecture Highlights

- Server-side rendering with React Server Components
- Edge middleware for route protection
- Optimistic UI updates for favorites
- Computed fields for average ratings and pricing
- Type-safe database queries with Prisma

## Database Schema

The application uses 7 core models: School, User, Housing, Review, Comment, Favorite, and Message. All data is scoped by school to support multi-tenancy, with indexes on frequently queried fields for optimal performance.

## Local Development

### Prerequisites
- Node.js 18.17+ (20+ recommended)
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, and API keys

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## Deployment

The application is production-ready and deployed on Railway with automated CI/CD from the main branch. Environment variables are managed through Railway's dashboard, and database migrations are applied during the build process.

## Project Structure

```
app/
├── api/              # REST API routes (housing, reviews, favorites, auth)
├── auth/             # Sign-in and sign-up pages
├── housing/          # Browse, detail, and add housing pages
├── dashboard/        # User dashboard with reviews and favorites
└── profile/          # User profile management

components/
├── ui/               # Reusable UI components (shadcn/ui)
└── layouts/          # Header and navigation components

prisma/
└── schema.prisma     # Database schema definition

auth.ts               # NextAuth configuration
middleware.ts         # Route protection middleware
```

## License

Proprietary
