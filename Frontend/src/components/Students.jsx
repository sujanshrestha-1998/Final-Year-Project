import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdEditDocument } from "react-icons/md";
import { format } from "date-fns";
import axios from "axios";

const Students = () => {
  // Replace dummy data with state for API data
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]); // Add state for groups

  // Initialize with no student selected
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch students data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both students and groups data
        const [studentsResponse, groupsResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/stud_details"),
          axios.get("http://localhost:3000/api/groups"),
        ]);

        // Store groups data
        setGroups(groupsResponse.data.groups || []);

        // Transform the data to match your component's expected format
        const formattedData = studentsResponse.data.students.map((student) => {
          // Calculate age from date of birth
          const birthDate = new Date(student.date_of_birth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          // Find group name if student has a group
          const groupInfo = student.stud_group
            ? groupsResponse.data.groups.find(
                (g) => g.id === student.stud_group
              )
            : null;

          return {
            id: student.stud_id,
            name: `${student.first_name} ${student.last_name}`,
            email: student.student_email,
            rollNo: student.stud_id,
            course: student.grade_level,
            year: student.stud_group
              ? groupInfo
                ? groupInfo.name
                : `Group ${student.stud_group}`
              : "Not Assigned",
            groupId: student.stud_group,
            dob: student.date_of_birth,
            age: age,
            enrollmentDate: student.enrollment_date,
          };
        });

        setStudentsData(formattedData);
        // Set the first student as selected if available
        if (formattedData.length > 0) {
          setSelectedStudent(formattedData[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students based on search term
  const filteredStudents = studentsData.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen w-[80vw] overflow-hidden">
      <div className="mx-8 w-full overflow-auto">
        {/* Top Bar - unchanged */}
        <div className="flex items-center gap-4 ">
          <div className="flex items-center gap-2 py-5">
            <h1 className="font-semibold text-2xl text-black">
              STUDENT DETAILS
            </h1>
            <IoMdInformationCircleOutline className="text-2xl" />
          </div>
          <div className="relative w-80">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search student by name or email"
              className="w-full pl-8 pr-4 py-1 bg-gray-200 rounded-md 
               text-[14px] border-none 
               transition-all duration-200 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content - Student List and Details */}
        <div className="flex w-full h-[calc(100vh-150px)]">
          {/* Left Side - Student List */}
          <div className="z-10 relative w-[400px] pr-4 overflow-y-auto">
            <h2 className="font-medium text-lg mb-5">All Students</h2>

            {loading ? (
              <p className="text-center py-4">Loading students...</p>
            ) : error ? (
              <p className="text-center text-red-500 py-4">{error}</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-center py-4">No students found</p>
            ) : (
              <div className="">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-1 border-t-2 cursor-pointer transition-all ${
                      selectedStudent && selectedStudent.id === student.id
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="ml-1 flex items-center gap-2">
                      <img
                        src="/src/assets/Profile.png"
                        className="w-10 h-10"
                        alt=""
                      />
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm">{student.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Student Details with fixed layout */}
          <div className="pl-6 z-30 relative ml-[-50px] w-[65vw] h-[700px]">
            <div className="bg-white w-[650px] p-8 shadow-2xl h-full">
              {/* Student Header with Name and Email */}
              <div className="border-b pb-4 flex flex-col mb-6 gap-4">
                <div className="flex justify-between">
                  <h1 className="font-medium text-lg">Student Information</h1>
                  <button className="text-blue-500 font-medium flex gap-2 items-center">
                    Edit
                    <MdEditDocument />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedStudent
                      ? selectedStudent.name
                      : "Student Information"}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {selectedStudent ? selectedStudent.email : ""}
                  </p>
                </div>
              </div>

              {/* Student Information Grid - Now with two columns */}
              <div className="flex gap-6">
                {/* Left column - Information sections */}
                <div className="flex flex-col gap-5 w-1/2">
                  <fieldset className="mb-6">
                    <legend className="text-lg font-bold mb-4 text-blue-500 border-b-2 pb-2">
                      College Information
                    </legend>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        <h1 className="text-gray-500">Student ID: </h1>
                        <p className="font-medium text-md">
                          {selectedStudent
                            ? selectedStudent.rollNo
                            : "Roll Number"}
                        </p>
                      </div>
                      <div>
                        <h1 className="text-gray-500">Enrollment Date</h1>
                        <p className="font-medium text-md">
                          {selectedStudent
                            ? new Date(
                                selectedStudent.enrollmentDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Enrollment Date"}
                        </p>
                      </div>
                      <div>
                        <h1 className="text-gray-500">Group</h1>
                        <p className="font-medium text-md">
                          {selectedStudent
                            ? selectedStudent.year
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
                          {selectedStudent
                            ? new Date(selectedStudent.dob).toLocaleDateString(
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
                          {selectedStudent
                            ? `${selectedStudent.age} years`
                            : "Age"}
                        </p>
                      </div>
                    </div>
                  </fieldset>
                </div>

                {/* Right column - ID Card Design */}
                {selectedStudent && (
                  <div className="w-[350px] flex items-center justify-center">
                    <div className="flex flex-col gap-4">
                      {/* Front of ID Card */}
                      <div className="w-[280px] h-[420px] bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
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

                            {/* Student Name */}
                            <div className="mb-4">
                              <h3 className="text-xl font-bold text-gray-800">
                                {selectedStudent.name}
                              </h3>
                              <p>Student</p>
                              <p className="text-[10px] text-gray-500">
                                {selectedStudent.email}
                              </p>
                            </div>

                            {/* Student Photo */}
                            <div className="mb-4">
                              <div className="z-10 relative ml-5 w-52 h-[150px] mt-20 bg-gray-100  overflow-hidden flex items-center justify-center"></div>
                              <img
                                src="/src/assets/Profile-Person.png"
                                alt=""
                                className="w-10/12 h-10/12 object-cover z-20 relative mt-[-200px] ml-5"
                              />
                            </div>

                            {/* Green footer */}
                            <div className="absolute bottom-0 left-0 right-0 bg-[#86be56] py-2 px-4">
                              <p className="text-white text-xs">
                                Student ID: {selectedStudent.rollNo}
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

              {!selectedStudent && !loading && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-white bg-opacity-90 rounded-xl">
                  <div className="text-center">
                    <p className="text-xl font-medium">
                      Select a student to view details
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-white bg-opacity-90 rounded-xl">
                  <div className="text-center">
                    <p className="text-xl font-medium">
                      Loading student data...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
