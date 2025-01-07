import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { FaRegAddressCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// SkeletonLoader Component
const SkeletonLoader = () => {
  return (
    <div className="bg-white p-6 w-1/2 rounded-2xl shadow-lg animate-pulse space-y-4">
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-6 bg-gray-300 rounded w-4/5"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      <div className="h-6 bg-gray-300 rounded w-2/4"></div>
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
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    if (selectedStudent) {
      setIsDetailsLoading(true);
      setTimeout(() => {
        setIsDetailsLoading(false);
      }, 500);
    }
  }, [selectedStudent]);

  if (!selectedStudent) return <p>Select a student to view details</p>;

  const customFields = [
    { label: "Student Name", fields: ["first_name", "last_name"] },
    { label: "Email", field: "student_email" },
    { label: "Student ID", field: "stud_id" },
    { label: "Semester", field: "grade_level" },
    { label: "Group", field: "stud_group" },
    { label: "Date of Birth", field: "date_of_birth" },
    { label: "Enrolled Date", field: "enrollment_date" },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditClick = () => {
    setIsLoadingEdit(true);
    setTimeout(() => {
      setIsLoadingEdit(false);
      onEditClick();
    }, 1000);
  };

  const handleSubmitClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSave();
    }, 1000);
  };

  const handleCancelClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onCancel();
    }, 1000);
  };

  return (
    <div className="relative">
      {isLoadingEdit && (
        <div className="absolute w-1/2 rounded-2xl inset-0 flex items-center justify-center bg-white bg-opacity-40 backdrop-blur-sm z-10">
          <div className="loader w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      {isLoading && (
        <div className="absolute w-2/4 rounded-2xl inset-0 flex items-center justify-center bg-white bg-opacity-40 backdrop-blur-sm z-10">
          <div className="loader w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {isDetailsLoading ? (
        <SkeletonLoader />
      ) : isEditing ? (
        <div className="p-6 w-2/4 bg-white rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 bg-white">
            Edit Student Details
          </h2>
          <form>
            {customFields.map(({ label, fields, field }) => {
              if (fields) {
                const fullName =
                  selectedStudent[fields[0]] + " " + selectedStudent[fields[1]];
                return (
                  <div key={label} className="bg-white">
                    <label className="block font-bold mb-2 bg-white ">
                      {label}
                    </label>
                    <input
                      type="text"
                      name={label}
                      value={fullName}
                      className="w-full p-2 mb-4 border rounded-[8px] bg-white"
                      readOnly
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    key={field}
                    className="bg-white flex justify-center items-center gap-2"
                  >
                    {isEditing || field !== "student_email" ? (
                      <label className="font-bold mb-2 block w-1/4 bg-white">
                        {label}
                      </label>
                    ) : null}
                    <input
                      type="text"
                      name={field}
                      value={
                        field === "enrollment_date" || field === "date_of_birth"
                          ? formatDate(selectedStudent[field])
                          : selectedStudent[field]
                      }
                      onChange={
                        field === "student_email" ? onChange : undefined
                      }
                      className="w-full p-2 mb-4 border rounded-[8px] bg-white"
                      readOnly={field !== "student_email"}
                    />
                  </div>
                );
              }
            })}
          </form>
          <div className="flex justify-end gap-4 bg-white">
            <button
              onClick={handleCancelClick}
              className="px-6 py-1 bg-gray-400 text-white rounded-[8px] hover:bg-gray-500"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmitClick}
              className="px-6 py-1 bg-blue-500 text-white rounded-[8px] hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 w-1/2 bg-white rounded-2xl shadow-lg flex flex-col gap-4">
          <div className="bg-white flex items-center text-center justify-between">
            <h2 className="text-xl font-bold bg-white">Student Details</h2>
            <button onClick={handleEditClick} className="ml-2 text-blue-500">
              <p className="bg-white text-lg mr-1">Edit</p>
            </button>
          </div>

          <img
            src="/src/assets/Profile.png"
            alt="Profile"
            className="w-32 h-30 mx-auto mt-2 bg-white"
          />

          {/* Displaying the student details with conditional styling */}
          <div className="bg-white">
            <p className="bg-white text-2xl font-semibold">
              {selectedStudent.first_name} {selectedStudent.last_name}
            </p>
            <p className="bg-white text-gray-500">
              {selectedStudent.student_email}
            </p>
            <hr className="my-4" />
            <div className="text-[14px]">
              <p className="bg-white text-gray-500">
                <strong className="text-black font-medium bg-white">
                  Student ID:{" "}
                </strong>
                {selectedStudent.stud_id}
              </p>
              <p className="bg-white text-gray-500">
                <strong className="text-black font-medium bg-white">
                  Semester:{" "}
                </strong>
                {selectedStudent.grade_level}
              </p>
              <p className="bg-white text-gray-500">
                <strong className="text-black font-medium bg-white">
                  Group:{" "}
                </strong>
                {selectedStudent.stud_group}
              </p>
              <p className="bg-white text-gray-500">
                <strong className="text-black font-medium bg-white">
                  Date of Birth:{" "}
                </strong>
                {formatDate(selectedStudent.date_of_birth)}
              </p>
              <p className="bg-white text-gray-500">
                <strong className="text-black font-medium bg-white">
                  Enrolled Date:{" "}
                </strong>
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
        setError(""); // Clear any previous errors
        // Get the selected student from localStorage (if available)
        const savedSelectedStudentId =
          localStorage.getItem("selectedStudentId");
        if (savedSelectedStudentId) {
          const savedStudent = response.data.students.find(
            (student) => student.stud_id === parseInt(savedSelectedStudentId)
          );
          if (savedStudent) {
            setSelectedStudent(savedStudent);
          }
        } else if (response.data.students.length > 0) {
          setSelectedStudent(response.data.students[0]);
        }
      } catch (err) {
        setError("Error fetching student details");
        setStudents([]);
      }
    };

    fetchStudents();
  }, []);

  // Handle student click (select a student)
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    localStorage.setItem("selectedStudentId", student.stud_id); // Save selected student to localStorage
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
    setIsEditing(false);
  };

  // Handle save changes
  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
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
    <div className="bg-[#f2f1f1] w-screen h-screen ">
      <div className="mx-8">
        <div className="flex items-center gap-2 ">
          <h1 className="text-2xl font-bold">STUDENT DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>

        {error && <p className="text-red-600 font-bold">{error}</p>}

        <div className="flex w-full gap-20">
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
            <StudentDetails
              selectedStudent={selectedStudent}
              isEditing={isEditing}
              onChange={handleChange}
              onCancel={handleCancel}
              onSave={handleSave}
              onEditClick={handleEditClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
