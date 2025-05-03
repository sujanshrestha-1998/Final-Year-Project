import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import axios from "axios";

const StudentEdit = ({ isOpen, onClose, studentData, onStudentUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    student_email: "",
    grade_level: "",
    stud_group: "",
    date_of_birth: "",
    enrollment_date: "",
  });

  // Fetch groups for dropdown
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/groups");
        setGroups(response.data.groups || []);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  // Initialize form data when student data changes
  useEffect(() => {
    if (studentData) {
      // Split the name into first and last name
      const nameParts = studentData.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        first_name: firstName,
        last_name: lastName,
        student_email: studentData.email,
        grade_level: studentData.course,
        stud_group: studentData.groupId || "",
        date_of_birth: studentData.dob
          ? new Date(studentData.dob).toISOString().split("T")[0]
          : "",
        enrollment_date: studentData.enrollmentDate
          ? new Date(studentData.enrollmentDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [studentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      // Make API call to update student
      await axios.put("http://localhost:3000/api/update_student", {
        stud_id: studentData.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        grade_level: formData.grade_level,
        stud_group: formData.stud_group,
        date_of_birth: formData.date_of_birth,
        enrollment_date: formData.enrollment_date,
        student_email: formData.student_email,
      });

      // Find group name if student has a group
      const groupInfo = formData.stud_group
        ? groups.find((g) => g.id === parseInt(formData.stud_group))
        : null;

      // Create updated student object
      const updatedStudent = {
        ...studentData,
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.student_email,
        course: formData.grade_level,
        year: formData.stud_group
          ? groupInfo
            ? groupInfo.name
            : `Group ${formData.stud_group}`
          : "Not Assigned",
        groupId: formData.stud_group ? parseInt(formData.stud_group) : null,
        dob: formData.date_of_birth,
        enrollmentDate: formData.enrollment_date,
      };

      // Call the callback to update parent component
      onStudentUpdated(updatedStudent);

      // Close the panel
      onClose();
    } catch (err) {
      console.error("Error updating student:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while updating student"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoChevronBackOutline className="text-xl" />
          </button>
          <h2 className="text-xl font-semibold">Edit Student</h2>
          <div className="w-5"></div> {/* Spacer for alignment */}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="student_email"
              value={formData.student_email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level
            </label>
            <input
              type="text"
              name="grade_level"
              value={formData.grade_level}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group
            </label>
            <select
              name="stud_group"
              value={formData.stud_group}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Not Assigned</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enrollment Date
            </label>
            <input
              type="date"
              name="enrollment_date"
              value={formData.enrollment_date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentEdit;
