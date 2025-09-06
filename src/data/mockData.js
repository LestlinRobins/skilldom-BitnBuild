export const users = [
  {
    id: "1",
    name: "Alex Chen",
    avatarUrl:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    skills: ["JavaScript", "React", "Node.js", "Python"],
    bio: "Full-stack developer with 5 years of experience. Love teaching and learning new technologies.",
    rating: 4.8,
    reviews: [
      {
        id: "1",
        rating: 5,
        comment: "Excellent teacher! Made complex concepts easy to understand.",
        reviewer: "Sarah Johnson",
      },
      {
        id: "2",
        rating: 5,
        comment: "Very patient and thorough. Highly recommended!",
        reviewer: "Mike Davis",
      },
    ],
    skillCoins: 1250,
    ongoingCourses: ["1", "3"],
    completedCourses: ["5", "7"],
    collaborations: ["1", "2"],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    avatarUrl:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
    skills: ["UI/UX Design", "Figma", "Adobe Creative Suite", "Prototyping"],
    bio: "Creative designer passionate about user-centered design and accessibility.",
    rating: 4.9,
    reviews: [
      {
        id: "3",
        rating: 5,
        comment: "Amazing design insights! Transformed our app completely.",
        reviewer: "Alex Chen",
      },
    ],
    skillCoins: 890,
    ongoingCourses: ["2", "4"],
    completedCourses: ["6", "8"],
    collaborations: ["1", "3"],
  },
  {
    id: "3",
    name: "Mike Davis",
    avatarUrl:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
    skills: ["Data Science", "Machine Learning", "Python", "SQL"],
    bio: "Data scientist with expertise in ML and AI. Love solving complex problems with data.",
    rating: 4.7,
    reviews: [],
    skillCoins: 2100,
    ongoingCourses: ["6"],
    completedCourses: ["1", "2", "3"],
    collaborations: ["2"],
  },
  {
    id: "4",
    name: "Emma Rodriguez",
    avatarUrl:
      "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150",
    skills: ["Digital Marketing", "Content Strategy", "SEO", "Social Media"],
    bio: "Marketing strategist helping businesses grow their online presence.",
    rating: 4.6,
    reviews: [],
    skillCoins: 750,
    ongoingCourses: ["5"],
    completedCourses: ["4"],
    collaborations: ["3"],
  },
];

