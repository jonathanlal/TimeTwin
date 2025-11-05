# TimeTwin — Monorepo

Cross-platform time tracking app with React Native (Expo) mobile app, Next.js web app, and Supabase backend.

## 🚀 Tech Stack

- **Mobile**: React Native 0.75 + Expo 51 + React Native components
- **Web**: Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Monorepo**: pnpm workspaces + Turbo
- **Language**: TypeScript (strict mode)

---

## 📋 Prerequisites

### Windows Setup

1. **Node.js 20+**
   ```powershell
   # Download from https://nodejs.org/
   # Or use winget:
   winget install OpenJS.NodeJS.LTS
   ```

2. **pnpm 9+**
   ```powershell
   npm install -g pnpm@9
   ```

3. **Git**
   ```powershell
   winget install Git.Git
   ```

4. **Supabase CLI** (optional for local development)
   ```powershell
   # Using npm:
   npm install -g supabase
   ```

5. **Expo CLI** (for mobile development)
   ```powershell
   npm install -g expo-cli eas-cli
   ```

6. **Android Studio** (for Android development)
   - Download from https://developer.android.com/studio
   - Install Android SDK
   - Set up Android emulator

7. **(Optional) iOS Development**
   - Requires macOS with Xcode
   - Windows can use Expo Go app for testing

---

## 🛠 Installation

### 1. Clone the Repository

```powershell
git clone https://github.com/yourusername/TimeTwin.git
cd TimeTwin
```

### 2. Install Dependencies

```powershell
pnpm install
```

This will install all dependencies for all workspace packages.

### 3. Configure Environment Variables

#### For Web App (`apps/web`)

```powershell
cd apps/web
copy .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### For Mobile App (`apps/mobile`)

```powershell
cd apps/mobile
copy .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Supabase Database

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from Project Settings > API
3. Apply the database migration:

```powershell
# Using Supabase CLI
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" --file .\infra\supabase\migrations\0001_init.sql

# Or use the Supabase dashboard SQL editor and paste the migration file
```

---

## 🏃‍♂️ Running the Apps

### Web Application

```powershell
# From root directory
cd apps/web
pnpm dev
```

Open http://localhost:3000 in your browser.

**Available pages:**
- `/` - Landing page
- `/leaderboard` - Global leaderboard
- `/login` - Login page
- `/signup` - Signup page

### Mobile Application

```powershell
# From root directory
cd apps/mobile
pnpm start
```

This will open the Expo development server. Options:
- Press `a` - Open Android emulator
- Press `i` - Open iOS simulator (macOS only)
- Press `w` - Open in web browser
- Scan QR code with Expo Go app on your phone

---

## 📁 Project Structure

```
TimeTwin/
├── apps/
│   ├── mobile/              # Expo/React Native mobile app
│   │   ├── app/            # Expo Router pages
│   │   │   ├── (auth)/     # Auth flow (login, signup)
│   │   │   ├── (tabs)/     # Main app tabs (timer, leaderboard, profile)
│   │   │   └── _layout.tsx # Root layout with providers
│   │   ├── src/
│   │   │   ├── config/     # Environment configuration
│   │   │   └── contexts/   # React contexts (Auth)
│   │   ├── .env.example    # Environment template
│   │   └── package.json
│   │
│   └── web/                 # Next.js web application
│       ├── src/
│       │   ├── app/        # Next.js app router pages
│       │   ├── components/ # React components
│       │   │   └── ui/     # shadcn/ui components
│       │   └── lib/        # Utilities
│       ├── .env.example    # Environment template
│       ├── tailwind.config.js  # Tailwind v4 config
│       └── package.json
│
├── packages/
│   ├── api-sdk/            # Supabase API SDK
│   │   └── src/
│   │       ├── auth.ts     # Authentication helpers
│   │       ├── captures.ts # Capture operations
│   │       ├── profiles.ts # Profile management
│   │       ├── leaderboard.ts # Leaderboard queries
│   │       └── types/      # TypeScript types
│   │
│   ├── theme/              # Shared theme tokens (for mobile)
│   │   └── src/
│   │       ├── colors.ts   # Color palette
│   │       ├── typography.ts # Typography scales
│   │       └── spacing.ts  # Spacing tokens
│   │
│   ├── ui/                 # React Native components (for mobile)
│   │   └── src/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       └── ...
│   │
│   └── config/             # Shared configs
│       ├── tsconfig.base.json
│       └── .eslintrc.cjs
│
├── infra/
│   └── supabase/
│       └── migrations/
│           └── 0001_init.sql  # Database schema
│
├── .github/
│   └── workflows/          # CI/CD pipelines
│
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # Workspace configuration
└── turbo.json              # Turbo build configuration
```

