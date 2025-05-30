import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaRegIdBadge, FaUserPlus } from "react-icons/fa";
import { TbUserScreen, TbUsersGroup } from "react-icons/tb";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { GrSchedules, GrGroup } from "react-icons/gr";
import { PiProjectorScreenDuotone, PiClockUserDuotone } from "react-icons/pi";
import { PiClockDuotone } from "react-icons/pi";
import { BiCollection } from "react-icons/bi";
import {
  MdClass,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";
import { LiaPersonBoothSolid } from "react-icons/lia";
import { IoTime } from "react-icons/io5";
import Profile from "./Profile";
import Notification from "./Notification"; // Import the Notification component
import axios from "axios";
import { IoNotificationsCircleOutline } from "react-icons/io5"; // For a bell icon

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
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isMeetingRequestsOpen, setIsMeetingRequestsOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isAddUsersOpen, setIsAddUsersOpen] = useState(false); // New state for "Add Additional Users"
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0); // New state for notifications
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false); // To control visibility of Notification.jsx

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
    } else if (location.pathname.includes("/requests")) {
      setIsRequestsOpen(true);
    } else if (location.pathname.includes("/meeting-requests")) {
      setIsMeetingRequestsOpen(true);
    } else if (location.pathname.includes("/users")) {
      // For "Add Additional Users"
      setIsAddUsersOpen(true);
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
        if (response.ok && data.user) {
          // check data.user
          setUserData(data.user);
          setRoleId(data.user.role_id);
          setIsProfileDataReady(true);

          // Fetch unread notification count once user ID is available
          if (data.user.id) {
            fetchUnreadNotificationCount(data.user.id);
            // Set up interval to refresh notification count
            const notificationIntervalId = setInterval(
              () => fetchUnreadNotificationCount(data.user.id),
              30000
            ); // Refresh every 30 seconds
            // Clean up interval on component unmount
            return () => clearInterval(notificationIntervalId);
          }
        } else {
          console.error("Failed to fetch user data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []); // Removed userData from dependency array to prevent re-triggering fetchUserData

  // Fetch unread notification count
  const fetchUnreadNotificationCount = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/api/user_notifications/unread_count/${userId}`
      );
      if (response.data.success) {
        setUnreadNotificationCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching unread notification count:", err);
    }
  };

  // Fetch pending requests count for RTE Officer
  useEffect(() => {
    if (roleId === 2) {
      const fetchPendingRequestsCount = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3000/api/get_pending_reservations"
          );
          if (response.data.success) {
            setPendingRequestsCount(response.data.reservations.length);
          }
        } catch (err) {
          console.error("Error fetching pending requests count:", err);
        }
      };

      fetchPendingRequestsCount();
      const intervalId = setInterval(fetchPendingRequestsCount, 60000);
      return () => clearInterval(intervalId);
    }
  }, [roleId]);

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
  const toggleMeetingRequestsMenu = () =>
    setIsMeetingRequestsOpen((prev) => !prev);
  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);
  const toggleAddUsersMenu = () => setIsAddUsersOpen((prev) => !prev);
  const toggleNotificationPanel = () =>
    setIsNotificationPanelOpen((prev) => !prev);

  // Helper function to determine if a menu item is active
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  // Add this toggle function
  const toggleRequestsMenu = () => setIsRequestsOpen((prev) => !prev);

  return (
    <div className="bg-[#f5f7fa] flex flex-col h-full w-[280px] shadow-md">
      {/* Header with logo and Notification Icon */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-lg shadow-md">
            <BiCollection className="text-white text-[22px]" />
          </div>
          <div>
            <h1 className="font-semibold">Herald College Kathmandu</h1>
            <div className="h-0.5 w-16 bg-blue-500 mt-1"></div>
          </div>
        </div>
      </div>

      {/* Notification Panel (conditionally rendered) */}

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
              <PiProjectorScreenDuotone
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
              {/* Only Admin and RTE can add classrooms */}
              {(roleId === 1 || roleId === 2) && (
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
              )}
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
              <LiaChalkboardTeacherSolid
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
                Academics Map
              </div>
              {/* Teacher Details - Only for Admin and RTE */}
              {(roleId === 1 || roleId === 2) && (
                <div
                  className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                    location.pathname === "/teachers/details"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => navigate("/teachers/details")}
                >
                  Teacher Details
                </div>
              )}
              <div
                className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                  location.pathname === "/teachers/list"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => navigate("/teachers/list")}
              >
                Teachers Directory
              </div>
              {/* Register Teacher - Only for Admin and RTE */}
              {(roleId === 1 || roleId === 2) && (
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
              )}
            </div>
          )}
        </div>

        {/* Students Dropdown - Not visible for Students (role_id = 4) */}
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
                <FaRegIdBadge
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
                  Student Details
                </div>
                {/* Register Student - Only for Admin and RTE */}
                {(roleId === 1 || roleId === 2) && (
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
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Additional Users Dropdown - Only for Admin and RTE */}
        {(roleId === 1 || roleId === 2) && (
          <div className="mb-1">
            <button
              className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
                isActive("/users") // Matches base path for this section
                  ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={toggleAddUsersMenu}
            >
              <div className="flex items-center gap-3">
                <TbUsersGroup // Using TbUsersGroup icon
                  className={
                    isActive("/users") ? "text-blue-600" : "text-gray-600"
                  }
                  size={20}
                />
                <span className="font-medium">Additional Users</span>
              </div>
              <span>
                {isAddUsersOpen ? (
                  <MdOutlineKeyboardArrowDown
                    className={
                      isActive("/users") ? "text-blue-600" : "text-gray-600"
                    }
                  />
                ) : (
                  <MdOutlineKeyboardArrowRight
                    className={
                      isActive("/users") ? "text-blue-600" : "text-gray-600"
                    }
                  />
                )}
              </span>
            </button>

            {isAddUsersOpen && (
              <div className="bg-gray-50 py-1">
                <div
                  className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                    location.pathname === "/users/register-rte"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => navigate("/users/register-rte")}
                >
                  Register RTE User
                </div>
                <div
                  className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                    location.pathname === "/users/rte-details"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => navigate("/users/rte-details")}
                >
                  RTE Details
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Dropdown - Only for Admin (1) and RTE (2) */}
        {(roleId === 1 || roleId === 2) && (
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
                <GrSchedules
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
                  Allocate Groups
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
        )}

        {/* Requests Dropdown - Only visible for RTE Officer (role_id = 2) */}
        {(roleId === 2 || roleId === 1) && (
          <div className="mb-1">
            <button
              className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
                isActive("/requests")
                  ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={toggleRequestsMenu}
            >
              <div className="flex items-center gap-3">
                <PiClockUserDuotone
                  className={
                    isActive("/requests") ? "text-blue-600" : "text-gray-600"
                  }
                  size={20}
                />
                <span className="font-medium">Requests</span>
                {pendingRequestsCount > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequestsCount}
                  </div>
                )}
              </div>
              <span>
                {isRequestsOpen ? (
                  <MdOutlineKeyboardArrowDown
                    className={
                      isActive("/requests") ? "text-blue-600" : "text-gray-600"
                    }
                  />
                ) : (
                  <MdOutlineKeyboardArrowRight
                    className={
                      isActive("/requests") ? "text-blue-600" : "text-gray-600"
                    }
                  />
                )}
              </span>
            </button>

            {isRequestsOpen && (
              <div className="bg-gray-50 py-1">
                <div
                  className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                    location.pathname === "/requests/classroom"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => navigate("/requests/classroom")}
                >
                  Classroom Requests
                </div>
              </div>
            )}
          </div>
        )}

        {/* Meeting Requests Dropdown - Only visible for Teachers (role_id = 3) and Admin (role_id = 1) */}
        {(roleId === 1 || roleId === 3) && (
          <div className="mb-1">
            <button
              className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
                isActive("/meeting-requests")
                  ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={toggleMeetingRequestsMenu}
            >
              <div className="flex items-center gap-3">
                <LiaPersonBoothSolid
                  className={
                    isActive("/meeting-requests")
                      ? "text-blue-600"
                      : "text-gray-600"
                  }
                  size={20}
                />
                <span className="font-medium">Meeting Requests</span>
              </div>
              <span>
                {isMeetingRequestsOpen ? (
                  <MdOutlineKeyboardArrowDown
                    className={
                      isActive("/meeting-requests")
                        ? "text-blue-600"
                        : "text-gray-600"
                    }
                  />
                ) : (
                  <MdOutlineKeyboardArrowRight
                    className={
                      isActive("/meeting-requests")
                        ? "text-blue-600"
                        : "text-gray-600"
                    }
                  />
                )}
              </span>
            </button>

            {isMeetingRequestsOpen && (
              <div className="bg-gray-50 py-1">
                <div
                  className={`pl-14 py-2 text-sm cursor-pointer transition-colors ${
                    location.pathname === "/meeting-requests/view"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => navigate("/meeting-requests/view")}
                >
                  View Requests
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notification Card Section */}
        <Notification />

        {/* Profile section at the bottom - Visible for all users */}
        <div className="mt-auto border-t border-gray-200">
          <button
            onClick={openProfile}
            className="flex items-center w-full p-4 hover:bg-blue-50 transition-colors"
          >
            <div className="relative">
              {userData?.profile_image ? (
                <img
                  src={userData.profile_image}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-grey-100 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  <img src="/src/assets/Profile.png" alt="" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-800">{userData?.username}</p>
            </div>
          </button>
        </div>

        {/* Profile Modal */}
        {isProfileOpen && isProfileDataReady && (
          <Profile userData={userData} onClose={closeProfile} />
        )}
      </div>
    </div>
  );
};

export default DashboardMenu;
