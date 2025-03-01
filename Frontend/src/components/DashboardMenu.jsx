import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BiCollection } from "react-icons/bi";
import {
  MdClass,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";
import { IoTime } from "react-icons/io5";
import Profile from "./Profile";
import axios from "axios";

const DashboardMenu = ({ onStudentSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileDataReady, setIsProfileDataReady] = useState(false);
  const [userData, setUserData] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);

  // Automatically open the dropdown that matches the current path
  useEffect(() => {
    if (location.pathname.includes("/teachers")) {
      setIsTeacherOpen(true);
    } else if (location.pathname.includes("/students")) {
      setIsStudentOpen(true);
    } else if (location.pathname.includes("/schedule")) {
      setIsScheduleOpen(true);
    } else if (location.pathname.includes("/dashboard")) {
      setIsClassroomOpen(true);
    }
  }, [location.pathname]);

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
          setIsProfileDataReady(true);
        } else {
          console.error("Failed to fetch user data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

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

  // Toggle dropdowns
  const toggleTeacherMenu = () => setIsTeacherOpen((prev) => !prev);
  const toggleStudentMenu = () => setIsStudentOpen((prev) => !prev);
  const toggleScheduleMenu = () => setIsScheduleOpen((prev) => !prev);
  const toggleClassroomMenu = () => setIsClassroomOpen((prev) => !prev);
  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  // Helper function to determine if a menu item is active
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="bg-[#f5f7fa] flex flex-col h-full w-[280px] shadow-md">
      {/* Header with logo */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="bg-blue-600 p-3 rounded-lg shadow-md">
          <BiCollection className="text-white text-[22px]" />
        </div>
        <div>
          <h1 className="font-semibold">Herald College Kathmandu</h1>
          <div className="h-0.5 w-16 bg-blue-500 mt-1"></div>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex flex-col flex-grow pt-4 overflow-y-auto">
        {/* Classroom Dropdown */}
        <div className="mb-1">
          <button
            className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
              isActive("/dashboard")
                ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleClassroomMenu}
          >
            <div className="flex items-center gap-3">
              <MdClass
                className={
                  isActive("/dashboard") ? "text-blue-600" : "text-gray-600"
                }
                size={20}
              />
              <span className="font-medium">Classroom</span>
            </div>
            <span>
              {isClassroomOpen ? (
                <MdOutlineKeyboardArrowDown
                  className={
                    isActive("/dashboard") ? "text-blue-600" : "text-gray-600"
                  }
                />
              ) : (
                <MdOutlineKeyboardArrowRight
                  className={
                    isActive("/dashboard") ? "text-blue-600" : "text-gray-600"
                  }
                />
              )}
            </span>
          </button>

          {isClassroomOpen && (
            <div className="bg-gray-50 py-1">
              <div
                className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                  location.pathname === "/dashboard"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => navigate("/dashboard")}
              >
                View Classrooms
              </div>
              <div
                className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                  location.pathname === "/dashboard/addclassroom"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => navigate("/dashboard/addclassroom")}
              >
                Add Classroom
              </div>
            </div>
          )}
        </div>

        {/* Teachers Dropdown */}
        <div className="mb-1">
          <button
            className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
              isActive("/teachers")
                ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleTeacherMenu}
          >
            <div className="flex items-center gap-3">
              <FaChalkboardTeacher
                className={
                  isActive("/teachers") ? "text-blue-600" : "text-gray-600"
                }
                size={20}
              />
              <span className="font-medium">Teacher</span>
            </div>
            <span>
              {isTeacherOpen ? (
                <MdOutlineKeyboardArrowDown
                  className={
                    isActive("/teachers") ? "text-blue-600" : "text-gray-600"
                  }
                />
              ) : (
                <MdOutlineKeyboardArrowRight
                  className={
                    isActive("/teachers") ? "text-blue-600" : "text-gray-600"
                  }
                />
              )}
            </span>
          </button>

          {isTeacherOpen && (
            <div className="bg-gray-50 py-1">
              <div
                className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                  location.pathname === "/teachers"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => navigate("/teachers")}
              >
                View Teacher Data
              </div>
              <div
                className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                  location.pathname === "/teachers/register"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => navigate("/teachers/register")}
              >
                Register Teacher
              </div>
            </div>
          )}
        </div>

        {/* Students Dropdown */}
        {roleId !== 4 && (
          <div className="mb-1">
            <button
              className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
                isActive("/students")
                  ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={toggleStudentMenu}
            >
              <div className="flex items-center gap-3">
                <BsFillPersonLinesFill
                  className={
                    isActive("/students") ? "text-blue-600" : "text-gray-600"
                  }
                  size={20}
                />
                <span className="font-medium">Student</span>
              </div>
              <span>
                {isStudentOpen ? (
                  <MdOutlineKeyboardArrowDown
                    className={
                      isActive("/students") ? "text-blue-600" : "text-gray-600"
                    }
                  />
                ) : (
                  <MdOutlineKeyboardArrowRight
                    className={
                      isActive("/students") ? "text-blue-600" : "text-gray-600"
                    }
                  />
                )}
              </span>
            </button>

            {isStudentOpen && (
              <div className="bg-gray-50 py-1">
                <div
                  className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                    location.pathname === "/students"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => navigate("/students")}
                >
                  View Student Data
                </div>
                <div
                  className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                    location.pathname === "/students/register"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => navigate("/students/register")}
                >
                  Register Student
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Dropdown */}
        <div className="mb-1">
          <button
            className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
              isActive("/schedule")
                ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleScheduleMenu}
          >
            <div className="flex items-center gap-3">
              <IoTime
                className={
                  isActive("/schedule") ? "text-blue-600" : "text-gray-600"
                }
                size={20}
              />
              <span className="font-medium">Schedule</span>
            </div>
            <span>
              {isScheduleOpen ? (
                <MdOutlineKeyboardArrowDown
                  className={
                    isActive("/schedule") ? "text-blue-600" : "text-gray-600"
                  }
                />
              ) : (
                <MdOutlineKeyboardArrowRight
                  className={
                    isActive("/schedule") ? "text-blue-600" : "text-gray-600"
                  }
                />
              )}
            </span>
          </button>

          {isScheduleOpen && (
            <div className="bg-gray-50 py-1">
              <div
                className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                  location.pathname === "/schedule/allocate-groups"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => navigate("/schedule/allocate-groups")}
              >
                Allocate Group
              </div>
              <div
                className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                  location.pathname === "/schedule/allocate-time"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => navigate("/schedule/allocate-time")}
              >
                Allocate Time
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User profile section */}
      <div className="border-t border-gray-200 p-4 mt-auto">
        {isProfileDataReady && (
          <div
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={openProfile}
          >
            <div className="relative">
              <img
                src="/src/assets/Profile.png"
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">
                {userData?.username}
              </h1>
              <p className="text-xs text-gray-500">
                {userData?.role_id &&
                  (() => {
                    switch (userData.role_id) {
                      case 1:
                        return "Administrator";
                      case 2:
                        return "RTE Officer";
                      case 3:
                        return "Teacher";
                      case 4:
                        return "Student";
                      default:
                        return "";
                    }
                  })()}
              </p>
            </div>
          </div>
        )}
      </div>

      {isProfileOpen && isProfileDataReady && (
        <Profile userData={userData} onClose={closeProfile} />
      )}
    </div>
  );
};

export default DashboardMenu;
