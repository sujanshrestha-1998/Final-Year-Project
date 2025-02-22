import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdUnfoldMore } from "react-icons/md";

const Classroom = () => {
  return (
    <div className="bg-[#18181b] h-screen w-[83.2vw]">
      <div>
        <div className="flex items-center gap-2 px-5 py-5">
          <h1 className="font-medium text-2xl text-white">CLASSROOM DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl text-white" />
        </div>
        {/* Body */}
      </div>
    </div>
  );
};

export default Classroom;
