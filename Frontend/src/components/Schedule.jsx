import React, { useState } from "react";
import { FaUserGroup, FaCalendarDays } from "react-icons/fa6";
import AllocateGroup from "./AllocateGroup";
import AllocateTime from "./AllocateTime";
import { IoMdInformationCircleOutline } from "react-icons/io";

const Schedule = () => {
  const [activeComponent, setActiveComponent] = useState("group");

  const handleAllocateGroupClick = () => {
    setActiveComponent("group");
  };

  const handleAllocateTimeClick = () => {
    setActiveComponent("time");
  };

  return (
    <div className="bg-[#f2f2f7] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header Section - macOS style */}
        <div className="mb-10">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight mb-3">
            Schedule
          </h1>
          <div className="flex items-center gap-2.5 text-gray-500">
            <FaCalendarDays className="text-lg" />
            <span className="text-[15px] font-medium">
              Academic Year 2023/24
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-8">
          {/* Action Buttons - macOS style */}
          <div className="flex gap-4 items-center">
            <button
              onClick={handleAllocateGroupClick}
              className={`
                inline-flex items-center gap-3 px-5 py-2.5 rounded-lg
                font-medium text-[14px] transition-all duration-200
                ${
                  activeComponent === "group"
                    ? "bg-[#0066FF] text-white hover:bg-[#0256d9]"
                    : "bg-[#f5f5f7] text-gray-700 hover:bg-[#e5e5ea]"
                }
              `}
            >
              <FaUserGroup
                className={`text-lg ${
                  activeComponent === "group" ? "text-white" : "text-[#0066FF]"
                }`}
              />
              Allocate Groups
            </button>
            <button
              onClick={handleAllocateTimeClick}
              className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-lg 
                ${
                  activeComponent === "time"
                    ? "bg-[#0066FF] text-white hover:bg-[#0256d9]"
                    : "bg-[#f5f5f7] text-gray-700 hover:bg-[#e5e5ea]"
                }
                font-medium text-[14px] transition-all duration-200`}
            >
              Allocate Time
            </button>
          </div>

          {/* Main Content Area - macOS style */}
          <div className="transition-all duration-200">
            {activeComponent === "group" ? <AllocateGroup /> : <AllocateTime />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
