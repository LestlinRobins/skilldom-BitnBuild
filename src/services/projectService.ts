import { supabase } from "../config/supabase";

export interface Project {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  required_skills: string[];
  max_members: number;
  current_members: string[];
  status: "open" | "in-progress" | "completed" | "paused";
  category: string;
  tags: string[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
  estimated_duration: string;
  contact_info?: string;
  project_links: string[];
  gallery_images: string[];
  media_files: string[];
  created_at: string;
  updated_at: string;
  deadline?: string;
  requirements?: string;
  project_goals: string[];
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  applicant_id: string;
  message: string;
  skills_offered: string[];
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export const createProject = async (
  projectData: Omit<Project, "id" | "updated_at" | "current_members">
): Promise<Project> => {
  try {
    // Validate required fields
    if (!projectData.title?.trim()) {
      throw new Error("Project title is required");
    }
    if (!projectData.description?.trim()) {
      throw new Error("Project description is required");
    }
    if (!projectData.creator_id?.trim()) {
      throw new Error("Creator ID is required");
    }

    // Prepare the data for insertion
    const insertData = {
      ...projectData,
      current_members: [projectData.creator_id],
      updated_at: new Date().toISOString(),
      // Ensure arrays are properly formatted
      required_skills: projectData.required_skills || [],
      tags: projectData.tags || [],
      project_links: projectData.project_links || [],
      gallery_images: projectData.gallery_images || [],
      media_files: projectData.media_files || [],
      project_goals: projectData.project_goals || [],
    };

    console.log("Creating project with data:", insertData);

    const { data, error } = await supabase
      .from("projects")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);

      // Provide more specific error messages
      if (error.message.includes("uuid")) {
        throw new Error(
          "Database configuration error: Please ensure the projects table uses TEXT for user IDs. Run the quick_fix.sql migration."
        );
      }
      if (error.message.includes("null value")) {
        throw new Error(
          "Missing required field. Please fill in all required information."
        );
      }
      if (error.message.includes("foreign key")) {
        throw new Error("Invalid reference. Please check your data.");
      }

      throw new Error(`Failed to create project: ${error.message}`);
    }

    if (!data) {
      throw new Error("Project was created but no data was returned");
    }

    console.log("Project created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in createProject:", error);
    throw error;
  }
};

export const updateProject = async (
  projectId: string,
  updates: Partial<Omit<Project, "id" | "created_at">>
): Promise<Project> => {
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
};

export const getProject = async (
  projectId: string
): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Project not found
    }
    throw new Error(`Failed to get project: ${error.message}`);
  }

  return data;
};

export const getAllProjects = async (
  limit: number = 50
): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get projects: ${error.message}`);
  }

  return data || [];
};

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .or(`creator_id.eq.${userId},current_members.cs.{${userId}}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get user projects: ${error.message}`);
  }

  return data || [];
};

export const getProjectsByCreator = async (
  creatorId: string
): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get creator projects: ${error.message}`);
  }

  return data || [];
};

export const searchProjects = async (
  query: string,
  category?: string,
  skills?: string[]
): Promise<Project[]> => {
  let queryBuilder = supabase
    .from("projects")
    .select("*")
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
    );

  if (category) {
    queryBuilder = queryBuilder.eq("category", category);
  }

  if (skills && skills.length > 0) {
    queryBuilder = queryBuilder.overlaps("required_skills", skills);
  }

  const { data, error } = await queryBuilder
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to search projects: ${error.message}`);
  }

  return data || [];
};

export const joinProject = async (
  projectId: string,
  userId: string
): Promise<Project> => {
  // First get the current project
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.current_members.includes(userId)) {
    throw new Error("User is already a member of this project");
  }

  if (project.current_members.length >= project.max_members) {
    throw new Error("Project is already at maximum capacity");
  }

  // Add user to the project
  const updatedMembers = [...project.current_members, userId];

  return updateProject(projectId, {
    current_members: updatedMembers,
    status: updatedMembers.length > 1 ? "in-progress" : "open",
  });
};

export const leaveProject = async (
  projectId: string,
  userId: string
): Promise<Project> => {
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.current_members.includes(userId)) {
    throw new Error("User is not a member of this project");
  }

  if (project.creator_id === userId) {
    throw new Error("Project creator cannot leave the project");
  }

  const updatedMembers = project.current_members.filter((id) => id !== userId);

  return updateProject(projectId, {
    current_members: updatedMembers,
    status: updatedMembers.length === 1 ? "open" : project.status,
  });
};

// Project Application functions
export const createApplication = async (
  applicationData: Omit<ProjectApplication, "id" | "created_at">
): Promise<ProjectApplication> => {
  const { data, error } = await supabase
    .from("project_applications")
    .insert({
      ...applicationData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create application: ${error.message}`);
  }

  return data;
};

export const getProjectApplications = async (
  projectId: string
): Promise<ProjectApplication[]> => {
  const { data, error } = await supabase
    .from("project_applications")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get applications: ${error.message}`);
  }

  return data || [];
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: "accepted" | "rejected"
): Promise<ProjectApplication> => {
  const { data, error } = await supabase
    .from("project_applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update application: ${error.message}`);
  }

  return data;
};
