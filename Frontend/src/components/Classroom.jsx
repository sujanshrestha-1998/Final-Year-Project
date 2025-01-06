import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdUnfoldMore } from "react-icons/md";

const Classroom = () => {
  return (
    <div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-2xl">CLASSROOM DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>
        {/* Body */}
      </div>
    </div>
  );
};

export default Classroom;
