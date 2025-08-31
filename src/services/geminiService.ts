// Gemini AI Service for Skills Verification
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface VerificationResult {
  isVerified: boolean;
  confidence: number; // 0-1 scale
  verifiedSkills: string[];
  unverifiedSkills: string[];
  suggestions: string[];
  reasoning: string;
}

export interface VerificationData {
  claimedSkills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  otherLinks?: string[];
  name: string;
  bio?: string;
}

// Scrape and analyze LinkedIn profile (simulated - in real app you'd use LinkedIn API)
async function analyzeLinkedInProfile(url: string): Promise<string> {
  // In a real implementation, you would:
  // 1. Use LinkedIn API or web scraping
  // 2. Extract profile information, experience, skills, endorsements
  // For now, we'll simulate this

  try {
    // This is a simulation - replace with actual LinkedIn API or scraping
    return `LinkedIn Profile Analysis:
    - Experience in software development for 3+ years
    - Listed skills: JavaScript, React, Node.js, Python, Machine Learning
    - Endorsements for: React (15), JavaScript (12), Python (8)
    - Recent positions: Frontend Developer at Tech Corp, Full Stack Developer at StartupXYZ
    - Education: Computer Science degree
    - Projects mentioned: E-commerce platform, ML recommendation system`;
  } catch (error) {
    return `Could not analyze LinkedIn profile: ${url}`;
  }
}

// Analyze GitHub profile and repositories
async function analyzeGitHubProfile(url: string): Promise<string> {
  try {
    // Extract username from GitHub URL
    const username = url.split("github.com/")[1]?.split("/")[0];
    if (!username) return "Invalid GitHub URL";

    // In production, use GitHub API
    // For now, simulate GitHub analysis
    return `GitHub Analysis for ${username}:
    - Active repositories: 25+ repos
    - Primary languages: JavaScript (40%), Python (30%), TypeScript (20%)
    - Recent activity: Regular commits over past 6 months
    - Notable projects: React e-commerce app, Python ML model, Node.js API
    - Contributions to open source: 5+ repositories
    - Followers: 50+, Following: 30
    - Stars received: 100+ across repositories`;
  } catch (error) {
    return `Could not analyze GitHub profile: ${url}`;
  }
}

// Analyze portfolio website
async function analyzePortfolio(url: string): Promise<string> {
  try {
    // In production, you would scrape the portfolio website
    // For now, simulate portfolio analysis
    return `Portfolio Analysis:
    - Professional portfolio showcasing 8+ projects
    - Technologies demonstrated: React, Vue, Node.js, Python, AWS
    - Project categories: Web Development, Mobile Apps, Data Science
    - Case studies show problem-solving approach
    - Contact information and testimonials present
    - Clean, professional design indicating UI/UX skills`;
  } catch (error) {
    return `Could not analyze portfolio: ${url}`;
  }
}

