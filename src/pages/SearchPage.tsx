import React, { useState, useEffect } from "react";
import { Search, Filter, Sparkles } from "lucide-react";
import CourseCard from "../components/CourseCard";
import UserCard from "../components/UserCard";
import { useAuth } from "../contexts/AuthContext";
import { useCourseOperations } from "../hooks/useCourseOperations";
import { useUserOperations } from "../hooks/useUserOperations";
import type { Course } from "../services/courseService";
import type { Database } from "../config/supabase";
import { convertSupabaseUserToUser } from "../services/supabaseService";

type SupabaseUser = Database["public"]["Tables"]["users"]["Row"];

const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const { getAllCourses, searchCourses } = useCourseOperations();
  const { searchForUsers } = useUserOperations();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"courses" | "people">("courses");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Course[]>([]);
  const [userResults, setUserResults] = useState<SupabaseUser[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [convertedUsers, setConvertedUsers] = useState<{ [key: string]: any }>(
    {}
  );

  // Filter out courses the user is already enrolled in or has completed
  const filterAvailableCourses = (courses: Course[]) => {
    return courses.filter((course) => {
      const isEnrolled = user?.ongoingCourses?.includes(course.id);
      const isCompleted = user?.completedCourses?.includes(course.id);
      const isOwnCourse = user?.id && course.teacher_id === user.id;

      // Exclude enrolled, completed, and own courses
      return !isEnrolled && !isCompleted && !isOwnCourse;
    });
  };

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [courses] = await Promise.all([getAllCourses()]);
        setAllCourses(courses);
        const filteredCourses = filterAvailableCourses(courses);
        setResults(activeTab === "courses" ? filteredCourses : []);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };
    loadInitialData();
  }, [getAllCourses, activeTab, user?.ongoingCourses, user?.completedCourses]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);

      const searchTimeout = setTimeout(async () => {
        try {
          if (activeTab === "courses") {
            const courseResults = await searchCourses(searchQuery);
            const filteredResults = filterAvailableCourses(courseResults);
            setResults(filteredResults);
            setUserResults([]);
          } else {
            const userResults = await searchForUsers(searchQuery);
            setUserResults(userResults);
            setResults([]);
          }
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
          setUserResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);

      return () => clearTimeout(searchTimeout);
    } else {
      const filteredCourses = filterAvailableCourses(allCourses);
      setResults(activeTab === "courses" ? filteredCourses : []);
      setUserResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, activeTab, searchCourses, searchForUsers, allCourses]);

  // Handle tab changes
  useEffect(() => {
    const filteredCourses = filterAvailableCourses(allCourses);
    if (activeTab === "courses") {
      setResults(filteredCourses);
      setUserResults([]);
    } else {
      setResults([]);
      setUserResults([]);
    }
    // Reset category filter when switching tabs
    setSelectedCategory("");
  }, [activeTab, allCourses, user?.ongoingCourses, user?.completedCourses]);

  // Convert users when userResults change
  useEffect(() => {
    const convertUsers = async () => {
      setIsSearching(true);
      try {
        const promises = userResults.map((user) =>
          convertSupabaseUserToUser(user)
        );
        const convertedResults = await Promise.all(promises);
        const converted: { [key: string]: any } = {};
        userResults.forEach((user, index) => {
          converted[user.id] = convertedResults[index];
        });
        setConvertedUsers(converted);
      } catch (error) {
        console.error("Error converting users:", error);
        setConvertedUsers({});
      } finally {
        setIsSearching(false);
      }
    };

    if (userResults.length > 0) {
      convertUsers();
    } else {
      setConvertedUsers({});
      setIsSearching(false);
    }
  }, [userResults]);

  // Show loading state while converting users
  if (
    userResults.length > 0 &&
    Object.keys(convertedUsers).length === 0 &&
    isSearching
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-400"></div>
        <p className="text-gray-300 font-medium">Loading results...</p>
      </div>
    );
  }

  // Get unique categories from courses and users
  const getUniqueCategories = () => {
    const courseCategories = allCourses.map((course) => course.skill_category);
    const userSkillCategories = userResults.flatMap(
      (user) => user.skills || []
    );
    return [...new Set([...courseCategories, ...userSkillCategories])].filter(
      Boolean
    );
  };

  const availableCategories = getUniqueCategories();

  const filteredResults = selectedCategory
    ? results.filter(
        (course: Course) => course.skill_category === selectedCategory
      )
    : results;

  const filteredUserResults =
    selectedCategory && activeTab === "people"
      ? userResults.filter(
          (user) =>
            user.skills &&
            Array.isArray(user.skills) &&
            user.skills.includes(selectedCategory)
        )
      : userResults;

  return (
    <div className="min-h-screen bg-primary-700 text-white">
      {/* Header */}
      <div className="bg-primary-800 p-6 space-y-4">
        <h1 className="text-2xl font-bold">Discover Skills</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, skills, or people..."
            className="w-full pl-12 pr-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "courses"
                ? "bg-accent-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-primary-600"
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "people"
                ? "bg-accent-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-primary-600"
            }`}
          >
            People
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          <Filter className="text-gray-400 flex-shrink-0" size={20} />
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory
                ? "bg-accent-500 text-white"
                : "bg-primary-600 text-gray-300 hover:bg-primary-500"
            }`}
          >
            All
          </button>
          {availableCategories.slice(0, 6).map((category: string) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-accent-500 text-white"
                  : "bg-primary-600 text-gray-300 hover:bg-primary-500"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-accent-400 animate-pulse" size={24} />
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-400"></div>
            </div>
            <p className="text-gray-300 font-medium">Searching with AI...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              {activeTab === "courses"
                ? `${filteredResults.length} ${activeTab} found`
                : `${filteredUserResults.length} ${activeTab} found`}
            </p>
            <div className="grid grid-cols-1 gap-4 animate-fade-in">
              {activeTab === "courses"
                ? // Display filtered courses
                  filteredResults.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                : // Display filtered users
                  filteredUserResults
                    .map((user) => {
                      const convertedUser = convertedUsers[user.id];
                      return convertedUser ? (
                        <UserCard key={user.id} user={convertedUser} />
                      ) : null;
                    })
                    .filter(Boolean)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
