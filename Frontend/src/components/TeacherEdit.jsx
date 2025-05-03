import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import axios from "axios";

const TeacherEdit = ({ isOpen, onClose, teacherData, onTeacherUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    course: "",
    assigned_academics: "",
    date_of_birth: "",
  });

  // Initialize form data when teacher data changes
  useEffect(() => {
    if (teacherData) {
      // Convert assigned academics back to number
      let assignedAcademicsValue = "";
      if (teacherData.assignedAcademics) {
        const academicsMap = {
          "Academics A": "1",
          "Academics B": "2",
          "Academics C": "3",
          "Academics D": "4",
          "Academics E": "5",
        };

        // Extract the number if it's in the format "Academics X"
        if (teacherData.assignedAcademics.startsWith("Academics ")) {
          assignedAcademicsValue =
            academicsMap[teacherData.assignedAcademics] ||
            teacherData.assignedAcademics.replace("Academics ", "");
        }
      }

      // Split the name into first and last name
      const nameParts = teacherData.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        first_name: firstName,
        last_name: lastName,
        email: teacherData.email,
        course: teacherData.course,
        assigned_academics: assignedAcademicsValue,
        date_of_birth: teacherData.dob
          ? new Date(teacherData.dob).toISOString().split("T")[0]
          : "",
      });
    }
  }, [teacherData]);

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

      // Make API call to update teacher
      await axios.put(
        `http://localhost:3000/api/teacher_details/${teacherData.id}`,
        formData
      );

      // Convert assigned academics back to display format
      let academicsName = "Not Assigned";
      if (formData.assigned_academics) {
        const academicsMap = {
          1: "Academics A",
          2: "Academics B",
          3: "Academics C",
          4: "Academics D",
          5: "Academics E",
        };
        academicsName =
          academicsMap[formData.assigned_academics] ||
          `Academics ${formData.assigned_academics}`;
      }

      // Create updated teacher object
      const updatedTeacher = {
        ...teacherData,
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        course: formData.course,
        assignedAcademics: academicsName,
        dob: formData.date_of_birth,
      };

      // Call the callback to update parent component
      onTeacherUpdated(updatedTeacher);

      // Close the panel
      onClose();
    } catch (err) {
      console.error("Error updating teacher:", err);
      setError(
        err.response?.data?.message || "An error occurred while updating teacher"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <IoChevronBackOutline className="text-xl" />
            </button>
            <h2 className="text-xl font-semibold">Edit Teacher</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Academic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Academics
                </label>
                <select
                  name="assigned_academics"
                  value={formData.assigned_academics}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Not Assigned</option>
                  <option value="1">Academics A</option>
                  <option value="2">Academics B</option>
                  <option value="3">Academics C</option>
                  <option value="4">Academics D</option>
                  <option value="5">Academics E</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer with buttons */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherEdit;
