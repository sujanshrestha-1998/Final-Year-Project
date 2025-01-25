import React, { useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FaUserGroup, FaCalendarDays } from "react-icons/fa6";
import AllocateGroup from "./AllocateGroup";

const Schedule = () => {
  const [showAllocateGroup, setShowAllocateGroup] = useState(true);

  const handleAllocateClick = () => {
    setShowAllocateGroup(!showAllocateGroup);
  };

  return (
    <div className="bg-[#f2f1f1] min-h-screen">
      <div className="mx-8">
        {/* Header Section - Consistent with other pages */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">SCHEDULE INFORMATION</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>

        <div className="flex items-center gap-2 mt-2 text-gray-600">
          <FaCalendarDays className="text-lg" />
          <span>Academic Year 2023/24</span>
        </div>

        {/* Content Section with Sidebar Layout */}
        <div className="flex gap-6 mt-5">
          {/* Sidebar with Button */}
          <div className="w-64 flex-shrink-0">
            <button
              onClick={handleAllocateClick}
              className={`w-full px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
                showAllocateGroup
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaUserGroup
                className={`text-lg ${
                  showAllocateGroup ? "text-white" : "text-blue-500"
                }`}
              />
              Allocate Student Group
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow transition-all duration-300">
            {showAllocateGroup && <AllocateGroup />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
