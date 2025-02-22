import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BiCollection } from "react-icons/bi";
import { MdClass } from "react-icons/md";
import { IoTime } from "react-icons/io5";

import Profile from "./Profile";
import axios from "axios";

const DashboardMenu = ({ onStudentSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Fetch user data based on email in localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return console.error("No email found in localStorage");

      try {
        const response = await fetch(
          "http://localhost:3000/api/fetch_profile",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          setUserData(data.user);
          setRoleId(data.user.role_id);
        } else {
          console.error("Failed to fetch user data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Determine search endpoint based on current route
  const getSearchEndpoint = () => {
    if (location.pathname.includes("/students")) return "search_students";
    if (location.pathname.includes("/teachers")) return "search_teachers";
    return null;
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    setSearchQuery("");
    setSearchResults([]);

    if (location.pathname.includes("/students")) {
      localStorage.setItem("selectedStudentId", result.stud_id);
      if (location.pathname === "/students") {
        localStorage.setItem("isLoading", "true");
        window.location.reload();
      } else {
        navigate("/students");
      }
    } else if (location.pathname.includes("/teachers")) {
      localStorage.setItem("selectedTeacherId", result.teacher_id);
      if (location.pathname === "/teachers") {
        localStorage.setItem("isLoading", "true");
        window.location.reload();
      } else {
        navigate("/teachers");
      }
    }
  };

  // Render search results
  const renderSearchResults = () => {
    if (!searchResults.length) return null;

    return (
      <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
        {searchResults.map((result) => (
          <div
            key={result.stud_id || result.teacher_id}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleSearchResultClick(result)}
          >
            <p className="font-semibold">
              {result.first_name} {result.last_name}
            </p>
            <p className="text-sm text-gray-600">
              {result.student_email || result.teacher_email}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  const toggleScheduleMenu = () => {
    setIsScheduleOpen((prev) => !prev);
  };

  return (
    <div className="bg-[#28282B] flex flex-col h-full w-[280px] pl-10 py-10">
      <div className="flex flex-col items-start gap-4 h-full">
        <div className="flex gap-4 mb-10 items-center">
          <div className="bg-blue-700 p-3 rounded-lg ">
            <BiCollection className="text-white text-[25px]" />
          </div>
          <div>
            <h1 className="text-white font-medium">Herald College Kathmandu</h1>
          </div>
        </div>
        <button
          className={`text-lg font-regular text-white flex items-center gap-3 ${
            location.pathname === "/dashboard" ? "text-blue-500" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <MdClass className="text-gray-200" />
          Classroom
        </button>
        <button
          className={`text-lg font-regular text-white flex items-center gap-3 ${
            location.pathname === "/teachers" ? "text-blue-500" : ""
          }`}
          onClick={() => navigate("/teachers")}
        >
          <FaChalkboardTeacher className="text-gray-200" />
          Teachers
        </button>
        {roleId !== 4 && (
          <button
            className={`text-lg font-regular flex items-center gap-3 text-white ${
              location.pathname === "/students" ? "text-blue-500" : ""
            }`}
            onClick={() => navigate("/students")}
          >
            <BsFillPersonLinesFill className="text-gray-200" />
            Students
          </button>
        )}
        <button
          className={`text-lg font-regular flex items-center gap-3 text-white ${
            location.pathname === "/schedule" ? "text-blue-500" : ""
          }`}
          onClick={toggleScheduleMenu}
        >
          <IoTime className="text-gray-200" />
          Schedule
          <span className="ml-2">{isScheduleOpen ? "▼" : ">"}</span>
        </button>
        {isScheduleOpen && (
          <div className="ml-4 flex flex-col">
            <button
              className="text-white text-sm"
              onClick={() => {
                /* Handle Allocate Group */
              }}
            >
              Allocate Group
            </button>
            <button
              className="text-white text-sm"
              onClick={() => {
                /* Handle Allocate Time */
              }}
            >
              Allocate Time
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-start text-white gap-4 mb-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={openProfile}
        >
          <img src="/src/assets/Profile.png" alt="" className="w-12 h-auto" />
          <div>
            <h1 className="font-normal">{userData?.username || "User"}</h1>
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
      {isProfileOpen && <Profile userData={userData} onClose={closeProfile} />}
    </div>
  );
};

export default DashboardMenu;
