import React, { useState, useEffect } from "react";
import { Search, Filter, Sparkles } from "lucide-react";
import { users, skillCategories } from "../data/mockData";
import CourseCard from "../components/CourseCard";
import UserCard from "../components/UserCard";
import { useCourseOperations } from "../hooks/useCourseOperations";
import type { Course } from "../services/courseService";

const SearchPage: React.FC = () => {
  const { getAllCoursesWithMockData, searchAllCourses } = useCourseOperations();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"courses" | "people">("courses");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  // Load all courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await getAllCoursesWithMockData();
        setAllCourses(courses);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };
    loadCourses();
  }, [getAllCoursesWithMockData]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);

      // Simulate AI search delay
      const searchTimeout = setTimeout(async () => {
        try {
          const filteredResults =
            activeTab === "courses"
              ? await searchAllCourses(searchQuery)
              : users.filter(
                  (user: any) =>
                    user.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.skills.some((skill: any) =>
                      skill.toLowerCase().includes(searchQuery.toLowerCase())
                    ) ||
                    user.bio.toLowerCase().includes(searchQuery.toLowerCase())
                );

          setResults(filteredResults);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 1000);

      return () => clearTimeout(searchTimeout);
    } else {
      setResults(activeTab === "courses" ? allCourses : users);
      setIsSearching(false);
    }
  }, [searchQuery, activeTab, searchAllCourses, allCourses]);

  useEffect(() => {
    setResults(activeTab === "courses" ? allCourses : users);
  }, [activeTab, allCourses]);

  const filteredResults = selectedCategory
    ? results.filter((item: any) =>
        activeTab === "courses"
          ? item.skill_category === selectedCategory
          : item.skills.includes(selectedCategory)
      )
    : results;

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
          {skillCategories.slice(0, 6).map((category: any) => (
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
              {filteredResults.length} {activeTab} found
            </p>
            <div className="grid grid-cols-1 gap-4 animate-fade-in">
              {filteredResults.map((item) =>
                activeTab === "courses" ? (
                  <CourseCard key={item.id} course={item} />
                ) : (
                  <UserCard key={item.id} user={item} />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
