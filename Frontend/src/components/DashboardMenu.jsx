import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import Profile from "./Profile";
import axios from "axios";
import { FiSearch } from "react-icons/fi";

const DashboardMenu = ({ onStudentSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Profile modal state
  const [userData, setUserData] = useState(null); // Fetched user data
  const [roleId, setRoleId] = useState(null); // Role ID for role-based logic
  const [isSearching, setIsSearching] = useState(false);

  // Fetch user data and role based on email in localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem("userEmail"); // Retrieve email from localStorage

      if (!email) {
        console.error("No email found in localStorage");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/fetch_profile",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }), // Pass email in request body
          }
        );

        const data = await response.json();

        if (response.ok) {
          setUserData(data.user); // Store fetched user data
          setRoleId(data.user.role_id); // Store role_id
        } else {
          console.error("Failed to fetch user data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Determine which search endpoint to use based on current route
  const getSearchEndpoint = () => {
    if (location.pathname.includes("/students")) {
      return "search_students";
    } else if (location.pathname.includes("/teachers")) {
      return "search_teachers";
    }
    return null;
  };

  // Update search function to use dynamic endpoint
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const endpoint = getSearchEndpoint();
    if (!endpoint) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/${endpoint}`,
        {
          params: { query: query },
        }
      );

      setSearchResults(
        response.data[endpoint.includes("students") ? "students" : "teachers"]
      );
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Render search results based on current route
  const renderSearchResults = () => {
    if (!searchResults.length) return null;

    return (
      <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
        {searchResults.map((result) => (
          <div
            key={result.stud_id || result.teacher_id}
            className="p-2 hover:bg-gray-100 cursor-pointer"
          >
            <p className="font-semibold">
              {result.first_name} {result.last_name}
            </p>
            <p className="text-sm text-gray-600">
              {result.student_email || result.email}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const handleSearchResultClick = (result) => {
    onStudentSelect(result); // Trigger selection in the parent component
    setSearchQuery(""); // Clear search query
    setSearchResults([]); // Clear search results
  };

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  return (
    <div className="bg-[#f2f1f1]">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="p-8 flex items-center gap-7">
          <img
            src="/src/assets/hck-logo.png"
            alt="HCK Logo"
            className="w-44 h-auto"
          />

          {/* Navigation Buttons */}
          <div className="flex gap-6 mt-4">
            <button
              className={`text-lg font-semibold ${
                location.pathname === "/dashboard"
                  ? "text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => navigate("/dashboard")}
            >
              CLASSROOM
            </button>
            <button
              className={`text-lg font-semibold ${
                location.pathname === "/teachers"
                  ? "text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => navigate("/teachers")}
            >
              TEACHERS
            </button>
            {roleId !== 4 && (
              <button
                className={`text-lg font-semibold ${
                  location.pathname === "/students"
                    ? "text-blue-500"
                    : "text-gray-700"
                }`}
                onClick={() => navigate("/students")}
              >
                STUDENTS
              </button>
            )}
            <button
              className={`text-lg font-semibold ${
                location.pathname === "/schedule"
                  ? "text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => navigate("/schedule")}
            >
              SCHEDULE
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-4 w-96">
            <div className="bg-gray-300 h-8 flex items-center p-2 rounded-md gap-2">
              {/* Remove this icon as we're using FiSearch below */}
              <IoSearch className="text-gray-700 ml-2 bg-gray-300" />
              <input
                type="text"
                placeholder={
                  location.pathname.includes("/students")
                    ? "Search students..."
                    : location.pathname.includes("/teachers")
                    ? "Search teachers..."
                    : "Search..."
                }
                className="bg-gray-300 flex-grow text-sm text-gray-700 placeholder-gray-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isSearching ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <FiSearch className="absolute hidden left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            )}

            {renderSearchResults()}
          </div>
        </div>

        {/* Notifications and Profile Section */}
        <div className="flex items-center p-10 gap-6">
          <IoMdNotifications className="text-4xl" />
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={openProfile}
          >
            <img src="/src/assets/Profile.png" alt="" className="w-12 h-auto" />
            <div>
              <h1 className="font-semibold">{userData?.username || "User"}</h1>
              <p className="text-sm text-gray-500 font-medium">
                {userData?.role_id
                  ? `${(() => {
                      switch (userData.role_id) {
                        case 1:
                          return "Admin";
                        case 2:
                          return "Teacher";
                        case 3:
                          return "Staff";
                        case 4:
                          return "Student";
                        default:
                          return "Unknown Role";
                      }
                    })()}`
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && <Profile userData={userData} onClose={closeProfile} />}
    </div>
  );
};

export default DashboardMenu;
