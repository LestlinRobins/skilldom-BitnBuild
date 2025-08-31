# Firebase Authentication Setup Instructions

## Prerequisites

1. You need a Google account
2. Node.js and npm should be installed

## Firebase Console Setup

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

### Step 4: Set Up Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-actual-measurement-id
```

### Step 5: Configure Firestore Database

1. In Firebase Console, click on "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for now (you can change rules later)
4. Select a location close to your users
5. Click "Done"

### Step 6: Set Up Security Rules (Optional but Recommended)

Replace the default Firestore rules with these more secure ones:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // All authenticated users can read user profiles (for collaboration features)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Local Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your `.env` file with the Firebase configuration

3. Start the development server:
   ```bash
   npm run dev
   ```

## Features Implemented

✅ **Email/Password Authentication**

- User registration with email and password
- User login with email and password
- Automatic user profile creation in Firestore

✅ **Google Authentication**

- One-click Google sign-in
- Automatic user profile creation for new Google users
- Profile sync with Google account info

✅ **User Profile Management**

- User data stored in Firestore
- Skills tracking
- Skill coins system
- Course progress tracking

✅ **Authentication State Management**

- Persistent login sessions
- Automatic authentication state detection
- Protected routes

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**

   - Make sure your `.env` file is properly configured
   - Restart your development server after adding environment variables

2. **"Firebase: Error (auth/unauthorized-domain)"**

   - In Firebase Console, go to Authentication → Settings → Authorized domains
   - Add `localhost` for development

3. **Google Sign-in popup blocked**

   - Make sure popups are enabled in your browser
   - Try signing in from an incognito/private window

4. **Firestore permission denied**
   - Check your Firestore security rules
   - Make sure the user is authenticated before accessing Firestore

### Testing the Authentication:

1. **Email/Password Sign-up:**

   - Go to the sign-up tab
   - Enter a name, email, password, and skills
   - Click "Create Account"

2. **Email/Password Sign-in:**

   - Use the email and password you created
   - Click "Sign In"

3. **Google Sign-in:**
   - Click "Continue with Google"
   - Choose your Google account
   - Grant necessary permissions

## Next Steps

- Set up proper Firestore security rules for production
- Add email verification
- Implement password reset functionality
- Add more OAuth providers (GitHub, Facebook, etc.)
- Set up Firebase hosting for deployment
