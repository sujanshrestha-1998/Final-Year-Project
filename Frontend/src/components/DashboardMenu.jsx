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
  const [userData, setUserData] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
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

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  return (
    <div className="bg-[#f0f0f0] flex flex-col h-full w-[280px] px-4 py-10">
      <div className="flex flex-col items-start gap-4 h-full">
        <div className="flex gap-4 mb-10 items-center px-8">
          <div className="bg-blue-700 p-3 rounded-lg ">
            <BiCollection className="text-white text-[25px]" />
          </div>
          <div>
            <h1 className=" font-semibold">Herald College Kathmandu</h1>
          </div>
        </div>
        <button
          className={`text-lg font-regular flex items-center gap-3 px-4 ${
            location.pathname === "/dashboard" ? "text-blue-500" : "text-black"
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <MdClass className="text-gray-800" />
          Classroom
        </button>

        {/* Teachers Dropdown */}
        <button
          className={`text-lg font-regular text-black flex items-center justify-between w-full px-4 ${
            location.pathname === "/teachers" ? "text-blue-500" : ""
          }`}
          onClick={toggleTeacherMenu}
        >
          <div className="flex items-center gap-3">
            <FaChalkboardTeacher className="text-gray-800" />
            Teacher
          </div>
          <span className="text-2xl font-bold">
            {isTeacherOpen ? (
              <MdOutlineKeyboardArrowDown />
            ) : (
              <MdOutlineKeyboardArrowRight />
            )}
          </span>
        </button>
        {isTeacherOpen && (
          <div className="ml-4 flex flex-col border-l-2 border-gray-300 gap-2 pl-4">
            <div
              className="text-black text-sm cursor-pointer"
              onClick={() => navigate("/teachers")}
            >
              View Teacher Data
            </div>
            <div
              className="text-black text-sm cursor-pointer"
              onClick={() => navigate("/teachers/register")}
            >
              Register Teacher
            </div>
          </div>
        )}

        {/* Students Dropdown */}
        {roleId !== 4 && (
          <button
            className={`text-lg font-regular flex items-center justify-between w-full px-4 text-black ${
              location.pathname === "/students" ? "text-blue-500" : ""
            }`}
            onClick={toggleStudentMenu}
          >
            <div className="flex items-center gap-3">
              <BsFillPersonLinesFill className="text-gray-800" />
              Student
            </div>
            <span className="text-2xl font-bold">
              {isStudentOpen ? (
                <MdOutlineKeyboardArrowDown />
              ) : (
                <MdOutlineKeyboardArrowRight />
              )}
            </span>
          </button>
        )}
        {isStudentOpen && (
          <div className="ml-4 flex flex-col border-l-2 border-gray-300 gap-2 pl-4">
            <div
              className="text-black text-sm cursor-pointer"
              onClick={() => navigate("/students")}
            >
              View Student Data
            </div>
            <div
              className="text-black text-sm cursor-pointer"
              onClick={() => navigate("/students/register")}
            >
              Register Student
            </div>
          </div>
        )}

        {/* Schedule Dropdown */}
        <button
          className={`text-lg font-regular flex items-center justify-between w-full px-4 text-black ${
            location.pathname === "/schedule" ? "text-blue-500" : ""
          }`}
          onClick={toggleScheduleMenu}
        >
          <div className="flex items-center gap-3">
            <IoTime className="text-gray-800" />
            Schedule
          </div>
          <span className="text-2xl font-bold">
            {isScheduleOpen ? (
              <MdOutlineKeyboardArrowDown />
            ) : (
              <MdOutlineKeyboardArrowRight />
            )}
          </span>
        </button>
        {isScheduleOpen && (
          <div className="ml-4 flex flex-col border-l-2 border-gray-300 gap-2 pl-4">
            <div
              className="text-black text-sm cursor-pointer"
              onClick={() => navigate("/schedule/allocate-groups")}
            >
              Allocate Group
            </div>
            <div
              className="text-black text-sm cursor-pointer"
              onClick={() => navigate("/schedule/allocate-time")}
            >
              Allocate Time
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-start text-black gap-4 mb-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={openProfile}
        >
          <img src="/src/assets/Profile.png" alt="" className="w-12 h-auto" />
          <div>
            <h1 className="font-semibold">{userData?.username || "User"}</h1>
            {/* <h2 className="text-[12px]">{userData?.email || "User"}</h2> */}
            <p className="text-sm text-gray-600 font-regular">
              {userData?.role_id
                ? `${(() => {
                    switch (userData.role_id) {
                      case 1:
                        return "Admin";
                      case 2:
                        return "RTE Officer";
                      case 3:
                        return "Teacher";
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
