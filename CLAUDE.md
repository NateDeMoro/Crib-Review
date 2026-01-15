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
- **File Upload**: UploadThing (image hosting for reviews)
- **Deployment**: Railway (managed PostgreSQL + Node.js)

### Project Structure
```
app/
├── api/                    # Backend API routes
│   ├── auth/[...nextauth]/ # NextAuth handler
│   ├── housing/            # Housing CRUD operations (GET returns averageRating, averageRent)
│   ├── reviews/            # Review submission and retrieval
│   ├── favorites/          # Favorites CRUD (GET, POST, DELETE)
│   └── uploadthing/        # Image upload handler (UploadThing)
├── auth/                   # Sign-in and sign-up pages
├── housing/
│   ├── page.tsx            # Browse housing (search, filters, sort, pagination)
│   ├── [id]/page.tsx       # Housing detail page with reviews
│   └── new/page.tsx        # Add new housing (protected)
├── review/new/             # Write review page with image upload (protected)
├── dashboard/              # User dashboard: reviews + favorites (protected)
├── profile/                # User profile with stats (protected)
└── layout.tsx              # Root layout with SessionProvider

components/
├── ui/                     # shadcn/ui components
│   ├── property-card.tsx   # Housing card with favorites toggle
│   ├── star-rating.tsx     # Star rating display (5-star scale)
│   └── image-upload.tsx    # UploadThing image uploader
└── layouts/                # Header, BottomNav

hooks/
└── useFavorites.ts         # Favorites state management with optimistic updates

lib/
├── prisma.ts               # Prisma client singleton
└── uploadthing.ts          # UploadThing utilities

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
- Returns all housing (optionally filtered by schoolId)
- Includes computed `averageRating` (1-10 scale) and `averageRent` from reviews
- Public endpoint (no auth required)

**POST /api/housing**
- Protected (requires authentication)
- Prevents duplicate housing entries
- Associates housing with user's school

**GET /api/reviews?housingId=<id>** or **?userId=<id>**
- Returns reviews for specific housing or user
- Respects `isAnonymous` flag (hides user data)
- Includes user and housing relations

**POST /api/reviews**
- Protected (requires authentication)
- Validates all ratings (1-10 range)
- Prevents duplicate reviews from same user for same housing
- Auto-creates housing if it doesn't exist
- Accepts `images` array (UploadThing URLs)

**GET /api/favorites**
- Protected (requires authentication)
- Returns user's favorited housing with computed stats
- Includes averageRating, reviewCount, averageRent

**POST /api/favorites**
- Protected (requires authentication)
- Body: `{ housingId: string }`
- Creates favorite (handles duplicate constraint)

**DELETE /api/favorites?housingId=<id>**
- Protected (requires authentication)
- Removes favorite

**POST /api/uploadthing**
- Protected (requires authentication)
- Handles image uploads for reviews (max 5 images, 4MB each)
- Returns uploaded file URLs

### Frontend Pages & Features

**Browse Housing (`/housing`)**
- Real-time search by name, address, city
- Filters: All, On Campus, Off Campus, Under $900
- Sorting: Highest Rated, Lowest Price, Most Reviews
- Pagination with "Load More" (9 properties per page)
- Displays ratings on 1-5 star scale (API returns 1-10, divided by 2 for display)

**Housing Detail (`/housing/[id]`)**
- Property details with full address and stats
- Rating breakdown by category (location, value, maintenance, management, amenities)
- All reviews with images, sorted by newest first
- Anonymous reviews hide user names
- Favorite button and "Write Review" CTA

**Dashboard (`/dashboard`)** - Protected
- User stats: reviews written, favorites count
- Latest 5 reviews with links to properties
- Grid of favorited properties with PropertyCard
- Quick actions: Write Review, Browse Housing

**Profile (`/profile`)** - Protected
- User info: name, email, school, member since
- Activity stats with "View My Reviews" and "View My Favorites" buttons
- Sign out functionality

**Write Review (`/review/new`)** - Protected
- Multi-section form: property info, 6 rating categories (1-10), review text
- Image upload (up to 5 images via UploadThing)
- Additional details: rent, utilities, furnished, pets
- Anonymous posting option

**Favorites System**
- `useFavorites` hook with optimistic updates
- Heart icon toggle on PropertyCard (red when favorited)
- Persisted to database via `/api/favorites`
- Accessible from browse, detail, and dashboard pages

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
2. **Review ratings**: All rating fields stored as 1-10 in database. Frontend displays as 1-5 stars (divide by 2).
3. **Duplicate prevention**:
   - One review per user per housing
   - One favorite per user per housing (unique constraint)
4. **Anonymous reviews**: When `isAnonymous: true`, user data should not be exposed
5. **Build process**: `prisma generate` and `prisma db push` run automatically during build
6. **Image uploads**: Requires UploadThing API keys in `.env` (UPLOADTHING_SECRET, UPLOADTHING_APP_ID)

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

**Core Configuration:**
- `prisma/schema.prisma` - Database schema (7 models)
- `auth.config.ts` - Authentication configuration and route protection
- `middleware.ts` - Edge middleware for route guards (protects /dashboard, /profile, /review, /housing/new)
- `.env` - Environment variables (DATABASE_URL, AUTH_SECRET, UPLOADTHING_SECRET, UPLOADTHING_APP_ID)

**Backend:**
- `lib/prisma.ts` - Prisma client singleton
- `app/api/housing/route.ts` - Housing CRUD, returns averageRating/averageRent
- `app/api/favorites/route.ts` - Favorites CRUD
- `app/api/reviews/route.ts` - Review submission
- `app/api/uploadthing/` - Image upload handler

**Frontend Pages:**
- `app/housing/page.tsx` - Browse with search/filter/sort
- `app/housing/[id]/page.tsx` - Housing detail with reviews
- `app/dashboard/page.tsx` - User dashboard
- `app/profile/page.tsx` - User profile
- `app/review/new/page.tsx` - Review form with image upload

**Components & Hooks:**
- `components/ui/property-card.tsx` - Housing card with favorites
- `components/ui/image-upload.tsx` - UploadThing uploader
- `hooks/useFavorites.ts` - Favorites state management

## Guidelines
- Ask clarifying questions to help lower usage by getting more specific instructions

## Output Guidelines (Important)

- Do NOT reprint entire files.
- Prefer minimal diffs or focused code snippets showing only modified lines.
- If a change affects more than ~30 lines in a file:
  - Summarize the change in plain English
  - List the file paths modified
  - Do NOT inline the full code unless explicitly requested
- Always indicate where the change was made (file + function/component name).