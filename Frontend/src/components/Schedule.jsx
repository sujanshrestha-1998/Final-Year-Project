import React, { useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FaUserGroup } from "react-icons/fa6";
import AllocateGroup from "./AllocateGroup";

const Schedule = () => {
  const [showAllocateGroup, setShowAllocateGroup] = useState(true); // Set to true by default

  const handleAllocateClick = () => {
    setShowAllocateGroup(!showAllocateGroup);
  };

  return (
    <div className="bg-[#f2f1f1] w-screen h-screen">
      <div className="mx-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">SCHEDULE INFORMATION</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>

        <div className="flex mt-5">
          <button
            onClick={handleAllocateClick}
            className={`w-fit px-6 py-2 rounded-[8px] flex items-center gap-2 font-medium transition-all duration-300 ${
              showAllocateGroup
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FaUserGroup className="text-lg" />
            Allocate Student Group
          </button>

          {/* Render AllocateGroup component based on state */}
          <div className="ml-4">{showAllocateGroup && <AllocateGroup />}</div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
