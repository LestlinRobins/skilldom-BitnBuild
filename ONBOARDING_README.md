# AI-Powered Skill Verification & Onboarding System

This document describes the complete onboarding and skill verification system implemented in SkillDOM.

## 🎯 Overview

When users first sign up, they go through a comprehensive onboarding flow where they:

1. Add their technical skills
2. Provide professional profile links (LinkedIn, GitHub, Portfolio)
3. Write a brief bio
4. Get their skills verified by AI using Gemini

The AI analyzes their professional profiles and cross-references claimed skills with evidence from their LinkedIn experience, GitHub repositories, and portfolio projects.

## 🏗️ System Architecture

### Components

1. **OnboardingModal.tsx** - Multi-step onboarding wizard
2. **VerificationBadge.tsx** - Shows verification status throughout the app
3. **geminiService.ts** - AI skill verification service
4. **AuthContext** - Manages onboarding state and user verification status

### Database Schema

New fields added to the `users` table:

```sql
-- Professional profile links
linkedin_url TEXT
github_url TEXT
portfolio_url TEXT
other_links TEXT[] DEFAULT '{}'

-- Verification status
skills_verified BOOLEAN DEFAULT false
verification_status TEXT DEFAULT 'not_started'
  CHECK (verification_status IN ('pending', 'verified', 'partially_verified', 'unverified', 'failed', 'not_started'))
onboarding_completed BOOLEAN DEFAULT false
```

## 🚀 How It Works

### 1. User Registration

- After Firebase auth completes, the system checks if `onboarding_completed` is false
- If so, the OnboardingModal automatically appears

### 2. Onboarding Steps

**Step 1: Skills Collection**

- User adds their technical skills (React, Python, Node.js, etc.)
- Minimum 1 skill required to proceed
- Skills are stored as an array

**Step 2: Professional Links**

- LinkedIn profile URL (optional but recommended)
- GitHub profile URL (optional but recommended)
- Portfolio website URL (optional)
- Other relevant links (Behance, Dribbble, etc.)

**Step 3: Bio**

- Brief description of experience and interests
- 500 character limit
- Used by AI for context during verification

**Step 4: AI Verification**

- Shows loading screen "Verifying with AI..."
- Gemini analyzes all provided links
- Cross-references claimed skills with evidence
- Returns verification results with confidence score

### 3. AI Verification Process

The Gemini service:

1. **Analyzes LinkedIn**: Extracts experience, listed skills, endorsements, projects
2. **Analyzes GitHub**: Reviews repositories, languages used, commit activity, project types
3. **Analyzes Portfolio**: Examines showcased projects and technologies
4. **Cross-references**: Compares claimed skills against evidence found
5. **Scores confidence**: Returns 0-1 confidence score based on evidence quality
6. **Categorizes skills**: Splits into "verified" and "unverified" lists
7. **Provides suggestions**: Offers recommendations for improvement

### 4. Verification Results

Based on the AI analysis:

- **Verified** (>80% confidence): Green badge, full verification
- **Partially Verified** (60-80% confidence): Blue badge, some skills verified
- **Unverified** (<60% confidence): Orange badge, needs more evidence

## 🎨 User Experience

### Visual Indicators

- **Verification badges** appear next to user names throughout the app
- **Profile pages** show detailed verification status
- **User cards** include verification icons
- **Color coding**: Green (verified), Blue (partial), Orange (unverified), Yellow (pending)

### Onboarding Flow UX

- **Progress indicator** shows current step (1-4)
- **Step validation** prevents progression without required data
- **Loading animations** during AI verification
- **Results breakdown** shows which skills were verified
- **Suggestions panel** helps users improve their verification score

## 🔧 Technical Implementation

### Environment Setup

Add to your `.env` file:

```bash
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

Get your API key from: https://aistudio.google.com/app/apikey

### Database Migration

Run the SQL script from `ONBOARDING_MIGRATION.md` in your Supabase SQL editor to add the required fields.

### Service Integration

The system integrates with:

- **Firebase Auth** for user authentication
- **Supabase** for profile storage
- **Gemini AI** for skill verification
- **React Context** for state management

## 📊 Verification Algorithm

### Evidence Sources

1. **LinkedIn Analysis**

   - Job titles and descriptions
   - Listed skills and endorsements
   - Project descriptions
   - Education background

2. **GitHub Analysis**

   - Repository languages and frameworks
   - Commit frequency and recency
   - Project complexity and scope
   - Contribution patterns

3. **Portfolio Analysis**
   - Showcased technologies
   - Project case studies
   - Technical documentation quality
   - Design and development approach

### Scoring Logic

- **High Confidence (80-100%)**: Multiple evidence sources confirm the skill
- **Medium Confidence (60-79%)**: Some evidence found but limited depth
- **Low Confidence (0-59%)**: Little to no supporting evidence

### Fallback Handling

- **API failures**: Graceful degradation with basic validation
- **Network issues**: Retry logic with exponential backoff
- **Rate limiting**: Queue system for verification requests
- **Invalid profiles**: Clear error messages and guidance

## 🔒 Privacy & Security

- **No credential storage**: Only analyzes public profile information
- **User consent**: Clear explanation of what data is analyzed
- **Data retention**: Verification results cached for performance
- **Rate limiting**: Prevents abuse of AI services

## 🚀 Future Enhancements

- **Re-verification**: Allow users to update and re-verify skills
- **Skill recommendations**: AI suggests relevant skills to add
- **Verification expiry**: Skills verified within last 12 months
- **Team verification**: Cross-reference with team member endorsements
- **Integration expansion**: Add more platforms (Stack Overflow, Behance, etc.)

## 🐛 Troubleshooting

### Common Issues

1. **Verification fails**: Check API key configuration
2. **Modal doesn't appear**: Verify onboarding_completed field in database
3. **Skills not saving**: Check Supabase permissions and connection
4. **Badges not showing**: Ensure verification_status field is properly set

### Debug Mode

Set `NODE_ENV=development` to use the demo verification service that simulates AI analysis without API calls.

## 📈 Analytics & Monitoring

Track these metrics:

- Onboarding completion rate
- Average verification confidence scores
- Most commonly verified/unverified skills
- Time spent in onboarding flow
- Drop-off points in the process

---

This system creates a trustworthy skill verification process that helps build confidence in the SkillDOM community while providing users with valuable feedback on their professional profiles.
