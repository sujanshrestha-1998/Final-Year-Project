import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
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
      setError("Failed to update teacher data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[500px] bg-gradient-to-b from-gray-50 to-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-8 h-full flex flex-col">
        <div className="flex items-center gap-20 mb-10">
          <button
            onClick={onClose}
            className="flex items-center justify-center text-blue-500 gap-1"
          >
            <IoChevronBackOutline />
            Close
          </button>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-medium text-gray-800">Edit Teacher</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Processing...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Assigned Academics
                </label>
                <select
                  name="assigned_academics"
                  value={formData.assigned_academics}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 appearance-none"
                  style={{
                    backgroundImage:
                      'url(\'data:image/svg+xml;charset=US-ASCII,<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M5 8l5 5 5-5z" fill="%23555"/></svg>\')',
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                  }}
                >
                  <option value="">Not Assigned</option>
                  <option value="1">Academics A</option>
                  <option value="2">Academics B</option>
                  <option value="3">Academics C</option>
                  <option value="4">Academics D</option>
                  <option value="5">Academics E</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeacherEdit;
