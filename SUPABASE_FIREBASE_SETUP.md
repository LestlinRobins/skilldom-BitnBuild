# Firebase Authentication + Supabase Database Setup Guide

This project uses Firebase for authentication and Supabase for database operations. This hybrid approach gives you the best of both worlds:

- Firebase's robust authentication system
- Supabase's excellent PostgreSQL database with real-time features

## Prerequisites

- Node.js and npm installed
- Google account (for Firebase)
- GitHub account (for Supabase - optional but recommended)

## Part 1: Firebase Setup (Authentication)

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "skilldom-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Configure Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click on the "Get started" button
3. Go to the "Sign-in method" tab
4. Enable the following sign-in providers:
   - **Email/Password**: Click on it, toggle "Enable", and save
   - **Google**: Click on it, toggle "Enable", enter your project support email, and save

### Step 3: Register Your Web App

1. In the Firebase project overview, click on the web icon (`</>`)
2. Register your app with a nickname (e.g., "Skilldom Web App")
3. Don't check "Also set up Firebase Hosting" for now
4. Click "Register app"
5. Copy the Firebase configuration object

## Part 2: Supabase Setup (Database)

### Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or create an account
4. Click "New Project"
5. Choose your organization (or create one)
6. Enter project details:
   - **Name**: skilldom-db (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
7. Click "Create new project"
8. Wait for the project to be ready (usually takes 1-2 minutes)

### Step 2: Get Supabase Configuration

1. Once your project is ready, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon public** key (the `anon` key, not the `service_role` key)

### Step 3: Create Database Tables

1. In your Supabase project, go to the "SQL Editor"
2. Click "New Query"
3. Paste and run the following SQL to create the required tables:

```sql
-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Firebase UID (not UUID format)
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  skill_coins INTEGER DEFAULT 500,
  ongoing_courses TEXT[] DEFAULT '{}',
  completed_courses TEXT[] DEFAULT '{}',
  collaborations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user reviews table
CREATE TABLE user_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,  -- Firebase UID
  reviewer_id TEXT REFERENCES users(id) ON DELETE CASCADE,  -- Firebase UID
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read all user profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Create policies for user_reviews table
CREATE POLICY "Anyone can read reviews" ON user_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON user_reviews
  FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id);

CREATE POLICY "Users can update own reviews" ON user_reviews
  FOR UPDATE USING (auth.uid()::text = reviewer_id);
```

### ⚠️ If You Already Created the Tables with UUID

If you already created the tables and are getting the UUID error, run this migration to fix it:

```sql
-- Drop existing foreign key constraints
ALTER TABLE user_reviews DROP CONSTRAINT IF EXISTS user_reviews_user_id_fkey;
ALTER TABLE user_reviews DROP CONSTRAINT IF EXISTS user_reviews_reviewer_id_fkey;

-- Alter the users table id column to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- Alter the user_reviews foreign key columns to TEXT
ALTER TABLE user_reviews ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_reviews ALTER COLUMN reviewer_id TYPE TEXT;

-- Re-add the foreign key constraints
ALTER TABLE user_reviews ADD CONSTRAINT user_reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_reviews ADD CONSTRAINT user_reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Step 4: Set Up Row Level Security (RLS) Policies

The SQL above includes basic RLS policies. You can modify them later in the Supabase dashboard under "Authentication" → "Policies".

## Part 3: Environment Configuration

### Step 1: Create Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Replace the placeholder values with your actual configurations:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-actual-measurement-id

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

## Part 4: Development Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

## Part 5: How It Works

### Authentication Flow

1. **User Registration/Login**: Handled by Firebase Authentication
2. **User Profile Creation**: After successful Firebase auth, profile is stored in Supabase
3. **Session Management**: Firebase manages the session, Supabase stores user data

### Database Operations

- **User Profiles**: Stored in Supabase `users` table
- **User Reviews**: Stored in Supabase `user_reviews` table
- **Real-time Features**: Available through Supabase subscriptions
- **Advanced Queries**: Powered by PostgreSQL

### Benefits of This Architecture

✅ **Firebase Authentication**: Industry-standard, secure authentication
✅ **Supabase Database**: PostgreSQL with real-time capabilities
✅ **Scalable**: Both services scale automatically
✅ **Type-safe**: Full TypeScript support
✅ **Real-time**: Supabase provides real-time subscriptions
✅ **Cost-effective**: Generous free tiers from both services

## Part 6: Testing the Setup

### Test Authentication:

1. **Email/Password Sign-up**: Create account with email/password
2. **Email/Password Sign-in**: Login with created credentials
3. **Google Sign-in**: Use Google authentication

### Test Database:

1. Check Supabase dashboard → Table editor → `users` table
2. Verify user profiles are created after authentication
3. Test user profile updates through the app

## Part 7: Security Considerations

### Firebase Security:

- Authentication rules are handled by Firebase
- Only authenticated users can access protected routes

### Supabase Security:

- Row Level Security (RLS) is enabled
- Users can only modify their own profiles
- Public read access for user discovery features

## Part 8: Troubleshooting

### Common Issues:

1. **"Supabase URL or key missing"**

   - Check your `.env` file
   - Restart development server after adding env variables

2. **"User profile not found"**

   - Verify Supabase tables are created correctly
   - Check if user was successfully created in Supabase dashboard

3. **RLS policy violations**

   - Check Supabase → Authentication → Policies
   - Ensure policies allow the operations you're trying to perform

4. **Firebase auth errors**
   - Verify Firebase configuration
   - Check Firebase console for authorized domains

### Database Management:

- **View Data**: Supabase Dashboard → Table Editor
- **Query Data**: Supabase Dashboard → SQL Editor
- **Monitor**: Supabase Dashboard → Logs

## Part 9: Next Steps

### Recommended Enhancements:

- Set up Supabase real-time subscriptions for live updates
- Add email verification through Firebase
- Implement password reset functionality
- Add more user profile fields as needed
- Set up Supabase Edge Functions for complex operations
- Configure Supabase Storage for file uploads (avatars, etc.)

### Production Considerations:

- Update RLS policies for production requirements
- Set up proper backup strategies
- Configure monitoring and alerting
- Implement proper error handling and logging
