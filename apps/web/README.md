# TimeTwin Web Application

Next.js 15 web application for TimeTwin, built with shadcn/ui components and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (via @timetwin/api-sdk)
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   ├── leaderboard/  # Leaderboard page
│   ├── login/        # Login page
│   └── signup/       # Signup page
├── components/
│   └── ui/           # shadcn/ui components
├── lib/
│   └── utils.ts      # Utility functions
```

## Features

- ✅ Landing page with hero and features
- ✅ Global leaderboard view
- ✅ Authentication pages (login/signup)
- ✅ Responsive design
- ✅ Dark mode support (via Tailwind)
- ✅ Type-safe API integration

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components:

- Button
- Card
- Input
- Label

To add more components, follow the shadcn/ui documentation.

## Deployment

The app is optimized for deployment on [Vercel](https://vercel.com):

```bash
vercel
```

Or use the included GitHub Actions workflow for automatic deployments.
