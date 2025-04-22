import React, { useState, useEffect, useCallback } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdMeetingRoom } from "react-icons/md";
import axios from "axios";
import AcademicBlockPopup from "./AcademicBlockPopup";
import TeacherMeetingPanel from "./TeacherMeetingPanel"; // Import the TeacherMeetingPanel component

const Teacher = () => {
  // State for storing teachers grouped by academic block
  const [academicTeachers, setAcademicTeachers] = useState({});
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // State to track which academic block is being hovered
  const [hoveredBlock, setHoveredBlock] = useState(null);
  // State to track if search is in progress
  const [isSearching, setIsSearching] = useState(false);
  // New state for popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockInfo, setBlockInfo] = useState({});

  // New state for meeting panel
  const [isMeetingPanelOpen, setIsMeetingPanelOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  // Debounce function to prevent excessive API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Function to fetch teachers data from API
  const fetchTeachers = async (query = "") => {
    try {
      if (!isSearching) setLoading(true);

      // Determine the API endpoint based on whether there's a search query
      const endpoint = query.trim()
        ? `http://localhost:3000/api/search_teachers?query=${query}`
        : "http://localhost:3000/api/teacher_details";

      const response = await axios.get(endpoint);

      if (response.data && response.data.teachers) {
        // Group teachers by their assigned academics
        const groupedTeachers = {};

        // Initialize all academic blocks with empty arrays
        for (let i = 1; i <= 5; i++) {
          groupedTeachers[`Academics ${String.fromCharCode(64 + i)}`] = [];
        }

        // Populate the groups with teachers
        response.data.teachers.forEach((teacher) => {
          const academicKey = `Academics ${String.fromCharCode(
            64 + parseInt(teacher.assigned_academics)
          )}`;
          if (groupedTeachers[academicKey]) {
            groupedTeachers[academicKey].push({
              name: `${teacher.first_name} ${teacher.last_name}`,
              subject: teacher.course,
            });
          }
        });

        setAcademicTeachers(groupedTeachers);

        // If search returns results, automatically highlight the first teacher's location
        if (query.trim() && response.data.teachers.length > 0) {
          const firstTeacher = response.data.teachers[0];
          const blockName = `Academics ${String.fromCharCode(
            64 + parseInt(firstTeacher.assigned_academics)
          )}`;
          setHoveredBlock(blockName);
        }
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // Create a debounced version of the search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      fetchTeachers(query);
    }, 300),
    []
  );

  // Initial data fetch
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Function to handle search input change with real-time results
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);
    debouncedSearch(query);
  };

  // Function to handle mouse enter
  const handleMouseEnter = (blockName) => {
    setHoveredBlock(blockName);
  };

  // Function to handle mouse leave
  const handleMouseLeave = () => {
    // Only clear hover state if not in search mode
    if (!searchQuery.trim()) {
      setHoveredBlock(null);
    }
  };

  // Function to handle block click
  const handleBlockClick = (blockName) => {
    // Set block information based on the selected block
    const blockInfoData = {
      "Academics A": {
        location: "Administration Building",
        floor: "Ground Floor",
        facilities: "Classrooms, Computer Lab, Staff Room",
      },
      "Academics B": {
        location: "Administration Building",
        floor: "First Floor",
        facilities: "Lecture Halls, Meeting Rooms",
      },
      "Academics C": {
        location: "Administration Building",
        floor: "Second Floor",
        facilities: "Research Labs, Faculty Offices",
      },
      "Academics D": {
        location: "Resource Building",
        floor: "First Floor",
        facilities: "Seminar Rooms, Study Areas",
      },
      "Academics E": {
        location: "Administration Building",
        floor: "Second Floor",
        facilities: "Tutorial Rooms, Department Office",
      },
    };

    setSelectedBlock(blockName);
    setBlockInfo(blockInfoData[blockName] || {});
    setIsPopupOpen(true);
  };

  // Function to open meeting panel with teachers from a specific block
  const openMeetingPanel = (blockName) => {
    // Fetch all teachers first to ensure we have the complete data
    axios
      .get("http://localhost:3000/api/teacher_details")
      .then((response) => {
        if (response.data && response.data.teachers) {
          let teachersToShow = response.data.teachers;
          
          // Make sure we have the complete teacher objects with teacher_id
          teachersToShow = teachersToShow.map(teacher => ({
            teacher_id: teacher.teacher_id,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            course: teacher.course,
            // Include any other properties needed
          }));
  
          // If a specific block is selected, filter teachers by that block
          if (blockName && academicTeachers[blockName]) {
            const blockTeacherNames = academicTeachers[blockName].map((t) =>
              t.name.toLowerCase()
            );
            teachersToShow = teachersToShow.filter((teacher) =>
              blockTeacherNames.includes(
                `${teacher.first_name} ${teacher.last_name}`.toLowerCase()
              )
            );
          }
  
          setSelectedTeachers(teachersToShow);
          setIsMeetingPanelOpen(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      });
  };

  // Function to close popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedBlock(null);
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="mx-8 w-full overflow-auto">
        {/* Top Section */}

        <div className="flex items-center justify-between mr-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 py-5">
              <h1 className="font-semibold text-2xl text-black">
                ACADEMICS MAP
              </h1>
              <IoMdInformationCircleOutline className="text-2xl" />
            </div>
            <div className="relative w-80">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search teacher by name or email"
                className="w-full pl-8 pr-4 py-1 bg-gray-200 rounded-md 
                 text-[14px] border-none 
                 transition-all duration-200 placeholder-gray-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Schedule Meeting Button */}
            <button
              onClick={() => openMeetingPanel()}
              className="flex items-center gap-2 bg-white/80 text-black px-4 py-1.5 rounded-xl shadow-md backdrop-blur-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300 border border-gray-300"
            >
              <MdMeetingRoom className="text-gray-700 text-lg" />
              <span className="font-medium text-sm">Schedule Meeting</span>
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Bottom Section - Using Flexbox to position sections side by side */}
        {!loading && (
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
                        onClick={() => handleBlockClick("Academics E")}
                      >
                        <h1 className="text-white ml-2 font-medium mt-2">
                          Academics E
                        </h1>
                        {hoveredBlock === "Academics E" &&
                          academicTeachers["Academics E"] &&
                          academicTeachers["Academics E"].length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                              <h3 className="font-bold mb-2">
                                Academics E Teachers
                              </h3>
                              {academicTeachers["Academics E"].map(
                                (teacher, idx) => (
                                  <div key={idx} className="mb-2">
                                    <p className="font-medium">
                                      {teacher.name}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                      {teacher.subject}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        {hoveredBlock === "Academics E" &&
                          (!academicTeachers["Academics E"] ||
                            academicTeachers["Academics E"].length === 0) && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                              <h3 className="font-bold mb-2">
                                Academics E Teachers
                              </h3>
                              <p className="text-sm text-gray-300">
                                No teachers assigned to this block
                              </p>
                            </div>
                          )}
                      </div>
                      <div
                        className="w-40 h-48 bg-[#92bd63] shadow-lg shadow-gray-800/50 relative cursor-pointer hover:bg-[#7da952] transition-colors duration-200"
                        onMouseEnter={() => handleMouseEnter("Academics C")}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleBlockClick("Academics C")}
                      >
                        <h1 className="text-white p-2 font-medium ">
                          Academics C
                        </h1>
                        {hoveredBlock === "Academics C" &&
                          academicTeachers["Academics C"] &&
                          academicTeachers["Academics C"].length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                              <h3 className="font-bold mb-2">
                                Academics C Teachers
                              </h3>
                              {academicTeachers["Academics C"].map(
                                (teacher, idx) => (
                                  <div key={idx} className="mb-2">
                                    <p className="font-medium">
                                      {teacher.name}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                      {teacher.subject}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        {hoveredBlock === "Academics C" &&
                          (!academicTeachers["Academics C"] ||
                            academicTeachers["Academics C"].length === 0) && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                              <h3 className="font-bold mb-2">
                                Academics C Teachers
                              </h3>
                              <p className="text-sm text-gray-300">
                                No teachers assigned to this block
                              </p>
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
                        onClick={() => handleBlockClick("Academics B")}
                      >
                        <h1 className="text-white ml-2 font-medium mt-28">
                          Academics B
                        </h1>
                        {hoveredBlock === "Academics B" &&
                          academicTeachers["Academics B"] &&
                          academicTeachers["Academics B"].length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                              <h3 className="font-bold mb-2">
                                Academics B Teachers
                              </h3>
                              {academicTeachers["Academics B"].map(
                                (teacher, idx) => (
                                  <div key={idx} className="mb-2">
                                    <p className="font-medium">
                                      {teacher.name}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                      {teacher.subject}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        {hoveredBlock === "Academics B" &&
                          (!academicTeachers["Academics B"] ||
                            academicTeachers["Academics B"].length === 0) && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                              <h3 className="font-bold mb-2">
                                Academics B Teachers
                              </h3>
                              <p className="text-sm text-gray-300">
                                No teachers assigned to this block
                              </p>
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
                        onClick={() => handleBlockClick("Academics A")}
                      >
                        <h1 className=" ml-2 text-white font-medium mt-28">
                          Academics A
                        </h1>
                        {hoveredBlock === "Academics A" &&
                          academicTeachers["Academics A"] &&
                          academicTeachers["Academics A"].length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                              <h3 className="font-bold mb-2">
                                Academics A Teachers
                              </h3>
                              {academicTeachers["Academics A"].map(
                                (teacher, idx) => (
                                  <div key={idx} className="mb-2">
                                    <p className="font-medium">
                                      {teacher.name}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                      {teacher.subject}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        {hoveredBlock === "Academics A" &&
                          (!academicTeachers["Academics A"] ||
                            academicTeachers["Academics A"].length === 0) && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-50">
                              <h3 className="font-bold mb-2">
                                Academics A Teachers
                              </h3>
                              <p className="text-sm text-gray-300">
                                No teachers assigned to this block
                              </p>
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
            <div className="w-[400px] mt-44">
              <div className="">
                <div className="w-96 h-0.5 bg-black z-10 relative mb-[-20px]  ml-[-20px]"></div>

                <div className="w-52 h-72 border border-gray-400 shadow-lg shadow-gray-800/50">
                  <h1 className=" ml-2 font-medium mt-60">
                    Resource Department
                  </h1>
                </div>

                <div
                  className="z-30 relative mt-[-260px] ml-5 w-36 h-48 bg-[#92bd63] shadow-lg shadow-gray-800/50 cursor-pointer hover:bg-[#7da952] transition-colors duration-200"
                  onMouseEnter={() => handleMouseEnter("Academics D")}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleBlockClick("Academics D")}
                >
                  <h1 className="z-20 relative ml-2 font-medium text-white p-2">
                    Academics D
                  </h1>
                  {hoveredBlock === "Academics D" &&
                    academicTeachers["Academics D"] &&
                    academicTeachers["Academics D"].length > 0 && (
                      <div className="absolute bottom-[-125px] left-[-30px] w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-[100]">
                        <h3 className="font-bold mb-2">Academics D Teachers</h3>
                        {academicTeachers["Academics D"].map((teacher, idx) => (
                          <div key={idx} className="mb-2">
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-sm text-gray-300">
                              {teacher.subject}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  {hoveredBlock === "Academics D" &&
                    (!academicTeachers["Academics D"] ||
                      academicTeachers["Academics D"].length === 0) && (
                      <div className="absolute bottom-[-230px] left-[-30px] w-64 bg-black/90 text-white p-4 rounded-md shadow-xl z-[100]">
                        <h3 className="font-bold mb-2">Academics D Teachers</h3>
                        <p className="text-sm text-gray-300">
                          No teachers assigned to this block
                        </p>
                      </div>
                    )}
                </div>

                <div className="w-96 h-0.5 bg-black z-10 relative mt-4 ml-[-20px]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add the popup component */}
      <AcademicBlockPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        blockName={selectedBlock}
        teachers={selectedBlock ? academicTeachers[selectedBlock] : []}
        blockInfo={blockInfo}
      />

      {/* Add the meeting panel component */}
      <TeacherMeetingPanel
        isOpen={isMeetingPanelOpen}
        onClose={() => setIsMeetingPanelOpen(false)}
        teachers={selectedTeachers}
      />
    </div>
  );
};

export default Teacher;
