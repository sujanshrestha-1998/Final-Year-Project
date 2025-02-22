import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { FaRegAddressCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import EditStudentPopup from "./EditStudentPopup"; // Import the new popup component

// Loading Component
const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-black">
          Loading student details...
        </p>
      </div>
    </div>
  );
};

// StudentList Component
const StudentList = ({ students, selectedStudent, onStudentClick }) => {
  return (
    <div className="max-h-[500px] overflow-y-auto w-96">
      {students.map((student) => (
        <div
          key={student.stud_id}
          className={`border-b p-2 flex gap-5 cursor-pointer ${
            selectedStudent && selectedStudent.stud_id === student.stud_id
              ? "bg-blue-500 text-white"
              : "bg-white text-black"
          }`}
          onClick={() => onStudentClick(student)}
        >
          <div>
            <img src="/src/assets/Profile.png" alt="" className="w-12 h-auto" />
          </div>
          <div>
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
                  : "bg-white text-black"
              }`}
            >
              {student.student_email}
            </p>
          </div>
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleEditClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSave = () => {
    // Call the onSave function passed from the parent
    onSave();
    handleClosePopup();
  };

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
      <div className="p-6 w-full bg-white rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-black">
            Student Information
          </h2>
          <button
            onClick={handleEditClick}
            className="text-blue-500 flex items-center gap-2"
          >
            <FiEdit /> Edit
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-2xl text-black">
            {selectedStudent.first_name} {selectedStudent.last_name}
          </p>
          <p className="text-black">{selectedStudent.student_email}</p>
          <hr className="my-4" />
          <div>
            <p className="text-black">
              <strong className="text-black">Student ID:</strong>{" "}
              {selectedStudent.stud_id}
            </p>
            <p className="text-black">
              <strong className="text-black">Semester:</strong>{" "}
              {selectedStudent.grade_level}
            </p>
            <p className="text-black">
              <strong className="text-black">Group:</strong>{" "}
              {selectedStudent.stud_group}
            </p>
            <p className="text-black">
              <strong className="text-black">Date of Birth:</strong>{" "}
              {formatDateForDisplayReadable(selectedStudent.date_of_birth)}
            </p>
            <p className="text-black">
              <strong className="text-black">Enrolled Date:</strong>{" "}
              {formatDateForDisplayReadable(selectedStudent.enrollment_date)}
            </p>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm z-40" />{" "}
          {/* Blur effect overlay */}
          <EditStudentPopup
            student={selectedStudent}
            onClose={handleClosePopup}
            onChange={onChange}
            onSave={handleSave}
          />
        </>
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
    <div className="h-screen w-full overflow-hidden">
      <div className="mx-8 w-full overflow-auto">
        <div className="flex items-center gap-2 py-5">
          <h1 className="font-medium text-2xl text-black">STUDENT DETAILS</h1>
          <IoMdInformationCircleOutline className="text-2xl " />
        </div>

        {/* <div className="flex mt-5">
          <button
            onClick={handleRegisterClick}
            className="bg-blue-500 rounded-[8px] px-6 py-1 flex justify-center font-medium items-center gap-2 text-white transform transition-all duration-300"
          >
            Register Student
            <FaRegAddressCard className="bg-blue-500 text-lg" />
          </button>
        </div> */}

        {error && <p className="text-red-600 font-bold">{error}</p>}

        <div className="flex gap-20 overflow-hidden">
          {/* Student List Section - No loading state */}
          <div className="flex-shrink-0">
            {students.length > 0 ? (
              <div className="">
                <h2 className="text-xl font-medium mb-4 text-black">
                  All Students
                </h2>
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
          {/* Keep the divider always visible */}
          <div className="h-[80vh] w-[0.5px] bg-black"></div>
          {/* Details Section - With loading state */}
          <div className="w-4/5 flex flex-col mt-6">
            {loading ? (
              <p className="text-black">Loading student details...</p>
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
