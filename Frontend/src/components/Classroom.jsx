import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdUnfoldMore } from "react-icons/md";

const Classroom = () => {
  return (
    <div className=" h-screen w-[83.2vw]">
      <div>
        <div className="flex items-center gap-2 p-5">
          <h1 className="font-medium text-2xl">CLASSROOM DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>
        {/* Body */}
      </div>
    </div>
  );
};

export default Classroom;
