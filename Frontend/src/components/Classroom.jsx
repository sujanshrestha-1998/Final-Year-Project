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
        <div className="flex gap-10">
          {/* Start of Available Classrooms */}
          <div>
            <div className="flex items-center w-96 justify-between mt-4">
              <h1 className="text-gray-600 text-lg font-medium">
                Available Classes
              </h1>
              <div className="flex text-blue-500 items-center">
                <p>View All</p>
                <MdUnfoldMore />
              </div>
            </div>
            {/* Collection of Available Classes */}
            <div className="mt-2 flex flex-col gap-4">
              <div className="flex items-center">
                <img src="/src/assets/Lecture.png" alt="" width={100} />
                <div>
                  <h1 className="text-lg font-medium">Lt-01 Wulferna </h1>
                  <span className="text-gray-500 text-sm">
                    Next Class Starts At 1:00 <br /> Teacher - Deepson Shrestha{" "}
                    <br /> Module - Cloud Computing
                  </span>
                </div>
              </div>
              <div className="w-96 h-[0.5px] bg-gray-400"></div>
              <div className="flex items-center">
                <img src="/src/assets/Tutorial.png" alt="" width={100} />
                <div>
                  <h1 className="text-lg font-medium">Tr-04 Pulchowk </h1>
                  <span className="text-gray-500 text-sm">
                    Next Class Starts At 2:30 <br /> Teacher - Chiranjivi Khanal{" "}
                    <br /> Module - High Performance Computing
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* End of Available Classrooms */}
          <div className="h-[700px] w-[1px] bg-gray-500"></div>
        </div>
      </div>
    </div>
  );
};

export default Classroom;