export const courses = [
  {
    id: "1",
    title: "Advanced React Hooks & State Management",
    description:
      "Master React hooks, context API, and state management patterns for scalable applications.",
    teacherId: "1",
    skillCategory: "Web Development",
    svcValue: 150,
    duration: 120,
    availability: ["Monday 7-9 PM", "Wednesday 6-8 PM", "Saturday 2-4 PM"],
    learners: ["2", "3"],
    imageUrl:
      "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: "2",
    title: "UI/UX Design Fundamentals",
    description:
      "Learn design thinking, user research, and prototyping with industry-standard tools.",
    teacherId: "2",
    skillCategory: "Design",
    svcValue: 200,
    duration: 180,
    availability: ["Tuesday 6-9 PM", "Thursday 7-10 PM", "Sunday 1-4 PM"],
    learners: ["1", "4"],
    imageUrl:
      "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: "3",
    title: "Machine Learning for Beginners",
    description:
      "Introduction to ML concepts, algorithms, and practical applications using Python.",
    teacherId: "3",
    skillCategory: "Data Science",
    svcValue: 250,
    duration: 150,
    availability: ["Monday 8-10:30 PM", "Friday 6-8:30 PM"],
    learners: ["1"],
    imageUrl:
      "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: "4",
    title: "Digital Marketing Strategy",
    description:
      "Comprehensive guide to modern digital marketing, SEO, and content strategy.",
    teacherId: "4",
    skillCategory: "Marketing",
    svcValue: 180,
    duration: 90,
    availability: ["Wednesday 7-8:30 PM", "Saturday 10-11:30 AM"],
    learners: ["2"],
    imageUrl:
      "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: "5",
    title: "Full-Stack JavaScript Development",
    description:
      "Build complete web applications from frontend to backend with modern JavaScript.",
    teacherId: "1",
    skillCategory: "Web Development",
    svcValue: 300,
    duration: 240,
    availability: ["Tuesday 6-10 PM", "Saturday 9 AM-1 PM"],
    learners: ["4"],
    imageUrl:
      "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: "6",
    title: "Data Visualization with D3.js",
    description:
      "Create stunning interactive visualizations and dashboards with D3.js.",
    teacherId: "3",
    skillCategory: "Data Science",
    svcValue: 220,
    duration: 135,
    availability: ["Thursday 7-9:15 PM", "Sunday 3-5:15 PM"],
    learners: ["3"],
    imageUrl:
      "https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

export const projects = [
  {
    id: "1",
    title: "EcoTracker Mobile App",
    description:
      "A mobile app to help users track their carbon footprint and find eco-friendly alternatives.",
    creator_id: "1",
    required_skills: ["React Native", "UI/UX Design", "Environmental Science"],
    max_members: 5,
    current_members: ["1", "2"],
    status: "in-progress",
    category: "Mobile Development",
    tags: ["sustainability", "mobile", "tracking"],
    difficulty_level: "intermediate",
    estimated_duration: "3 months",
    project_links: [],
    gallery_images: [
      "Mobile app mockups showing carbon tracking dashboard",
      "User journey wireframes and prototypes",
      "Environmental impact calculation algorithms",
    ],
    media_files: [],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z",
    project_goals: [
      "Create intuitive carbon tracking interface",
      "Implement eco-friendly recommendations",
      "Build user engagement features",
    ],
    requirements:
      "Experience with React Native, understanding of environmental data",
  },
  {
    id: "2",
    title: "AI-Powered Recipe Recommender",
    description:
      "Machine learning system that recommends recipes based on dietary preferences and available ingredients.",
    creator_id: "1",
    required_skills: ["Machine Learning", "Python", "API Development"],
    max_members: 4,
    current_members: ["1", "3"],
    status: "open",
    category: "AI/ML",
    tags: ["machine-learning", "food", "api"],
    difficulty_level: "advanced",
    estimated_duration: "4 months",
    project_links: [],
    gallery_images: [
      "ML model training visualizations",
      "Recipe database schema design",
      "API endpoint documentation",
    ],
    media_files: [],
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-18T14:20:00Z",
    project_goals: [
      "Train accurate recommendation model",
      "Build scalable API infrastructure",
      "Create comprehensive recipe database",
    ],
    requirements:
      "Strong Python skills, experience with ML frameworks like TensorFlow or PyTorch",
  },
  {
    id: "3",
    title: "Local Business Directory Platform",
    description:
      "Community-driven platform to discover and promote local businesses with reviews and events.",
    creator_id: "2",
    required_skills: [
      "Web Development",
      "Digital Marketing",
      "Community Management",
    ],
    max_members: 6,
    current_members: ["2", "4"],
    status: "completed",
    category: "Web Development",
    tags: ["community", "business", "directory"],
    difficulty_level: "intermediate",
    estimated_duration: "5 months",
    project_links: [],
    gallery_images: [
      "Business listing interface designs",
      "Marketing campaign results and analytics",
      "Community engagement strategies",
    ],
    media_files: [],
    created_at: "2023-12-01T08:00:00Z",
    updated_at: "2024-01-15T16:45:00Z",
    project_goals: [
      "Build comprehensive business directory",
      "Implement review and rating system",
      "Create event management features",
    ],
    requirements:
      "Full-stack development experience, knowledge of community building strategies",
  },
];

export const skillCategories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "Digital Marketing",
  "Content Creation",
  "Business Strategy",
  "Photography",
  "Music Production",
  "Language Learning",
  "Fitness & Health",
];

export const badges = [
  {
    id: "1",
    name: "First Course",
    icon: "Trophy",
    description: "Completed your first course",
  },
  {
    id: "2",
    name: "Streak Master",
    icon: "Flame",
    description: "7-day learning streak",
  },
  {
    id: "3",
    name: "Collaborator",
    icon: "Users",
    description: "Joined your first project",
  },
  {
    id: "4",
    name: "Skill Sharer",
    icon: "BookOpen",
    description: "Taught your first course",
  },
  {
    id: "5",
    name: "AI Verified",
    icon: "Shield",
    description: "Skills verified by AI",
  },
];
