# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
npm run dev              # Start Next.js development server on localhost:3000
npm run build            # Production build (runs: prisma generate → prisma db push → next build)
npm run start            # Start production server (uses PORT env var, defaults to 3000)
npm run lint             # Run ESLint
```

### Database Management
```bash
npx prisma generate      # Generate Prisma client after schema changes
npx prisma db push       # Push schema changes to database (destructive, for dev)
npx prisma studio        # Open Prisma Studio GUI to browse/edit database
npx prisma migrate dev   # Create and apply migrations (for production-ready schemas)
```

### Initial Setup
```bash
npm install
cp .env.example .env     # Then fill in DATABASE_URL, AUTH_SECRET, etc.
npx prisma generate
npx prisma db push
npm run dev
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM 6
- **Authentication**: NextAuth.js v5 (JWT sessions, Credentials provider)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Railway (managed PostgreSQL + Node.js)

### Project Structure
```
app/
├── api/                    # Backend API routes
│   ├── auth/[...nextauth]/ # NextAuth handler
│   ├── housing/            # Housing CRUD operations
│   └── reviews/            # Review submission and retrieval
├── auth/                   # Sign-in and sign-up pages
├── housing/                # Browse listings & add new housing
├── review/new/             # Write review page
├── dashboard/              # User dashboard (protected)
├── profile/                # User profiles (protected)
└── layout.tsx              # Root layout with SessionProvider

components/
├── ui/                     # shadcn/ui components (button, card, input, etc.)
│   ├── property-card.tsx   # Housing listing card component
│   └── star-rating.tsx     # Review rating display
└── layouts/                # Header, BottomNav

lib/
└── prisma.ts               # Prisma client singleton (import from @/lib/prisma)

prisma/
└── schema.prisma           # Database schema (7 models)

auth.ts                     # NextAuth configuration entry point
auth.config.ts              # Auth providers and callbacks
middleware.ts               # Route protection middleware
```

### Database Models (Prisma)

**7 Core Models:**

1. **School** - University data with custom color schemes
   - Fields: name, domain (e.g., "oregonstate.edu"), colorPrimary/Secondary, slug
   - Relations: User[], Housing[]

2. **User** - Students with .edu email requirement
   - Fields: email (unique), password (bcrypt hashed), name, schoolId, isVerified
   - Relations: reviews, comments, favorites, sentMessages, receivedMessages
   - Indexes on: schoolId, email

3. **Housing** - On-campus and off-campus properties
   - Fields: name, address, city, state, zipCode, isOnCampus, schoolId
   - Relations: reviews, favorites, school
   - Indexes on: schoolId, city

4. **Review** - Multi-category housing reviews
   - **Rating fields (1-10 scale)**: overallRating (required), locationRating, valueRating, maintenanceRating, managementRating, amenitiesRating
   - Text: title, description (Text type)
   - Metadata: monthlyRent, utilitiesIncluded, isFurnished, petsAllowed, isAnonymous
   - Media: images (String array of URLs)
   - Relations: housing, user, comments
   - Indexes on: housingId, userId, overallRating

5. **Comment** - Public comments on reviews
   - Relations: review, user

6. **Favorite** - Bookmarked housing
   - Unique constraint on (userId, housingId)

7. **Message** - Direct messaging between users
   - Fields: senderId, recipientId, content, isRead
   - Indexes on: senderId, recipientId, createdAt

### Authentication Flow (NextAuth v5)

**Configuration files:**
- `auth.config.ts` - Providers, callbacks, protected routes
- `auth.ts` - Main NextAuth configuration
- `middleware.ts` - Route protection at edge

**Key Features:**
- **Provider**: Credentials (email/password)
- **Email validation**: Only `.edu` emails allowed (enforced in `auth.config.ts:23`)
- **Password hashing**: bcryptjs (10 rounds)
- **Session strategy**: JWT-based
- **Protected routes**: `/dashboard`, `/review`, `/housing/new`, `/profile`
- **Redirect flow**: Unauthenticated users → `/auth/signin?callbackUrl=<original-url>`

**Session data enrichment:**
- JWT callback adds `user.id` to token
- Session callback exposes `user.id` to client

**Important**: NextAuth v5 is still in beta. Use `auth()` helper to get session server-side.

### API Routes

**POST /api/auth/register**
- Validates `.edu` email format
- Hashes password with bcryptjs
- Auto-assigns user to school based on email domain
- Returns error if school not found in database

**GET /api/housing**
- Returns all housing for user's school
- Includes computed `averageRating` and `averageRent` from reviews
- Public endpoint (no auth required)

**POST /api/housing**
- Protected (requires authentication)
- Prevents duplicate housing entries
- Associates housing with user's school

**GET /api/reviews?housingId=<id>**
- Returns reviews for specific housing
- Respects `isAnonymous` flag (hides user data)
- Includes user and housing relations

**POST /api/reviews**
- Protected (requires authentication)
- Validates all ratings (1-10 range)
- Prevents duplicate reviews from same user for same housing
- Auto-creates housing if it doesn't exist
- Requires at least `overallRating` and `description`

### Key Technical Patterns

**Prisma Client Usage:**
```typescript
import { prisma } from "@/lib/prisma";
// Always use this singleton, never instantiate new PrismaClient()
```

**Getting user session (server-side):**
```typescript
import { auth } from "@/auth";
const session = await auth();
const userId = session?.user?.id;
```

**Protected route pattern:**
- Middleware checks authentication at edge (`middleware.ts:11`)
- Redirects to `/auth/signin` with callback URL
- API routes should verify session with `await auth()`

**School-based multi-tenancy:**
- All data scoped by `schoolId`
- User assigned to school during registration based on email domain
- Queries should filter by `session.user.school` when needed

### Important Constraints

1. **Email validation**: Only `.edu` addresses allowed (auth.config.ts:23)
2. **Review ratings**: All rating fields must be 1-10 if provided
3. **Duplicate prevention**:
   - One review per user per housing
   - One favorite per user per housing (unique constraint)
4. **Anonymous reviews**: When `isAnonymous: true`, user data should not be exposed
5. **Build process**: `prisma generate` and `prisma db push` run automatically during build

### Testing and Development Notes

**Local development:**
- Use `npm run dev` for hot reloading
- Prisma Studio (`npx prisma studio`) helpful for data inspection
- Check `.env` has valid `DATABASE_URL` and `AUTH_SECRET`

**Database changes:**
- Edit `prisma/schema.prisma`
- Run `npx prisma generate` to update client
- Run `npx prisma db push` to apply changes (dev only, destructive)
- For production: use `npx prisma migrate dev` to create migrations

**Authentication testing:**
- Create test user via `/auth/signup` with any `.edu` email
- Ensure school exists in database matching email domain
- Use browser DevTools to inspect session cookie

**Deployment (Railway):**
- Set environment variables in Railway dashboard
- Build script handles Prisma client generation and schema push
- Production server uses `PORT` env variable (defaults to 3000)

## Important Files

- `prisma/schema.prisma` - Database schema (source of truth for data models)
- `auth.config.ts` - Authentication configuration and route protection
- `middleware.ts` - Edge middleware for route guards
- `lib/prisma.ts` - Prisma client singleton
- `app/api/` - All backend API routes
- `components/ui/` - Reusable UI components (shadcn/ui)
