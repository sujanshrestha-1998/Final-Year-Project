import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import "react-datepicker/dist/react-datepicker.css";

const RegisterTeacher = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dob, setDob] = useState(null);
  const [hireDate, setHireDate] = useState(new Date());
  const [department, setDepartment] = useState("");
  const [courses, setCourses] = useState([]); // Add this line

  // Add this useEffect to fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/get_courses");
        const data = await response.json();
        if (data.data) setCourses(data.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);
  const [email, setEmail] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Generate a random 4-digit number for Teacher ID
  const generateRandomTeacherId = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return randomId.toString();
  };

  // Update email and teacher ID when department or names change
  useEffect(() => {
    if (department) {
      setTeacherId(generateRandomTeacherId());
      const firstName = document.getElementById("firstName")?.value || "";
      const lastName = document.getElementById("lastName")?.value || "";
      setEmail(
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@heraldcollege.edu.np`
      );
    }
  }, [department]);

  useEffect(() => {
    if (department) {
      setTeacherId(generateRandomTeacherId());
      const firstName = document.getElementById("firstName")?.value || "";
      const lastName = document.getElementById("lastName")?.value || "";
      if (firstName && lastName) {
        setEmail(
          `${firstName.toLowerCase()}.${lastName.toLowerCase()}@heraldcollege.edu.np`
        );
      }
    }
  }, [department]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    // Format the dates as yyyy-mm-dd
    const formattedDob = dob ? dob.toISOString().split("T")[0] : "";
    const formattedHireDate = hireDate
      ? hireDate.toISOString().split("T")[0]
      : "";

    // Dynamically set the teacher data
    const teacherData = {
      teacherId: teacherId,
      email: email,
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      dob: formattedDob,
      enrolledDate: formattedHireDate, // Using hireDate as enrollment date
      password: password,
      course: "Management",
    };

    try {
      const response = await fetch("http://localhost:3000/api/teacher_post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherData),
      });

      const result = await response.json();

      if (response.ok) {
        navigate("/teachers");
      } else {
        setFormError(result.message || "An error occurred while registering.");
      }
    } catch (error) {
      setFormError("An error occurred while registering.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-100">
  //       <div className="loader w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
  //     </div>
  //   );
  // }

  return (
    <div className=" h-screen w-[70vw] p-5">
      {/* <div className="ml-[475px] my-10">
        <button
          onClick={() => navigate("/teachers")}
          className="flex justify-center items-center gap-1 font-semibold text-blue-500"
        >
          <IoChevronBackOutline />
          Teacher Dashboard
        </button>
      </div> */}
      <div className="flex flex-col justify-center items-center gap-8">
        <img
          src="/src/assets/hck-logo.png"
          alt="Logo"
          width={200}
          height={300}
        />
        <h1 className="text-3xl font-semibold">Teacher Registration Form</h1>
        <form
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

          {/* Employment Information */}
          <fieldset className="mb-6">
            <legend className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">
              Employment Information
            </legend>
            <div className="mb-4">
              <label
                htmlFor="department"
                className="block text-gray-700 font-medium mb-2"
              >
                Department
              </label>
              <div className="relative w-full">
                <select
                  id="department"
                  name="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full p-2 pr-8 text-sm border bg-white rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="" disabled>
                    Select your department
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-[10px]">
                  <HiOutlineChevronUpDown />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="hireDate"
                className="block text-gray-700 font-medium mb-2"
              >
                Hire Date
              </label>
              <DatePicker
                selected={hireDate}
                onChange={(date) => setHireDate(date)}
                dateFormat="yyyy/MM/dd"
                placeholderText="YYYY/MM/DD"
                className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="teacherId"
                className="block text-gray-700 font-medium mb-2"
              >
                Teacher ID
              </label>
              <input
                type="text"
                id="teacherId"
                name="teacherId"
                value={teacherId}
                readOnly
                className="w-full p-3 text-sm border bg-gray-200 rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </fieldset>

          {/* Login Information */}
          <fieldset className="mb-6">
            <legend className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">
              Login Information
            </legend>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                readOnly
                className="w-full p-3 text-sm border bg-gray-200 rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
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
                className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
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
                className="w-full p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-3 rounded-[8px] font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
          {formError && (
            <p className="text-red-500 text-center text-sm mt-4">{formError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterTeacher;
