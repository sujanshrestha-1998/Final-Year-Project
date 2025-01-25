import React, { useState } from "react";
import { FaUserGroup, FaCalendarDays } from "react-icons/fa6";
import AllocateGroup from "./AllocateGroup";
import { IoMdInformationCircleOutline } from "react-icons/io";

const Schedule = () => {
  const [showAllocateGroup, setShowAllocateGroup] = useState(true);

  const handleAllocateClick = () => {
    setShowAllocateGroup(!showAllocateGroup);
  };

  return (
    <div className="bg-[#f2f2f7] min-h-screen">
      <div className="mx-8">
        {/* Header Section - macOS style */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">STUDENT DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-8">
          {/* Action Button - macOS style */}
          <div className="px-1 py-2">
            <button
              onClick={handleAllocateClick}
              className={`
                inline-flex items-center gap-3 px-5 py-2.5 rounded-lg
                font-medium text-[14px] transition-all duration-200
                ${
                  showAllocateGroup
                    ? "bg-[#0066FF] text-white hover:bg-[#0256d9]"
                    : "bg-[#f5f5f7] text-gray-700 hover:bg-[#e5e5ea]"
                }
              `}
            >
              <FaUserGroup
                className={`text-lg ${
                  showAllocateGroup ? "text-white" : "text-[#0066FF]"
                }`}
              />
              Allocate Groups
            </button>
          </div>

          {/* Main Content Area - macOS style */}
          <div className="transition-all duration-200">
            {showAllocateGroup && <AllocateGroup />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
