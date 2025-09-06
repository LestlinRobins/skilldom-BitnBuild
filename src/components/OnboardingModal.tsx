import React, { useState, useEffect } from "react";
import {
  X,
  Linkedin,
  Github,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile } from "../services/supabaseService";
import {
  verifySkillsDemo,
  VerificationResult,
} from "../services/geminiService";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface OnboardingData {
  skills: string[];
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  otherLinks: string[];
  bio: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  const [data, setData] = useState<OnboardingData>({
    skills: [],
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    otherLinks: [],
    bio: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newLink, setNewLink] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setData({
        skills: [],
        linkedinUrl: "",
        githubUrl: "",
        portfolioUrl: "",
        otherLinks: [],
        bio: "",
      });
      setVerificationResult(null);
    }
  }, [isOpen]);

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addOtherLink = () => {
    if (newLink.trim() && !data.otherLinks.includes(newLink.trim())) {
      setData((prev) => ({
        ...prev,
        otherLinks: [...prev.otherLinks, newLink.trim()],
      }));
      setNewLink("");
    }
  };

  const removeOtherLink = (index: number) => {
    setData((prev) => ({
      ...prev,
      otherLinks: prev.otherLinks.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleVerifySkills = async () => {
    if (!user) return;

    setIsVerifying(true);
    try {
      const result = await verifySkillsDemo({
        claimedSkills: data.skills,
        linkedinUrl: data.linkedinUrl || undefined,
        githubUrl: data.githubUrl || undefined,
        portfolioUrl: data.portfolioUrl || undefined,
        otherLinks: data.otherLinks.length > 0 ? data.otherLinks : undefined,
        name: user.name || user.email || "Unknown User",
        bio: data.bio || undefined,
      });

      setVerificationResult(result);
      setStep(4); // Move to verification results step
    } catch (error) {
      console.error("Skill verification failed:", error);
      // You could show an error message here
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !verificationResult) return;

    setIsSubmitting(true);
    try {
      await updateUserProfile(user.id, {
        linkedin_url: data.linkedinUrl || null,
        github_url: data.githubUrl || null,
        portfolio_url: data.portfolioUrl || null,
        other_links: data.otherLinks.length > 0 ? data.otherLinks : undefined,
        skills_verified: verificationResult.isVerified,
        verification_status: verificationResult.isVerified
          ? "verified"
          : "failed",
        onboarding_completed: true,
        bio: data.bio || null,
      });

      // Update user context with verification status
      updateUser({
        ...user,
        linkedin_url: data.linkedinUrl || null,
        github_url: data.githubUrl || null,
        portfolio_url: data.portfolioUrl || null,
        other_links: data.otherLinks.length > 0 ? data.otherLinks : undefined,
        skills_verified: verificationResult.isVerified,
        verification_status: verificationResult.isVerified
          ? "verified"
          : "failed",
        onboarding_completed: true,
      });

      onComplete();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // You could show an error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-primary-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-800">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Complete Your Profile
            </h2>
            <p className="text-primary-300 mt-1">
              Help us verify your skills and showcase your expertise
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-primary-400 hover:text-primary-200 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-primary-800">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber < step
                      ? "bg-accent-600 text-white"
                      : stepNumber === step
                      ? "bg-primary-900 text-accent-500 border-2 border-accent-600"
                      : "bg-primary-800 text-primary-400"
                  }`}
                >
                  {stepNumber < step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      stepNumber < step ? "bg-accent-600" : "bg-primary-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-primary-400 mt-2">
            <span>Skills</span>
            <span>Links</span>
            <span>Bio</span>
            <span>Verify</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* Step 1: Skills */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  What are your skills?
                </h3>
                <p className="text-primary-300 mb-4">
                  Add your technical skills, programming languages, frameworks,
                  and tools.
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter a skill (e.g., React, Python, Node.js)"
                    className="flex-1 px-3 py-2 bg-primary-900 border border-primary-700 rounded-md text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {data.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-accent-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-accent-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {data.skills.length === 0 && (
                  <p className="text-primary-400 text-sm">
                    No skills added yet. Add at least 3-5 skills to get better
                    verification results.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Professional Links */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Professional Links
                </h3>
                <p className="text-primary-300 mb-4">
                  Add your professional profiles to help verify your skills.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-primary-300 mb-2">
                      <Linkedin className="w-4 h-4 text-accent-500" />
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={data.linkedinUrl}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          linkedinUrl: e.target.value,
                        }))
                      }
                      placeholder="https://linkedin.com/in/yourname"
                      className="w-full px-3 py-2 bg-primary-900 border border-primary-700 rounded-md text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-primary-300 mb-2">
                      <Github className="w-4 h-4 text-primary-300" />
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      value={data.githubUrl}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          githubUrl: e.target.value,
                        }))
                      }
                      placeholder="https://github.com/yourusername"
                      className="w-full px-3 py-2 bg-primary-900 border border-primary-700 rounded-md text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-primary-300 mb-2">
                      <Globe className="w-4 h-4 text-success-500" />
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      value={data.portfolioUrl}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          portfolioUrl: e.target.value,
                        }))
                      }
                      placeholder="https://yourportfolio.com"
                      className="w-full px-3 py-2 bg-primary-900 border border-primary-700 rounded-md text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-primary-300 mb-2 block">
                      Other Links
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        placeholder="https://your-other-profile.com"
                        className="flex-1 px-3 py-2 bg-primary-900 border border-primary-700 rounded-md text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        onKeyDown={(e) => e.key === "Enter" && addOtherLink()}
                      />
                      <button
                        onClick={addOtherLink}
                        className="px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {data.otherLinks.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-primary-900 border border-primary-700 px-3 py-2 rounded-md text-sm mb-2"
                      >
                        <span className="flex-1 truncate text-white">
                          {link}
                        </span>
                        <button
                          onClick={() => removeOtherLink(index)}
                          className="text-error-400 hover:text-error-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Bio */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Tell us about yourself
                </h3>
                <p className="text-primary-300 mb-4">
                  Write a brief bio highlighting your experience and interests.
                </p>

                <textarea
                  value={data.bio}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="I'm a passionate software developer with experience in web development and machine learning. I love building innovative solutions and contributing to open-source projects..."
                  className="w-full px-3 py-2 bg-primary-900 border border-primary-700 rounded-md text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent h-32 resize-none"
                  maxLength={500}
                />
                <p className="text-sm text-primary-400 mt-1">
                  {data.bio.length}/500 characters
                </p>
              </div>

              <div className="bg-accent-600 bg-opacity-20 border border-accent-600 border-opacity-30 p-4 rounded-md">
                <h4 className="font-medium text-accent-400 mb-2">
                  Ready for verification?
                </h4>
                <p className="text-accent-300 text-sm">
                  We'll use AI to verify your skills against your professional
                  profiles. This helps build trust in the SkillDOM community.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Verification Results */}
          {step === 4 && verificationResult && (
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    verificationResult.isVerified
                      ? "bg-success-600 bg-opacity-20 text-success-400 border border-success-600 border-opacity-30"
                      : "bg-warning-600 bg-opacity-20 text-warning-400 border border-warning-600 border-opacity-30"
                  }`}
                >
                  {verificationResult.isVerified ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <AlertCircle className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {verificationResult.isVerified
                    ? verificationResult.confidence > 0.8
                      ? "Skills Verified!"
                      : "Skills Partially Verified!"
                    : "Verification Incomplete"}
                </h3>
                <p className="text-primary-300 mb-4">
                  Confidence Score:{" "}
                  {Math.round(verificationResult.confidence * 100)}%
                </p>
              </div>

              <div className="space-y-4">
                {verificationResult.verifiedSkills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-success-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Verified Skills (
                      {verificationResult.verifiedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {verificationResult.verifiedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-success-600 bg-opacity-20 text-success-400 border border-success-600 border-opacity-30 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {verificationResult.unverifiedSkills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-warning-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Needs More Evidence (
                      {verificationResult.unverifiedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {verificationResult.unverifiedSkills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="bg-warning-600 bg-opacity-20 text-warning-400 border border-warning-600 border-opacity-30 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-primary-300 mb-2">
                    AI Analysis
                  </h4>
                  <p className="text-primary-300 text-sm bg-primary-900 border border-primary-700 p-3 rounded-md">
                    {verificationResult.reasoning}
                  </p>
                </div>

                {verificationResult.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-primary-300 mb-2">
                      Suggestions for Improvement
                    </h4>
                    <ul className="text-sm text-primary-400 space-y-1">
                      {verificationResult.suggestions.map(
                        (suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-accent-500 mt-1">•</span>
                            {suggestion}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Loading */}
          {isVerifying && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-700 border-t-accent-500"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent-400 animate-ping opacity-20"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Verifying with AI...
                  </h3>
                  <p className="text-primary-300 text-sm">
                    Our AI is analyzing your profiles and skills. This may take
                    a few moments.
                  </p>
                  <div className="flex items-center justify-center space-x-1 mt-3">
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-accent-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-accent-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isVerifying && (
          <div className="flex items-center justify-between p-6 border-t border-primary-800 bg-primary-900">
            <button
              onClick={step === 1 ? onClose : handleBack}
              className="px-4 py-2 text-primary-400 hover:text-primary-200"
              disabled={isSubmitting}
            >
              {step === 1 ? "Skip for now" : "Back"}
            </button>

            <div className="flex gap-3">
              {step < 3 && (
                <button
                  onClick={handleNext}
                  disabled={step === 1 && data.skills.length === 0}
                  className="px-6 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={handleVerifySkills}
                  disabled={data.skills.length === 0}
                  className="px-6 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Verify Skills
                </button>
              )}

              {step === 4 && verificationResult && (
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    "Complete Onboarding"
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
