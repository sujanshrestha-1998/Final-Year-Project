import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import { FaFileUpload } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

const RegisterStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dob, setDob] = useState(null);
  const [enrollmentDate, setEnrollmentDate] = useState(new Date());
  const [course, setCourse] = useState(""); // Selected course
  const [email, setEmail] = useState(""); // Auto-generated email
  const [studentId, setStudentId] = useState(""); // Auto-generated student ID
  const [password, setPassword] = useState(""); // Password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm Password
  const [passwordError, setPasswordError] = useState(""); // Password mismatch error
  const [isSubmitting, setIsSubmitting] = useState(false); // Form submitting status
  const [formError, setFormError] = useState(""); // Form submission error
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const [isUploadMode, setIsUploadMode] = useState(false); // Toggle between manual and bulk upload
  const [uploadFile, setUploadFile] = useState(null); // File for bulk upload
  const [uploadError, setUploadError] = useState(""); // Error for file upload

  // Generate random 5-digit number
  const generateRandomNumber = () => {
    return Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 5-digit number
  };

  // Update email and student ID based on course selection
  useEffect(() => {
    if (course) {
      const year = "25"; // Represents 2025
      let prefix = "";

      if (course === "Business Administration") {
        prefix = `np03csba${year}`;
      } else if (course === "Information Technology") {
        prefix = `np03cs${year}`;
      } else if (course === "Engineering") {
        prefix = `np03csec${year}`;
      }

      const randomNumber = generateRandomNumber(); // Generate the random number
      setStudentId(randomNumber); // Set Student ID to random number
      setEmail(`${prefix}${randomNumber}@heraldcollege.edu.np`); // Set email with prefix and random number
    }
  }, [course]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle password mismatch validation
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (confirmPassword && e.target.value !== confirmPassword) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (password && password !== e.target.value) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadFile(file);
    setUploadError("");
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    // Check file extension
    const fileExtension = uploadFile.name.split(".").pop().toLowerCase();
    if (
      fileExtension !== "csv" &&
      fileExtension !== "xlsx" &&
      fileExtension !== "xls"
    ) {
      setUploadError("Please upload a valid Excel or CSV file");
      return;
    }

    setIsSubmitting(true);
    setUploadError("");
    setFormError("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const response = await fetch(
        "http://localhost:3000/api/bulk_student_upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(
          `Successfully registered ${result.studentsAdded} students`
        );
        setUploadFile(null);
        // Reset file input
        document.getElementById("fileUpload").value = "";
      } else {
        setUploadError(
          result.message || "An error occurred during bulk registration"
        );
      }
    } catch (error) {
      setUploadError("An error occurred during file upload");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    // Format the dates as yyyy-mm-dd
    const formattedDob = dob ? dob.toISOString().split("T")[0] : ""; // Convert to yyyy-mm-dd format
    const formattedEnrollmentDate = enrollmentDate
      ? enrollmentDate.toISOString().split("T")[0]
      : ""; // Convert to yyyy-mm-dd format

    // Dynamically set the student data
    const studentData = {
      studentId: studentId, // From auto-generation
      email: email, // From auto-generation
      firstName: document.getElementById("firstName").value, // Get from input
      lastName: document.getElementById("lastName").value, // Get from input
      dob: formattedDob, // Formatted date
      enrollmentDate: formattedEnrollmentDate, // Formatted date
      gradeLevel: document.getElementById("semester").value, // Fixed
      studGroup: "", // Fixed or dynamic
      password: password, // User-entered password
    };

    try {
      const response = await fetch("http://localhost:3000/api/stud_post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const result = await response.json();

      if (response.ok) {
        // Handle success
        setSuccessMessage("Student registered successfully!");
        // Reset form
        document.getElementById("registrationForm").reset();
        setDob(null);
        setEnrollmentDate(new Date());
        setCourse("");
        setEmail("");
        setStudentId("");
        setPassword("");
        setConfirmPassword("");
      } else {
        // Handle failure
        setFormError(result.message || "An error occurred while registering.");
      }
    } catch (error) {
      setFormError("An error occurred while registering.");
    } finally {
      setIsSubmitting(false); // Allow for another submission if needed
    }
  };

  return (
    <div className="h-screen w-[70vw] p-5 overflow-auto">
      <div className="flex flex-col justify-center items-center gap-8">
        <img
          src="/src/assets/hck-logo.png"
          alt="Logo"
          width={200}
          height={300}
        />
        <h1 className="text-3xl font-semibold">Student Registration</h1>

        {/* Toggle between manual and bulk upload */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setIsUploadMode(false)}
            className={`px-4 py-2 rounded-md ${
              !isUploadMode
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Manual Registration
          </button>
          <button
            type="button"
            onClick={() => setIsUploadMode(true)}
            className={`px-4 py-2 rounded-md ${
              isUploadMode
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Bulk Upload
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="w-full max-w-3xl p-4 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {isUploadMode ? (
          // Bulk Upload Form
          <div className="w-full max-w-3xl p-8 space-y-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Bulk Student Registration
            </h2>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Upload an Excel or CSV file with student data. The file should
                have the following columns:
              </p>
              <div className="bg-gray-100 p-3 rounded-md text-sm">
                <code>
                  First_Name, Last_Name, Date_of_Birth, Course, Email,
                  Student_Id, Password, Enrolled_Date, Semester
                </code>
              </div>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  <FaFileUpload className="text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    id="fileUpload"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                  >
                    Select File
                  </label>
                </div>
                {uploadFile && (
                  <div className="mt-4 text-left">
                    <p className="text-sm text-gray-700">
                      Selected file:{" "}
                      <span className="font-medium">{uploadFile.name}</span>
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="text-red-500 text-sm mt-2">{uploadError}</div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white font-medium rounded-[8px] hover:bg-blue-600 transition duration-300"
                  disabled={isSubmitting || !uploadFile}
                >
                  {isSubmitting ? "Uploading..." : "Upload and Register"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // Manual Registration Form
          <form
            id="registrationForm"
            className="w-full max-w-3xl p-8 space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Personal Information */}
            <fieldset className="mb-6">
              <legend className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">
                Personal Information
              </legend>
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex-1">
                  <label
                    htmlFor="firstName"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    placeholder="Enter your first name"
                    className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="lastName"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    placeholder="Enter your last name"
                    className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="dob"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Date of Birth
                </label>
                <DatePicker
                  selected={dob}
                  onChange={(date) => setDob(date)}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="YYYY/MM/DD"
                  className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  isClearable
                  showPopperArrow
                />
              </div>
            </fieldset>

            {/* College Information */}
            <fieldset className="mb-6">
              <legend className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">
                College Information
              </legend>
              <div className="mb-4">
                <label
                  htmlFor="course"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Course
                </label>
                <div className="relative w-full">
                  <select
                    id="course"
                    name="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="w-full p-2 pr-8 text-sm border bg-white rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="" disabled>
                      Select your course
                    </option>
                    <option value="Business Administration">
                      Bsc (Hons) Business Administration
                    </option>
                    <option value="Information Technology">
                      Bsc (Hons) Computer Science
                    </option>
                    <option value="Engineering">
                      Bsc (Hons) CyberSecurity
                    </option>
                  </select>

                  {/* Add the icon at the end of the dropdown */}
                  <div className="absolute right-2 top-2 pointer-events-none bg-white">
                    <HiOutlineChevronUpDown
                      size={20}
                      className="text-white h-6 w-5 bg-blue-500 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex-1">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    College Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    readOnly
                    placeholder="Auto-generated email"
                    className="w-full p-3 text-sm border bg-gray-100 rounded-[8px] shadow-sm focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="studentId"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={studentId}
                    readOnly
                    placeholder="Auto-generated student ID"
                    className="w-full p-3 text-sm border bg-gray-100 rounded-[8px] shadow-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex-1">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter your password"
                    className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    placeholder="Confirm your password"
                    className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
              </div>
              {/* Enrollment Date & Level */}
              <div className="flex gap-4">
                <div className="">
                  <label
                    htmlFor="enrollmentDate"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Enrollment Date
                  </label>
                  <DatePicker
                    selected={enrollmentDate}
                    onChange={(date) => setEnrollmentDate(date)}
                    dateFormat="yyyy/MM/dd"
                    placeholderText="YYYY/MM/DD"
                    className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    isClearable
                    showPopperArrow
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="level"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Semester
                  </label>
                  <div className="relative">
                    <select
                      id="semester"
                      name="semester"
                      value="First Semester"
                      disabled
                      required
                      className="w-full p-3 pr-8 text-sm border bg-white rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="First Semester">First Semester</option>
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-[8px] hover:bg-blue-600 transition duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        )}

        {formError && (
          <div className="text-red-500 text-sm mt-4">{formError}</div>
        )}
      </div>
    </div>
  );
};

export default RegisterStudent;
