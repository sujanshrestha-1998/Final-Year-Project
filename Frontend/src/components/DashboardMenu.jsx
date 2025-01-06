import React from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";

const DashboardMenu = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get current location

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="p-8 flex  items-center gap-7">
          <img
            src="/src/assets/hck-logo.png"
            alt="HCK Logo"
            className="w-44 h-auto"
          />
          <div className="flex gap-6 mt-4">
            <button
              className={`text-lg font-semibold ${
                location.pathname === "/dashboard"
                  ? "text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => navigate("/dashboard")} // Navigate to /dashboard
            >
              CLASSROOM
            </button>
            <button
              className={`text-lg font-semibold ${
                location.pathname === "/teachers"
                  ? "text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => navigate("/teachers")} // Navigate to /teachers
            >
              TEACHERS
            </button>
            <button
              className={`text-lg font-semibold ${
                location.pathname === "/students"
                  ? "text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => navigate("/students")} // Navigate to /students
            >
              STUDENTS
            </button>
            <button
              className={`text-lg font-semibold ${
                location.pathname === "/schedule"
                  ? "text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => navigate("/schedule")} // Navigate to /schedule
            >
              SCHEDULE
            </button>
          </div>
          <div className="bg-gray-300 h-8 flex items-center p-2 w-96 rounded-md gap-2 mt-4">
            <IoSearch className="text-gray-700 ml-2 bg-gray-300" />
            <input
              type="text"
              placeholder="Search"
              className="bg-gray-300 flex-grow text-sm text-gray-700 placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center p-10 gap-6">
          <IoMdNotifications className="text-4xl" />
          <div className="flex items-center gap-2">
            <img src="/src/assets/Profile.png" alt="" className="w-12 h-auto" />
            <div>
              <h1 className="font-semibold">Sujan Shrestha</h1>
              <p className="text-sm text-gray-500 font-medium">RTE Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMenu;
