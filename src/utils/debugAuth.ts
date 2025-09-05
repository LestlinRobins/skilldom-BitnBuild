// Debug script to check user ID format
// Add this temporarily to your CreateProjectModal or CollaborationHub to debug

export const debugUserAuth = (user: any) => {
  // Add this to your component to check the user object
  console.log("=== AUTH DEBUG INFO ===");
  console.log("User object:", user);
  console.log("User ID:", user?.id);
  console.log("User ID type:", typeof user?.id);
  console.log("User ID length:", user?.id?.length);
  console.log(
    "Is UUID format?",
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      user?.id || ""
    )
  );
  console.log("======================");
};

// Test data for project creation
export const testProjectData = {
  title: "Test Project",
  description: "This is a test project to check the creation process",
  creator_id: "test-user-id-12345", // Use a simple test ID first
  required_skills: ["JavaScript", "React"],
  max_members: 5,
  status: "open" as const,
  category: "Web Development",
  tags: ["test", "demo"],
  difficulty_level: "beginner" as const,
  estimated_duration: "2 weeks",
  contact_info: "test@example.com",
  project_links: [],
  gallery_images: [],
  media_files: [],
  created_at: new Date().toISOString(),
  deadline: undefined,
  requirements: "Basic knowledge of React",
  project_goals: ["Learn collaboration", "Build something cool"],
};
