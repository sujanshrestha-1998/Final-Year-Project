import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";

const Teacher = () => {
  // Demo data for teachers in each academic block
  const academicTeachers = {
    "Academics A": [
      { name: "Dr. Sarah Johnson", subject: "Computer Science", room: "A101" },
      {
        name: "Prof. Michael Chen",
        subject: "Software Engineering",
        room: "A102",
      },
      { name: "Dr. Emily Rodriguez", subject: "Data Structures", room: "A103" },
    ],
    "Academics B": [
      { name: "Dr. James Wilson", subject: "Mathematics", room: "B201" },
      { name: "Prof. Lisa Wang", subject: "Statistics", room: "B202" },
      { name: "Dr. Robert Brown", subject: "Physics", room: "B203" },
    ],
    "Academics C": [
      {
        name: "Dr. Olivia Martinez",
        subject: "Artificial Intelligence",
        room: "C301",
      },
      { name: "Prof. David Kim", subject: "Machine Learning", room: "C302" },
      { name: "Dr. Sophia Lee", subject: "Robotics", room: "C303" },
    ],
    "Academics D": [
      { name: "Dr. Thomas Clark", subject: "Database Systems", room: "D401" },
      { name: "Prof. Anna Patel", subject: "Web Development", room: "D402" },
      { name: "Dr. Kevin Zhang", subject: "Mobile Computing", room: "D403" },
    ],
    "Academics E": [
      { name: "Dr. Rachel Green", subject: "Cybersecurity", room: "E501" },
      {
        name: "Prof. Daniel Taylor",
        subject: "Network Engineering",
        room: "E502",
      },
      { name: "Dr. Jessica White", subject: "Cloud Computing", room: "E503" },
    ],
  };

  // State to track which academic block is being hovered
  const [hoveredBlock, setHoveredBlock] = useState(null);

  // Function to handle mouse enter
  const handleMouseEnter = (blockName) => {
    setHoveredBlock(blockName);
  };

  // Function to handle mouse leave
  const handleMouseLeave = () => {
    setHoveredBlock(null);
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* Remove the problematic overlay */}

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
                    <div
                      className="w-40 h-48 bg-[#92bd63] shadow-lg shadow-gray-800/50 relative cursor-pointer hover:bg-[#7da952] transition-colors duration-200"
                      onMouseEnter={() => handleMouseEnter("Academics E")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <h1 className="text-white ml-2 font-medium mt-2">
                        Academics E
                      </h1>
                      {hoveredBlock === "Academics E" && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                          <h3 className="font-bold mb-2">
                            Academics E Teachers
                          </h3>
                          {academicTeachers["Academics E"].map(
                            (teacher, idx) => (
                              <div key={idx} className="mb-2">
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-sm text-gray-300">
                                  {teacher.subject} - Room {teacher.room}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      className="w-40 h-48 bg-[#92bd63] shadow-lg shadow-gray-800/50 relative cursor-pointer hover:bg-[#7da952] transition-colors duration-200"
                      onMouseEnter={() => handleMouseEnter("Academics C")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <h1 className="text-white p-2 font-medium ">
                        Academics C
                      </h1>
                      {hoveredBlock === "Academics C" && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                          <h3 className="font-bold mb-2">
                            Academics C Teachers
                          </h3>
                          {academicTeachers["Academics C"].map(
                            (teacher, idx) => (
                              <div key={idx} className="mb-2">
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-sm text-gray-300">
                                  {teacher.subject} - Room {teacher.room}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-40 h-48 border border-gray-400 shadow-lg bg-white shadow-gray-800/50">
                      <h1 className="p-2 font-medium ">PAT Office</h1>
                    </div>
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
                    <div
                      className="w-64 h-36 bg-[#92bd63] shadow-lg shadow-gray-800/50 relative cursor-pointer hover:bg-[#7da952] transition-colors duration-200"
                      onMouseEnter={() => handleMouseEnter("Academics B")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <h1 className="text-white ml-2 font-medium mt-28">
                        Academics B
                      </h1>
                      {hoveredBlock === "Academics B" && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                          <h3 className="font-bold mb-2">
                            Academics B Teachers
                          </h3>
                          {academicTeachers["Academics B"].map(
                            (teacher, idx) => (
                              <div key={idx} className="mb-2">
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-sm text-gray-300">
                                  {teacher.subject} - Room {teacher.room}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-56 h-36 border bg-white border-gray-400 shadow-lg shadow-gray-800/50">
                      <h1 className="text-black ml-2 font-medium mt-28">
                        IT Department
                      </h1>
                    </div>
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
                      <h1 className=" ml-2 font-medium mt-28">
                        RTE Department
                      </h1>
                    </div>
                    <div className="w-36 h-60 bg-white border-gray-400 shadow-lg shadow-gray-800/50">
                      <h1 className=" ml-2 font-medium mt-44">
                        Student Department
                      </h1>
                    </div>
                    <div
                      className="w-44 h-36 bg-[#92bd63] shadow-lg shadow-gray-800/50 relative cursor-pointer hover:bg-[#7da952] transition-colors duration-200"
                      onMouseEnter={() => handleMouseEnter("Academics A")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <h1 className=" ml-2 text-white font-medium mt-28">
                        Academics A
                      </h1>
                      {hoveredBlock === "Academics A" && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                          <h3 className="font-bold mb-2">
                            Academics A Teachers
                          </h3>
                          {academicTeachers["Academics A"].map(
                            (teacher, idx) => (
                              <div key={idx} className="mb-2">
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-sm text-gray-300">
                                  {teacher.subject} - Room {teacher.room}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
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
          <div className="w-[400px]">
            <div className="mt-56">
              <div className="w-52 h-72 border border-gray-400 shadow-lg shadow-gray-800/50">
                <h1 className=" ml-2 font-medium mt-60">Resource Department</h1>
              </div>
              <div
                className="z-10 relative mt-[-260px] ml-5 w-36 h-48 bg-[#92bd63] shadow-lg shadow-gray-800/50 cursor-pointer hover:bg-[#7da952] transition-colors duration-200"
                onMouseEnter={() => handleMouseEnter("Academics D")}
                onMouseLeave={handleMouseLeave}
              >
                <h1 className="z-20 relative ml-2 font-medium text-white p-2">
                  Academics D
                </h1>
                {hoveredBlock === "Academics D" && (
                  <div className="absolute bottom-[-230px] left-[-30px] w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-[100]">
                    <h3 className="font-bold mb-2">Academics D Teachers</h3>
                    {academicTeachers["Academics D"].map((teacher, idx) => (
                      <div key={idx} className="mb-2">
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-gray-300">
                          {teacher.subject} - Room {teacher.room}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teacher;
