# Campus Housing Reviews

A platform for college students to leave reviews on housing options on and off campus. Starting with Oregon State University.

## Features

- Email verification with .edu addresses only
- Anonymous or attributed reviews
- Photo uploads (2+ required per review)
- Star ratings for multiple categories (utilities, furnishing, location, etc.)
- Filters (pricing, location, pets allowed/not allowed)
- Public commenting and private DMs
- Bookmarking/favorites
- School-specific color themes

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Image Hosting**: UploadThing (or Cloudinary)
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18.17+ (20+ recommended)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your credentials:
   - Set up a PostgreSQL database (Railway offers managed Postgres)
   - Generate an AUTH_SECRET: `openssl rand -base64 32`
   - Add other API keys as needed

5. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Models:
- **School**: University information with color scheme
- **User**: Students with .edu email verification
- **Housing**: Housing properties (on/off campus)
- **Review**: Student reviews with multiple rating categories
- **Comment**: Public comments on reviews
- **Favorite**: Bookmarked housing
- **Message**: Private DMs between users

## Deployment to Railway

1. Create a Railway account
2. Create a new project and add PostgreSQL
3. Connect your GitHub repository
4. Add environment variables from `.env.example`
5. Deploy!

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # User dashboard
│   ├── housing/         # Housing listings & details
│   └── profile/         # User profiles
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── layouts/        # Layout components
│   └── forms/          # Form components
├── lib/                # Utility functions
│   └── prisma.ts       # Prisma client singleton
├── prisma/             # Database schema
├── types/              # TypeScript type definitions
├── auth.ts             # NextAuth configuration
└── middleware.ts       # Next.js middleware
```

## Node Version Note

This project uses versions compatible with Node 18.16+. For best results, upgrade to Node 20+ to use the latest package versions.

## License

Proprietary
