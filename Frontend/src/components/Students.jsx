import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FiEdit } from "react-icons/fi";

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

  if (!selectedStudent) return <p>Select a student to view details</p>;

  const customFields = [
    { label: "Student Name", fields: ["first_name", "last_name"] },
    { label: "Email", field: "student_email" },
    { label: "Student ID", field: "stud_id" },
    { label: "Level", field: "grade_level" },
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

  const handleCancelButtonClick = () => {
    handleSubmitClick(); // First function
    onCancel(); // Second function
  };

  return (
    <div className="relative">
      {isLoadingEdit && (
        <div className="absolute w-1/3 rounded-2xl inset-0 flex items-center justify-center bg-white bg-opacity-40 backdrop-blur-sm z-10">
          <div className="loader w-12 h-12 border-4 border-t-transparent border-black rounded-full animate-spin"></div>
        </div>
      )}
      {isLoading && (
        <div className="absolute w-2/4 rounded-2xl inset-0 flex items-center justify-center bg-white bg-opacity-40 backdrop-blur-sm z-10">
          <div className="loader w-12 h-12 border-4 border-t-transparent border-black rounded-full animate-spin"></div>
        </div>
      )}

      {isEditing ? (
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
                      className="w-full p-2 mb-4 border rounded bg-white"
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
                      className="w-full p-2 mb-4 border rounded bg-white"
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
              className="px-6 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmitClick}
              className="px-6 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 w-1/3 bg-white rounded-2xl shadow-lg flex flex-col gap-4">
          <div className="bg-white flex items-center text-center">
            <h2 className="text-xl font-bold bg-white">Student Details</h2>
            <button onClick={handleEditClick} className="ml-2 text-blue-500">
              <FiEdit className="bg-white text-lg" />
            </button>
          </div>

          <img
            src="/src/assets/Profile.png"
            alt="Profile"
            className="w-32 h-30 mx-auto mt-2 bg-white"
          />
          <div className="bg-white">
            {customFields.map(({ label, fields, field }) => {
              if (fields) {
                const fullName =
                  selectedStudent[fields[0]] + " " + selectedStudent[fields[1]];
                return (
                  <p key={label} className="bg-white text-2xl font-semibold">
                    {fullName}
                  </p>
                );
              } else {
                return (
                  <div key={field} className="bg-white">
                    <p className="bg-white text-gray-500 text-md">
                      <strong className="bg-white text-black font-medium">
                        {field !== "student_email" ? label : ""}
                      </strong>{" "}
                      {field === "enrollment_date" || field === "date_of_birth"
                        ? formatDate(selectedStudent[field])
                        : selectedStudent[field]}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">STUDENT DETAILS</h1>
        <IoMdInformationCircleOutline className="text-2xl" />
      </div>

      {error && <p className="text-red-600 font-bold">{error}</p>}

      <div className="flex w-full gap-20">
        <div className="w-1/5">
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
            <button className="px-6 py-1 bg-blue-500 text-white rounded-[8px] hover:bg-blue-600 focus:outline-none">
              Register Students
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
  );
};

export default Students;
