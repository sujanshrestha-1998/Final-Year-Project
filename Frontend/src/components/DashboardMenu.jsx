import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import Profile from "./Profile";

const DashboardMenu = ({ onStudentSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State for toggling Profile

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]); // Clear results if query is empty
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    let endpoint = "";

    switch (location.pathname) {
      case "/students":
        endpoint = "search_students";
        break;
      case "/teachers":
        endpoint = "search_teachers";
        break;
      case "/dashboard":
        endpoint = "search_classrooms";
        break;
      case "/schedule":
        endpoint = "search_schedule";
        break;
      default:
        return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/${endpoint}?query=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();

      if (response.ok) {
        setSearchResults(
          data.students || data.teachers || data.classrooms || []
        );
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
    }
  };

  const handleSearchResultClick = (result) => {
    onStudentSelect(result); // Trigger selection in the parent component
    setSearchQuery(""); // Clear search query
    setSearchResults([]); // Clear search results
  };

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  return (
    <div className="bg-[#f2f1f1] relative">
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
              <IoSearch className="text-gray-700 ml-2 bg-gray-300" />
              <input
                type="text"
                placeholder="Search"
                className="bg-gray-300 flex-grow text-sm text-gray-700 placeholder-gray-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 bg-white shadow-lg rounded-md w-full mt-1 max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-2 border-b last:border-none bg-white hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <p className="text-gray-700">
                      <strong className="font-semibold">
                        {result.first_name
                          ? `${result.first_name} ${result.last_name}`
                          : result.name}
                      </strong>
                      <span className="block text-sm text-gray-500">
                        {result.student_email || result.teacher_email || "N/A"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute z-10 bg-white shadow-lg rounded-md w-full mt-1 p-2">
                <p className="text-gray-500 bg-white">No results found</p>
              </div>
            )}
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
              <h1 className="font-semibold">Sujan Shrestha</h1>
              <p className="text-sm text-gray-500 font-medium">RTE Officer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeProfile}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 bg-white p-6 rounded-md shadow-lg w-1/3">
            <Profile onClose={closeProfile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMenu;
