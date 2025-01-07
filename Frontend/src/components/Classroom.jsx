import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdUnfoldMore } from "react-icons/md";

const Classroom = () => {
  return (
    <div className="bg-[#f2f1f1] h-screen my-24 ">
      <div>
        <div className="flex items-center gap-2 mx-8 ">
          <h1 className="font-semibold text-2xl">CLASSROOM DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>
        {/* Body */}
      </div>
    </div>
  );
};

export default Classroom;