---

## 🔧 Available Scripts

### Root Scripts

```powershell
# Install all dependencies
pnpm install

# Run linting across all packages
pnpm run lint

# Build all packages
pnpm run build

# Run tests (when implemented)
pnpm run test
```

### Web App Scripts

```powershell
cd apps/web

# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Mobile App Scripts

```powershell
cd apps/mobile

# Start Expo development server
pnpm start

# Run on Android
pnpm android

# Run on iOS (macOS only)
pnpm ios

# Run in web browser
pnpm web

# Type checking
pnpm type-check

# Linting
pnpm lint
```

---

## 🗄️ Database Schema

The database includes:

### Tables
- **profiles** - User profiles with username, country, timezone, privacy settings
- **captures** - Time capture records with auto-generated hour/minute labels
- **daily_stats** - Aggregated daily statistics per user
- **countries** - Country lookup table

### Views
- **v_leaderboard_total** - Global leaderboard ranked by captures
- **v_country_stats** - Statistics aggregated by country

### Functions
- **record_capture()** - RPC function to record a capture with validation

### Row Level Security (RLS)
- Users can only modify their own data
- Public profiles are visible to all
- Private profiles only visible to owner

---

## 🎨 UI Components

### Web (shadcn/ui + Tailwind CSS v4)
- Button, Card, Input, Label
- Fully accessible (WAI-ARIA)
- Responsive design
- Dark mode support

### Mobile (Custom React Native)
- Button, Card, Input, Text, Container, Loading
- Theme-aware styling
- Cross-platform compatible

---

## 🚢 Deployment

### Web Application (Vercel)

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
cd apps/web
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

**Environment Variables:**
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel dashboard

### Mobile Application (Expo EAS)

```powershell
# Login to Expo
eas login

# Configure project
cd apps/mobile
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit
```

---

## 📝 Environment Variables Reference

### Required for Both Apps

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard > Settings > API |

### Optional CI/CD

| Variable | Description |
|----------|-------------|
| `SUPABASE_DB_URL_PROD` | Database connection string |
| `SUPABASE_SERVICE_ROLE_KEY_PROD` | Service role key (private) |
| `EAS_TOKEN` | Expo EAS token |
| `VERCEL_TOKEN` | Vercel deployment token |

---

## 🐛 Troubleshooting

### Windows Specific Issues

**Issue: PowerShell execution policy errors**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Issue: Long path errors on Windows**
```powershell
git config --system core.longpaths true
```

**Issue: Node-gyp build errors**
- Install Windows Build Tools:
```powershell
npm install -g windows-build-tools
```

### Common Issues

**Issue: pnpm install fails**
- Clear cache: `pnpm store prune`
- Delete `node_modules` and `pnpm-lock.yaml`, then reinstall

**Issue: Supabase connection fails**
- Verify URL and anon key in `.env` files
- Check network/firewall settings
- Ensure database migration is applied

**Issue: Expo app won't start**
- Clear Expo cache: `expo start -c`
- Restart Metro bundler
- Check `app.json` configuration

---

## 📚 Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## 📄 License

[Your License Here]
