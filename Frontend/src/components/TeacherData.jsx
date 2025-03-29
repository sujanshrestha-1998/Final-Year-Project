import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdEditDocument } from "react-icons/md";
import { format } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Add this import at the top
import TeacherEdit from "./TeacherEdit";

const TeacherData = () => {
  // Replace student data with teacher data state
  const [teachersData, setTeachersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize with no teacher selected
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Add state for edit panel
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  // Handle edit button click
  const handleEditClick = () => {
    // Only open the panel if a teacher is selected
    if (selectedTeacher) {
      setIsEditPanelOpen(true);
    }
  };

  // Function to close the edit panel
  const handleCloseEditPanel = () => {
    setIsEditPanelOpen(false);
  };

  // Function to handle teacher updates
  const handleTeacherUpdated = (updatedTeacher) => {
    // Update the teacher in the list
    setTeachersData((prevData) =>
      prevData.map((teacher) =>
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      )
    );
    // Update selected teacher
    setSelectedTeacher(updatedTeacher);
  };

  // Fetch teachers data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch teachers data
        const teachersResponse = await axios.get(
          "http://localhost:3000/api/teacher_details"
        );

        // Transform the data to match your component's expected format
        const formattedData = teachersResponse.data.teachers.map((teacher) => {
          // Calculate age from date of birth
          const birthDate = new Date(teacher.date_of_birth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          // Convert assigned academics number to corresponding letter
          let academicsName = "Not Assigned";
          if (teacher.assigned_academics) {
            const academicsMap = {
              1: "Academics A",
              2: "Academics B",
              3: "Academics C",
              4: "Academics D",
              5: "Academics E",
            };
            academicsName =
              academicsMap[teacher.assigned_academics] ||
              `Academics ${teacher.assigned_academics}`;
          }

          return {
            id: teacher.teacher_id,
            name: `${teacher.first_name} ${teacher.last_name}`,
            email: teacher.email,
            teacherId: teacher.teacher_id,
            course: teacher.course,
            assignedAcademics: academicsName,
            dob: teacher.date_of_birth,
            age: age,
            enrollmentDate: teacher.enrolled_date,
          };
        });

        setTeachersData(formattedData);
        // Set the first teacher as selected if available
        if (formattedData.length > 0) {
          setSelectedTeacher(formattedData[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load teacher data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter teachers based on search term
  const filteredTeachers = teachersData.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen w-[80vw] overflow-hidden">
      {/* Add a conditional blur overlay when edit panel is open */}
      {isEditPanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

      <div className="mx-8 w-full overflow-auto">
        {/* Top Bar - updated for teachers */}
        <div className="flex items-center gap-4 ">
          <div className="flex items-center gap-2 py-5">
            <h1 className="font-semibold text-2xl text-black">
              TEACHER DETAILS
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content - Teacher List and Details */}
        <div className="flex w-full h-[calc(100vh-150px)]">
          {/* Left Side - Teacher List */}
          <div className="z-10 relative w-[400px] pr-4 overflow-y-auto">
            <h2 className="font-medium text-lg mb-5">All Teachers</h2>

            {loading ? (
              <p className="text-center py-4">Loading teachers...</p>
            ) : error ? (
              <p className="text-center text-red-500 py-4">{error}</p>
            ) : filteredTeachers.length === 0 ? (
              <p className="text-center py-4">No teachers found</p>
            ) : (
              <div className="">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`p-1 border-t-2 cursor-pointer transition-all ${
                      selectedTeacher && selectedTeacher.id === teacher.id
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedTeacher(teacher)}
                  >
                    <div className="ml-1 flex items-center gap-2">
                      <img
                        src="/src/assets/Profile.png"
                        className="w-10 h-10"
                        alt=""
                      />
                      <div>
                        <h3 className="font-medium">{teacher.name}</h3>
                        <p className="text-sm">{teacher.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Teacher Details with fixed layout */}
          <div className="pl-6 z-30 relative ml-[-50px] w-[65vw] h-[700px]">
            <div className="bg-white w-[650px] p-8 shadow-2xl h-full">
              {/* Teacher Header with Name and Email */}
              <div className="border-b pb-4 flex flex-col mb-6 gap-4">
                <div className="flex justify-between">
                  <h1 className="font-medium text-lg">Teacher Information</h1>
                  <button
                    className="text-blue-500 font-medium flex gap-2 items-center"
                    onClick={handleEditClick}
                  >
                    Edit
                    <MdEditDocument />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedTeacher
                      ? selectedTeacher.name
                      : "Teacher Information"}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {selectedTeacher ? selectedTeacher.email : ""}
                  </p>
                </div>
              </div>

              {/* Teacher Information Grid - Now with two columns */}
              <div className="flex gap-6">
                {/* Left column - Information sections */}
                <div className="flex flex-col gap-5 w-1/2">
                  <fieldset className="mb-6">
                    <legend className="text-lg font-bold mb-4 text-blue-500 border-b-2 pb-2">
                      College Information
                    </legend>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        <h1 className="text-gray-500">Teacher ID: </h1>
                        <p className="font-medium text-md">
                          {selectedTeacher
                            ? selectedTeacher.teacherId
                            : "Teacher ID"}
                        </p>
                      </div>
                      <div>
                        <h1 className="text-gray-500">Enrollment Date</h1>
                        <p className="font-medium text-md">
                          {selectedTeacher
                            ? new Date(
                                selectedTeacher.enrollmentDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Enrollment Date"}
                        </p>
                      </div>
                      <div>
                        <h1 className="text-gray-500">Course</h1>
                        <p className="font-medium text-md">
                          {selectedTeacher
                            ? selectedTeacher.course
                            : "Not Assigned"}
                        </p>
                      </div>
                      <div>
                        <h1 className="text-gray-500">Assigned Academics</h1>
                        <p className="font-medium text-md">
                          {selectedTeacher
                            ? selectedTeacher.assignedAcademics
                            : "Not Assigned"}
                        </p>
                      </div>
                    </div>
                  </fieldset>
                  <fieldset className="mb-6">
                    <legend className="text-lg font-bold mb-4 text-blue-500 border-b-2 pb-2">
                      Personal Information
                    </legend>
                    <div className="flex flex-col gap-2">
                      <div>
                        <h1 className="text-gray-500">Date of Birth</h1>
                        <p className="font-medium text-md">
                          {selectedTeacher
                            ? new Date(selectedTeacher.dob).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Date of Birth"}
                        </p>
                      </div>
                      <div>
                        <h1 className="text-gray-500">Age</h1>
                        <p className="font-medium text-md">
                          {selectedTeacher
                            ? `${selectedTeacher.age} years`
                            : "Age"}
                        </p>
                      </div>
                    </div>
                  </fieldset>
                </div>

                {/* Right column - ID Card Design */}
                {selectedTeacher && (
                  <div className="w-[350px] flex items-center justify-center ">
                    <div className="flex flex-col gap-4">
                      {/* Front of ID Card */}
                      <div className="w-[280px] h-[420px] bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200">
                        {/* Green accent line on the right */}
                        <div className="relative h-full">
                          <div className="absolute top-0 right-0 w-1 h-1/4  border-r-2 border-green-600 mr-5"></div>

                          {/* Logo at top */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="w-20 h-8 ">
                                <img src="/src/assets/hck-logo.png" alt="" />
                              </div>
                            </div>

                            {/* Teacher Name */}
                            <div className="mb-4">
                              <h3 className="text-xl font-bold text-gray-800">
                                {selectedTeacher.name}
                              </h3>
                              <p>Teacher</p>
                              <p className="text-[10px] text-gray-500">
                                {selectedTeacher.email}
                              </p>
                            </div>

                            {/* Teacher Photo */}
                            <div className="mb-4">
                              <div className="z-10 relative ml-5 w-52 h-[150px] mt-20 bg-gray-100  overflow-hidden flex items-center justify-center"></div>
                              <img
                                src="/src/assets/Profile-Person.png"
                                alt=""
                                className="w-10/12 h-10/12 object-cover z-20 relative mt-[-200px] ml-5"
                              />
                            </div>

                            {/* Green footer */}
                            <div className="z-40 absolute bottom-0 left-0 right-0 bg-[#86be56] py-2 px-4">
                              <p className="text-white text-xs">
                                Teacher ID: {selectedTeacher.teacherId}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back of ID Card */}
                    </div>
                  </div>
                )}
              </div>

              {!selectedTeacher && !loading && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-white bg-opacity-90 rounded-xl">
                  <div className="text-center">
                    <p className="text-xl font-medium">
                      Select a teacher to view details
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-white bg-opacity-90 rounded-xl">
                  <div className="text-center">
                    <p className="text-xl font-medium">
                      Loading teacher data...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add the TeacherEdit component here, inside the main component return */}
      {selectedTeacher && (
        <TeacherEdit
          isOpen={isEditPanelOpen}
          onClose={handleCloseEditPanel}
          teacherData={selectedTeacher}
          onTeacherUpdated={handleTeacherUpdated}
        />
      )}
    </div>
  );
};

export default TeacherData;
