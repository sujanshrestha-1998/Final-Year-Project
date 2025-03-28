import React from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";

const Teacher = () => {
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="mx-8 w-full overflow-auto">
        {/* Top Section */}
        <div className="flex items-center gap-4 ">
          <div className="flex items-center gap-2 py-5">
            <h1 className="font-semibold text-2xl text-black">CAMPUS MAP</h1>
            <IoMdInformationCircleOutline className="text-2xl" />
          </div>
          <div className="relative w-80">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-8 pr-4 py-1 bg-gray-200 rounded-md 
               text-[14px] border-none 
               transition-all duration-200 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Bottom Section - Using Flexbox to position sections side by side */}
        <div className="flex gap-8">
          {/* Left Section */}
          <div>
            {/* Second Floor */}
            <div className="z-30 relative">
              <div className="flex flex-col gap-5">
                <h1>Administration Block</h1>
                <div className="w-[620px] h-0.5 bg-black"></div>
              </div>
              <div className="flex flex-col gap-8 ">
                <div className="mt-4 flex gap-8">
                  <h1 className="text-gray-400">
                    Second <br /> Floor
                  </h1>
                  <div className="flex gap-5">
                    <div className="w-40 h-48 bg-[#92bd63] shadow-lg shadow-gray-800/50">
                      <h1 className="text-white ml-2 font-medium mt-2">
                        Academics E
                      </h1>
                    </div>
                    <div className="w-40 h-48 bg-[#92bd63] shadow-lg shadow-gray-800/50"></div>
                    <div className="w-40 h-48 border border-gray-400 shadow-lg bg-white shadow-gray-800/50"></div>
                  </div>
                </div>
                <div className="w-[620px] h-0.5 bg-black  "></div>
              </div>
            </div>

            {/* First Floor */}
            <div className="z-20 relative mt-[-80px]">
              <div className="flex flex-col gap-8 ">
                <div className="mt-4 flex gap-8">
                  <h1 className="text-gray-400 mt-20">
                    First <br /> Floor
                  </h1>
                  <div className="flex gap-5">
                    <div className="w-64 h-36 bg-[#92bd63] shadow-lg shadow-gray-800/50">
                      <h1 className="text-white ml-2 font-medium mt-28">
                        Academics E
                      </h1>
                    </div>
                    <div className="w-56 h-36 border bg-white border-gray-400 shadow-lg shadow-gray-800/50"></div>
                  </div>
                </div>
                <div className="w-[620px] h-0.5 bg-black"></div>
              </div>
            </div>

            {/* Ground Floor */}
            <div className="z-10 relative mt-[-80px]">
              <div className="flex flex-col gap-8">
                <div className="mt-4 flex gap-8">
                  <h1 className="text-gray-400 mt-20">
                    Ground <br /> Floor
                  </h1>
                  <div className="flex gap-5">
                    <div className="w-36 h-36 bg-white border-gray-400 shadow-lg shadow-gray-800/50">
                      <h1 className=" ml-2 font-medium mt-24">
                        RTE Department
                      </h1>
                    </div>
                    <div className="w-36 h-60 bg-white border-gray-400 shadow-lg shadow-gray-800/50">
                      <h1 className=" ml-2 font-medium mt-44">
                        Student Department
                      </h1>
                    </div>
                    <div className="w-44 h-36 bg-[#92bd63]  shadow-lg shadow-gray-800/50"></div>
                  </div>
                </div>
                <div className="w-[620px] h-0.5 bg-black"></div>
              </div>
            </div>
            <div className="mt-20 ml-10">
              <div className="w-[640px] h-48 bg-white border border-gray-400 p-4 shadow-lg shadow-gray-800/50">
                <h1>Wolverhampton Block</h1>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div>
            <div className="bg-gray-200 h-[800px] w-[150px] shadow-lg shadow-gray-800/50">
              <h1 className="font-medium p-4">Canteen</h1>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="mt-56">
              <div className="z-20 relative w-52 h-72 border border-gray-400 shadow-lg shadow-gray-800/50"></div>
              <div className="z-10 relative mt-[-260px] ml-5 w-36 h-48 bg-[#92bd63] shadow-lg shadow-gray-800/50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teacher;
