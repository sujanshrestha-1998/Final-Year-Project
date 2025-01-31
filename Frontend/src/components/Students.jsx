import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { FaRegAddressCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { HiOutlineChevronUpDown } from "react-icons/hi2";

// Loading Component
const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Loading student details...
        </p>
      </div>
    </div>
  );
};

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
  if (!selectedStudent) return <p>Select a student to view details</p>;

  // Utility to format date for input (YYYY-MM-DD)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Utility to format date for readable display
  const formatDateForDisplayReadable = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative">
      {isEditing ? (
        // Edit Mode
        <div className="p-5 w-2/4 bg-white rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Edit Student Details
          </h2>
          <form className="flex flex-col gap-4">
            {/* Personal Information */}
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
                    type="date"
                    name="date_of_birth"
                    value={formatDateForDisplay(selectedStudent.date_of_birth)}
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
                {formatDateForDisplayReadable(selectedStudent.date_of_birth)}
              </p>
              <p className="text-gray-500">
                <strong className="text-black">Enrolled Date:</strong>{" "}
                {formatDateForDisplayReadable(selectedStudent.enrollment_date)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Students = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [originalStudent, setOriginalStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/stud_details"
        );
        setStudents(response.data.students);
        setError("");

        const selectedId = localStorage.getItem("selectedStudentId");
        const isLoading = localStorage.getItem("isLoading");

        if (selectedId) {
          console.log("Selected ID from localStorage:", selectedId);
          setLoading(true); // Only set loading when selecting a student

          const student = response.data.students.find(
            (s) => String(s.stud_id) === String(selectedId)
          );

          console.log("Found student:", student);

          if (student) {
            // Add delay only when loading a specific student
            await new Promise((resolve) => setTimeout(resolve, 800));
            setSelectedStudent(student);
            setOriginalStudent({ ...student });
          }
          localStorage.removeItem("isLoading");
        } else if (response.data.students.length > 0) {
          setSelectedStudent(response.data.students[0]);
          setOriginalStudent({ ...response.data.students[0] });
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError(
          "Error fetching student details. " +
            (err.response ? err.response.data : err.message)
        );
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentClick = async (student) => {
    setLoading(true); // Start loading animation
    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Add delay for animation
      setSelectedStudent(student);
      setOriginalStudent({ ...student });
      localStorage.setItem("selectedStudentId", student.stud_id);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setSelectedStudent({
      ...selectedStudent,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setSelectedStudent({ ...originalStudent });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const updatedData = {};

    for (let key in originalStudent) {
      if (selectedStudent[key] !== originalStudent[key]) {
        updatedData[key] = selectedStudent[key];
      }
    }

    if (Object.keys(updatedData).length === 0) {
      window.location.reload();
      return;
    }

    updatedData.stud_id = selectedStudent.stud_id;

    try {
      const response = await axios.put(
        "http://localhost:3000/api/update_students",
        updatedData
      );

      if (response.status === 200) {
        setOriginalStudent({ ...selectedStudent });
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleRegisterClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/registerstudent");
    }, 1500);
  };

  return (
    <div className="bg-[#f2f1f1] w-screen h-screen">
      <div className="mx-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">STUDENT DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>

        <div className="flex mt-5">
          <button
            onClick={handleRegisterClick}
            className="bg-blue-500 rounded-[8px] px-6 py-1 flex justify-center font-medium items-center gap-2 text-white transform transition-all duration-300"
          >
            Register Student
            <FaRegAddressCard className="bg-blue-500 text-lg" />
          </button>
        </div>

        {error && <p className="text-red-600 font-bold">{error}</p>}

        <div className="flex w-full gap-20">
          {/* Student List Section - No loading state */}
          <div className="w-1/4">
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
          </div>

          {/* Details Section - With loading state */}
          <div className="w-3/5 mt-6">
            {loading ? (
              // Skeleton loading only for student details with reduced width
              <div className="animate-pulse w-1/2">
                <div className="h-8 w-36 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              selectedStudent && (
                <StudentDetails
                  selectedStudent={selectedStudent}
                  isEditing={isEditing}
                  onChange={handleChange}
                  onCancel={handleCancel}
                  onSave={handleSave}
                  onEditClick={handleEditClick}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
