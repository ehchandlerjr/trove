# Trove — The Notion of Gift Apps

A beautiful wishlist application with crowdsourced HTML mapping. Built with Next.js 15, Supabase, and Thomistic design principles.

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Add your Supabase credentials to .env.local
# (See "Setting Up Supabase" below)

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

---

# COMPLETE SETUP GUIDE

## Part 1: Setting Up Supabase (Database + Auth)

Supabase provides your database and authentication—completely free for small projects.

### Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project** → **Sign up with GitHub**
3. Authorize Supabase

### Step 2: Create a New Project

1. Click **New Project**
2. Enter:
   - **Name**: `trove` (or whatever you like)
   - **Database Password**: Generate a strong one and save it
   - **Region**: Choose closest to you
3. Click **Create new project**
4. Wait 2-3 minutes for setup

### Step 3: Set Up the Database Schema

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `/supabase/schema.sql` from this project
4. Copy the entire contents and paste into the SQL editor
5. Click **Run** (or Cmd/Ctrl+Enter)
6. You should see "Success. No rows returned"

### Step 4: Get Your API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 5: Configure Environment Variables

1. In your project folder, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and add your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Part 2: Version Control with GitHub

### Step 1: Install Git

**Mac:**
```bash
# Check if installed
git --version
# If not, you'll be prompted to install Xcode Command Line Tools
```

**Windows:**
Download from [git-scm.com/download/win](https://git-scm.com/download/win)

### Step 2: Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Name: `trove`
4. Keep it **Public** (required for free Vercel hosting)
5. **Don't** add README (we have our own)
6. Click **Create repository**

### Step 4: Push Your Code

```bash
cd /path/to/trove

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Trove gift app"

# Connect to GitHub (replace YOUR-USERNAME)
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/trove.git

# Push
git push -u origin main
```

---

## Part 3: Deploy to Vercel (Free Hosting)

Vercel is the company behind Next.js—deploying there is seamless.

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel

### Step 2: Import Your Project

1. Click **Add New...** → **Project**
2. Find your `trove` repository and click **Import**
3. **Configure Environment Variables**:
   - Click **Environment Variables**
   - Add:
     - Name: `NEXT_PUBLIC_SUPABASE_URL` → Value: (your URL)
     - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value: (your key)
4. Click **Deploy**
5. Wait 2-3 minutes

Your site is now live at `https://trove-xxxxx.vercel.app`!

### Custom Domain (Optional)

1. Buy a domain (~$10-15/year) from Namecheap, Porkbun, or Google Domains
2. In Vercel, go to your project → **Settings** → **Domains**
3. Add your domain and follow DNS instructions

---

## Part 4: Configure Supabase for Production

### Step 1: Update Auth Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/callback`

### Step 2: Enable Email Auth (Optional)

1. Go to **Authentication** → **Providers**
2. Email is enabled by default
3. For social logins (Google, etc.), follow Supabase docs

---

## Project Structure

```
trove/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/              # Protected routes (dashboard, lists, etc.)
│   │   ├── (auth)/             # Auth routes (login, signup)
│   │   ├── api/                # API routes
│   │   └── share/              # Public sharing routes
│   ├── components/
│   │   ├── ui/                 # Design system components
│   │   ├── features/           # Feature components
│   │   ├── brand/              # Logo/branding components
│   │   └── providers/          # Context providers
│   └── lib/                    # Utilities and types
├── extension/                  # Chrome extension
├── extension-firefox/          # Firefox extension
├── supabase/                   # Database schema
└── docs/                       # Documentation
```

---

## Key Features

- **Four Themes**: Vellum (Vatican warmth), Obsidian (candlelit study), Vesper (Nordic clarity), Scriptorium (cathedral grove)
- **Treasure Chest Logos**: View at `/logos` — distinct chest designs for each theme with Tau keyholes
- **Crowdsourced HTML Mapping**: Teach Trove to understand any website
- **Browser Extensions**: Add items from any product page
- **Shared Lists**: Share wishlists via unique codes
- **Claim System**: Gift givers can claim items secretly

---

## Logo System

The app includes themed treasure chest logos at `/logos`:

| Theme | Chest Style | Vibe |
|-------|-------------|------|
| **Vellum** | Book-binding corners, horizontal bands | Vatican Library warmth |
| **Obsidian** | Angular jewel box, brass studs | Candlelit study |
| **Vesper** | Minimal rectangle, soft corners | Nordic sanctuary |
| **Scriptorium** | Organic dome, wood grain | Cathedral grove |

Each chest features a Tau (T) keyhole—dual purpose as "T for Trove" branding and subtle Franciscan symbolism.

---

## Development Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run typecheck # Check TypeScript types
```

---

## Making Changes

1. Edit files locally
2. Preview with `npm run dev`
3. When ready:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel automatically redeploys in ~1 minute

---

## Troubleshooting

**"Cannot find module" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection errors:**
- Verify your `.env.local` has correct values
- Check Supabase dashboard → **Settings** → **API** for correct keys

**Build fails on Vercel:**
- Check Vercel deployment logs
- Ensure environment variables are set in Vercel dashboard
- Run `npm run build` locally first to catch errors

**Auth redirect errors:**
- Update Supabase URL Configuration with your Vercel domain
- Clear browser cookies and try again

---

## Documentation

- **`/CLAUDE.md`** — Development context and current state
- **`/docs/PRODUCT_SPEC.md`** — Complete feature specification
- **`/docs/ROADMAP.md`** — Development roadmap (concentric circles)
- **`/docs/TEACH_SITE_GUIDE.md`** — Site compatibility guide

---

## License

MIT — do whatever you want with it.

---

Built with Thomistic beauty principles: integritas, consonantia, claritas.

"Beauty is the splendor of truth."