// Main skill verification function using Gemini AI
export async function verifySkillsWithAI(
  data: VerificationData
): Promise<VerificationResult> {
  try {
    // Gather evidence from all sources
    const evidence = [];

    if (data.linkedinUrl) {
      const linkedinData = await analyzeLinkedInProfile(data.linkedinUrl);
      evidence.push(`LINKEDIN DATA:\n${linkedinData}`);
    }

    if (data.githubUrl) {
      const githubData = await analyzeGitHubProfile(data.githubUrl);
      evidence.push(`GITHUB DATA:\n${githubData}`);
    }

    if (data.portfolioUrl) {
      const portfolioData = await analyzePortfolio(data.portfolioUrl);
      evidence.push(`PORTFOLIO DATA:\n${portfolioData}`);
    }

    // Create the prompt for Gemini
    const prompt = `
You are an AI skill verifier. Analyze the provided evidence and determine if the user's claimed skills are legitimate.

USER PROFILE:
- Name: ${data.name}
- Bio: ${data.bio || "No bio provided"}
- Claimed Skills: ${data.claimedSkills.join(", ")}

EVIDENCE GATHERED:
${evidence.join("\n\n")}

ANALYSIS INSTRUCTIONS:
1. Compare claimed skills against evidence from LinkedIn, GitHub, and portfolio
2. Look for consistency between claimed skills and demonstrated work
3. Consider the depth of evidence for each skill (beginner vs expert level)
4. Identify any skills that lack supporting evidence
5. Suggest additional skills that are evident but not claimed

Respond in JSON format:
{
  "isVerified": boolean,
  "confidence": number (0-1),
  "verifiedSkills": ["skill1", "skill2"],
  "unverifiedSkills": ["skill3"],
  "suggestions": ["Consider adding skill4", "Update skill5 level"],
  "reasoning": "Detailed explanation of verification decision"
}

Be thorough but fair in your assessment. A skill should be verified if there's reasonable evidence of its use, even at a beginner level.
`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    try {
      const verification = JSON.parse(text);

      // Validate the response structure
      if (typeof verification.isVerified !== "boolean") {
        throw new Error("Invalid response format");
      }

      return {
        isVerified: verification.isVerified,
        confidence: Math.max(0, Math.min(1, verification.confidence || 0)),
        verifiedSkills: Array.isArray(verification.verifiedSkills)
          ? verification.verifiedSkills
          : [],
        unverifiedSkills: Array.isArray(verification.unverifiedSkills)
          ? verification.unverifiedSkills
          : [],
        suggestions: Array.isArray(verification.suggestions)
          ? verification.suggestions
          : [],
        reasoning: verification.reasoning || "No reasoning provided",
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);

      // Fallback verification based on simple heuristics
      return {
        isVerified: evidence.length > 0,
        confidence: evidence.length > 1 ? 0.7 : 0.4,
        verifiedSkills: data.claimedSkills.slice(
          0,
          Math.max(1, Math.floor(data.claimedSkills.length * 0.8))
        ),
        unverifiedSkills: data.claimedSkills.slice(
          Math.floor(data.claimedSkills.length * 0.8)
        ),
        suggestions: [
          "Complete your profile with more detailed project descriptions",
        ],
        reasoning:
          "AI verification service encountered an error, using fallback verification method.",
      };
    }
  } catch (error) {
    console.error("Skill verification failed:", error);

    // Return a failed verification result
    return {
      isVerified: false,
      confidence: 0,
      verifiedSkills: [],
      unverifiedSkills: data.claimedSkills,
      suggestions: [
        "Please ensure all profile links are accessible and try again",
      ],
      reasoning: `Verification failed due to technical error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Simplified verification for development/testing
export async function verifySkillsDemo(
  data: VerificationData
): Promise<VerificationResult> {
  // Simulate AI processing time
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  const hasLinkedIn = Boolean(data.linkedinUrl);
  const hasGitHub = Boolean(data.githubUrl);
  const hasPortfolio = Boolean(data.portfolioUrl);

  const evidenceScore = [hasLinkedIn, hasGitHub, hasPortfolio].filter(
    Boolean
  ).length;
  const skillCount = data.claimedSkills.length;

  // Mock verification logic
  const confidence = Math.min(
    0.95,
    (evidenceScore / 3) * 0.6 + (skillCount > 0 ? 0.3 : 0) + Math.random() * 0.1
  );
  const isVerified = confidence > 0.6;

  const verifiedCount = Math.floor(
    skillCount * (isVerified ? confidence : confidence * 0.5)
  );
  const verifiedSkills = data.claimedSkills.slice(0, verifiedCount);
  const unverifiedSkills = data.claimedSkills.slice(verifiedCount);

  return {
    isVerified,
    confidence,
    verifiedSkills,
    unverifiedSkills,
    suggestions: [
      ...(hasLinkedIn
        ? []
        : ["Add your LinkedIn profile to increase verification confidence"]),
      ...(hasGitHub ? [] : ["Connect your GitHub to showcase your code"]),
      ...(hasPortfolio
        ? []
        : ["Add a portfolio website to demonstrate your work"]),
      "Consider adding specific project examples for each skill",
    ],
    reasoning: isVerified
      ? `Skills verification successful. Found strong evidence for ${verifiedCount}/${skillCount} claimed skills across ${evidenceScore} platform(s).`
      : `Verification incomplete. Need more evidence for ${unverifiedSkills.length} skills. Consider adding more detailed profiles or project links.`,
  };
}
