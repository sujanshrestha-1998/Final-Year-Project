import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { IoSearch } from "react-icons/io5";

import {
  FaUserGraduate,
  FaUsers,
  FaCalendarAlt,
  FaUserClock,
} from "react-icons/fa";
import { FiBarChart2, FiUserCheck, FiAlertCircle } from "react-icons/fi";
import EditStudentPopup from "./EditStudentPopup";

// Loading Component
const LoadingOverlay = () => {
  return (
    <div className="fixed w-2/4 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-black">
          Loading student details...
        </p>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
      <div
        className={`rounded-full p-3 ${color} bg-opacity-10 flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

// Summary Box Component
const SummaryBox = ({ title, items }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={`font-medium ${item.color || "text-gray-800"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Initials Avatar Component
const InitialsAvatar = ({ firstName, lastName, size = "md" }) => {
  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;

  // Size classes
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-500 flex items-center justify-center text-white font-normal`}
    >
      {initials}
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
          className={`border-b p-2 flex gap-5  rounded-md  cursor-pointer ${
            selectedStudent && selectedStudent.stud_id === student.stud_id
              ? "bg-blue-500 text-white"
              : "bg-white text-black"
          }`}
          onClick={() => onStudentClick(student)}
        >
          <div>
            <InitialsAvatar
              firstName={student.first_name}
              lastName={student.last_name}
              size="sm"
            />
          </div>
          <div>
            <p
              className={`text-md font-semibold ${
                selectedStudent && selectedStudent.stud_id === student.stud_id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              {student.first_name} {student.last_name}
            </p>
            <p
              className={`text-sm ${
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

  // Utility to format date for display
  const formatDateForDisplayReadable = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate age based on date of birth
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return "N/A";

    const birthDate = new Date(birthDateString);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Calculate days since enrollment
  const calculateDaysEnrolled = (enrollmentDateString) => {
    if (!enrollmentDateString) return "N/A";

    const enrollmentDate = new Date(enrollmentDateString);
    const today = new Date();

    const differenceInTime = today.getTime() - enrollmentDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

    return differenceInDays;
  };

  return (
    <div className="relative">
      <div className=" w-3/4 bg-white rounded-md flex flex-col gap-6">
        {/* Header with avatar and edit button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <InitialsAvatar
              firstName={selectedStudent.first_name}
              lastName={selectedStudent.last_name}
              size="lg"
            />
            <div>
              <h2 className="font-semibold text-2xl text-black">
                {selectedStudent.first_name} {selectedStudent.last_name}
              </h2>
              <p className="text-gray-600">{selectedStudent.student_email}</p>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 py-2 px-4 rounded-md transition-colors font-medium"
          >
            <FiEdit /> Edit Profile
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-800 mb-1">Student Overview</h3>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">ID:</span>
              <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium">
                {selectedStudent.stud_id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Group:</span>
              <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium">
                {selectedStudent.stud_group}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Semester:</span>
              <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium">
                {selectedStudent.grade_level}
              </span>
            </div>
          </div>
        </div>

        {/* Information cards grid */}
        <div className="grid grid-cols-2 w-full gap-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>
                <p className="text-black font-semibold">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date of Birth</p>
                <p className="text-black font-semibold">
                  {formatDateForDisplayReadable(selectedStudent.date_of_birth)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Age</p>
                <p className="text-black font-semibold">
                  {calculateAge(selectedStudent.date_of_birth)} years
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Enrollment Details
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-sm">Enrollment Date</p>
                <p className="text-black font-semibold">
                  {formatDateForDisplayReadable(
                    selectedStudent.enrollment_date
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Days Enrolled</p>
                <p className="text-black font-semibold">
                  {calculateDaysEnrolled(selectedStudent.enrollment_date)} days
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Current Status</p>
                <p className="text-green-600 font-semibold">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Contact Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Email Address</p>
                <p className="text-black font-semibold">
                  {selectedStudent.student_email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm z-40" />
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
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    newStudentsThisMonth: 0,
    averageAge: 0,
    genderDistribution: { male: 0, female: 0 },
    semesterBreakdown: {},
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/stud_details"
        );
        setStudents(response.data.students);
        setError("");

        // Calculate statistics
        const studentsData = response.data.students;
        calculateStats(studentsData);

        const selectedId = localStorage.getItem("selectedStudentId");
        const isLoading = localStorage.getItem("isLoading");

        if (selectedId) {
          console.log("Selected ID from localStorage:", selectedId);
          setLoading(true); // Only set loading when selecting a student

          const student = studentsData.find(
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
        } else if (studentsData.length > 0) {
          setSelectedStudent(studentsData[0]);
          setOriginalStudent({ ...studentsData[0] });
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

  const calculateStats = (studentsData) => {
    if (!studentsData || studentsData.length === 0) return;

    // Total students count
    const totalStudents = studentsData.length;

    // Active students (assuming 90% are active for this example)
    const activeStudents = Math.floor(totalStudents * 0.9);

    // Inactive students
    const inactiveStudents = totalStudents - activeStudents;

    // Current date for calculations
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // New students this month (random number for demo)
    const newStudentsThisMonth = Math.floor(Math.random() * 10) + 1;

    // Calculate average age
    let totalAge = 0;
    studentsData.forEach((student) => {
      if (student.date_of_birth) {
        const birthDate = new Date(student.date_of_birth);
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDifference = currentDate.getMonth() - birthDate.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        totalAge += age;
      }
    });
    const averageAge = Math.round(totalAge / studentsData.length);

    // Gender distribution (mock data for this example)
    const maleCount = Math.floor(totalStudents * 0.55);
    const femaleCount = totalStudents - maleCount;

    // Semester breakdown (use grade_level field)
    const semesterBreakdown = {};
    studentsData.forEach((student) => {
      const semester = student.grade_level || "Unknown";
      semesterBreakdown[semester] = (semesterBreakdown[semester] || 0) + 1;
    });

    setStats({
      totalStudents,
      activeStudents,
      inactiveStudents,
      newStudentsThisMonth,
      averageAge,
      genderDistribution: { male: maleCount, female: femaleCount },
      semesterBreakdown,
    });
  };

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
        <div className="flex items-center gap-4 ">
          <div className="flex items-center gap-2 py-5">
            <h1 className="font-medium text-2xl text-black">STUDENT DETAILS</h1>
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

        {/* New Statistics Section */}
        {/* <div className="flex gap-4 mb-6">
          <div className="w-48">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={<FaUsers className="text-blue-500" />}
              color="text-blue-500"
            />
          </div>

          <div className="w-60">
            <SummaryBox
              title="Semester Distribution"
              items={Object.entries(stats.semesterBreakdown).map(
                ([semester, count]) => ({
                  label: `${semester}`,
                  value: count,
                  color: "text-blue-600",
                })
              )}
            />
          </div>
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
          <div className="w-0.5 my-10 h-screen bg-gray-200"></div>

          {/* Details Section - With loading state */}
          <div className="w-4/5 flex flex-col mt-6">
            {loading ? (
              <LoadingOverlay />
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
