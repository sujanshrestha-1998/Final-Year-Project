import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const RTEEdit = ({ isOpen, onClose, rteData, onRTEUpdated }) => {
  const [formData, setFormData] = useState({
    rte_id: "",
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: null,
    hire_date: null,
    status: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Initialize form data when rteData changes
  useEffect(() => {
    if (rteData) {
      setFormData({
        rte_id: rteData.id,
        first_name: rteData.firstName,
        last_name: rteData.lastName,
        email: rteData.email,
        date_of_birth: rteData.dob ? new Date(rteData.dob) : null,
        hire_date: rteData.hireDate ? new Date(rteData.hireDate) : null,
        status: rteData.status || "active",
      });
    }
  }, [rteData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Format dates for API
      const apiData = {
        ...formData,
        date_of_birth: formData.date_of_birth
          ? formData.date_of_birth.toISOString().split("T")[0]
          : null,
        hire_date: formData.hire_date
          ? formData.hire_date.toISOString().split("T")[0]
          : null,
      };

      // Call API to update RTE
      const response = await axios.put(
        `http://localhost:3000/api/update_rte`,
        apiData
      );

      // Format the updated RTE data for the parent component
      const updatedRTE = {
        id: formData.rte_id,
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        dob: formData.date_of_birth,
        age: calculateAge(formData.date_of_birth),
        hireDate: formData.hire_date,
        status: formData.status,
      };

      // Notify parent component of the update
      onRTEUpdated(updatedRTE);
      onClose();
    } catch (err) {
      console.error("Error updating RTE:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while updating RTE officer"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Edit RTE Officer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Date of Birth</label>
              <DatePicker
                selected={formData.date_of_birth}
                onChange={(date) => handleDateChange(date, "date_of_birth")}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Hire Date</label>
              <DatePicker
                selected={formData.hire_date}
                onChange={(date) => handleDateChange(date, "hire_date")}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update RTE Officer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RTEEdit;
