import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { FaRegAddressCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronUpDown } from "react-icons/hi2";

// SkeletonLoader Component
// const SkeletonLoader = () => {
//   return (
//     <div className="bg-white p-6 w-1/2 rounded-2xl shadow-lg animate-pulse space-y-4">
//       <div className="h-6 bg-gray-300 rounded w-3/4"></div>
//       <div className="h-4 bg-gray-300 rounded w-1/2"></div>
//       <div className="h-6 bg-gray-300 rounded w-4/5"></div>
//       <div className="h-4 bg-gray-300 rounded w-1/3"></div>
//       <div className="h-6 bg-gray-300 rounded w-2/4"></div>
//     </div>
//   );
// };

// StudentList Component
const StudentList = ({ students, selectedStudent, onStudentClick }) => {
  return (
    <div className="max-h-[500px] overflow-y-auto rounded-[8px] shadow-sm">
      {students.map((student) => (
        <div
          key={student.stud_id}
          className={`border-b border-gray-300 p-2 shadow-md cursor-pointer ${
            selectedStudent && selectedStudent.stud_id === student.stud_id
              ? "bg-blue-500 text-white"
              : "bg-white text-black"
          }`}
          onClick={() => onStudentClick(student)}
        >
          <p
            className={` text-md font-semibold ${
              selectedStudent && selectedStudent.stud_id === student.stud_id
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {student.first_name} {student.last_name}
          </p>
          <p
            className={` text-sm ${
              selectedStudent && selectedStudent.stud_id === student.stud_id
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            {student.student_email}
          </p>
        </div>
      ))}
    </div>
  );
};

// StudentDetails Component
const StudentDetails = ({
  selectedStudent,
  isEditing,
  onChange,
  onCancel,
  onSave,
  onEditClick,
}) => {
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Trigger loading state only when selected student changes
  // useEffect(() => {
  //   if (selectedStudent) {
  //     setIsDetailsLoading(true);
  //     const timer = setTimeout(() => {
  //       setIsDetailsLoading(false);
  //     }, 500); // Skeleton duration

  //     return () => clearTimeout(timer);
  //   }
  // }, [selectedStudent]);

  if (!selectedStudent) return <p>Select a student to view details</p>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* {isDetailsLoading ? (
        <SkeletonLoader />
      ) : */}
      {isEditing ? (
        // Editing Mode
        <div className="p-5 w-2/4 bg-white rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Edit Student Details
          </h2>
          <form className="flex flex-col gap-4">
            {/* Student Information */}
            <fieldset className="mb-6">
              <legend className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">
                Personal Information
              </legend>
              <div className="flex flex-wrap gap-4 ml-2">
                <div>
                  <p className="mb-2">First Name</p>
                  <input
                    type="text"
                    name="first_name"
                    value={selectedStudent.first_name}
                    onChange={onChange}
                    className="w-60 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="mb-2">Last Name</p>
                  <input
                    type="text"
                    name="last_name"
                    value={selectedStudent.last_name}
                    onChange={onChange}
                    className="w-60 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="mb-2">Date of Birth</p>
                  <input
                    type="text"
                    name="date_of_birth"
                    value={selectedStudent.date_of_birth}
                    onChange={onChange}
                    className="w-60 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </fieldset>
            {/* College Information */}
            <fieldset className="mb-6">
              <legend className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">
                College Information
              </legend>
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="mb-2">Email Address</p>
                  <input
                    type="text"
                    name="student_email"
                    value={selectedStudent.student_email}
                    onChange={onChange}
                    className="w-80 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="mb-2">Student ID</p>
                  <input
                    type="text"
                    name="stud_id"
                    value={selectedStudent.stud_id}
                    onChange={onChange}
                    className="w-40 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </fieldset>
          </form>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-1 text-white bg-gray-500 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-1 text-white bg-blue-500 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="p-6 w-1/2 bg-white rounded-xl shadow-sm flex flex-col gap-4 mr-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Student Details
            </h2>
            <button onClick={onEditClick} className="text-blue-500">
              Edit
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-semibold text-2xl">
              {selectedStudent.first_name} {selectedStudent.last_name}
            </p>
            <p className="text-gray-500">{selectedStudent.student_email}</p>
            <hr className="my-4" />
            <div>
              <p className="text-gray-500">
                <strong className="text-black">Student ID:</strong>{" "}
                {selectedStudent.stud_id}
              </p>
              <p className="text-gray-500">
                <strong className="text-black">Semester:</strong>{" "}
                {selectedStudent.grade_level}
              </p>
              <p className="text-gray-500">
                <strong className="text-black">Group:</strong>{" "}
                {selectedStudent.stud_group}
              </p>
              <p className="text-gray-500">
                <strong className="text-black">Date of Birth:</strong>{" "}
                {formatDate(selectedStudent.date_of_birth)}
              </p>
              <p className="text-gray-500">
                <strong className="text-black">Enrolled Date:</strong>{" "}
                {formatDate(selectedStudent.enrollment_date)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [originalStudent, setOriginalStudent] = useState(null); // For tracking original values
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/stud_details"
        );
        setStudents(response.data.students);
        setError("");

        const savedSelectedStudentId =
          localStorage.getItem("selectedStudentId");
        if (savedSelectedStudentId) {
          const savedStudent = response.data.students.find(
            (student) => student.stud_id === parseInt(savedSelectedStudentId)
          );
          if (savedStudent) {
            setSelectedStudent(savedStudent);
            setOriginalStudent({ ...savedStudent }); // Set original data
          }
        } else if (response.data.students.length > 0) {
          const firstStudent = response.data.students[0];
          setSelectedStudent(firstStudent);
          setOriginalStudent({ ...firstStudent }); // Set original data
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError(
          "Error fetching student details. " +
            (err.response ? err.response.data : err.message)
        );
        setStudents([]);
      }
    };

    fetchStudents();
  }, []);

  // Handle student click (select a student)
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setOriginalStudent({ ...student }); // Save original data
    localStorage.setItem("selectedStudentId", student.stud_id);
    setIsEditing(false); // Set to view mode by default
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle form change
  const handleChange = (e) => {
    setSelectedStudent({
      ...selectedStudent,
      [e.target.name]: e.target.value,
    });
  };

  // Handle cancel edit
  const handleCancel = () => {
    setSelectedStudent({ ...originalStudent }); // Revert changes
    setIsEditing(false);
  };

  // Handle save changes
  const handleSave = async () => {
    const updatedData = {};

    // Compare originalStudent and selectedStudent
    for (let key in originalStudent) {
      if (selectedStudent[key] !== originalStudent[key]) {
        updatedData[key] = selectedStudent[key];
      }
    }

    // No changes detected
    if (Object.keys(updatedData).length === 0) {
      alert("No changes to save.");
      return;
    }

    updatedData.stud_id = selectedStudent.stud_id;

    try {
      const response = await axios.put(
        "http://localhost:3000/api/update_students",
        updatedData
      );

      if (response.status === 200) {
        setOriginalStudent({ ...selectedStudent }); // Update original data to reflect changes
        setIsEditing(false); // Switch back to view mode
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  // Handle register button click
  const handleRegisterClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/registration");
    }, 1500); // 1.5 seconds delay for loading animation
  };

  return (
    <div className="bg-[#f2f1f1] w-screen h-screen">
      <div className="mx-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">STUDENT DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>

        {error && <p className="text-red-600 font-bold">{error}</p>}

        <div className="flex w-full gap-20">
          {/* Student List Section */}
          <div className="w-2/5">
            {students.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">All Students</h2>
                <StudentList
                  students={students}
                  selectedStudent={selectedStudent}
                  onStudentClick={handleStudentClick}
                />
              </div>
            ) : (
              <p className="text-gray-600 mt-6">No students found</p>
            )}

            <div className="flex justify-center mt-10">
              <button
                onClick={handleRegisterClick}
                className="bg-blue-500 rounded-[8px] px-6 py-1 flex justify-center font-medium items-center gap-2 text-white transform transition-all duration-300 "
              >
                {loading ? (
                  <div className="loader w-6 h-6 border-2 border-t-transparent bg-blue-500 border-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Register Students
                    <FaRegAddressCard className="bg-blue-500 text-lg" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full">
            {selectedStudent && (
              <StudentDetails
                selectedStudent={selectedStudent}
                isEditing={isEditing}
                onChange={handleChange}
                onCancel={handleCancel}
                onSave={handleSave}
                onEditClick={handleEditClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
