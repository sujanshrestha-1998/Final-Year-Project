import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RTEDetails = () => {
  const [rteOfficers, setRTEOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRTE, setSelectedRTE] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: null,
    hire_date: null,
    status: "active",
  });

  // Fetch RTE officers data
  const fetchRTEOfficers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/rte_get_all");
      const data = await response.json();

      if (response.ok) {
        setRTEOfficers(data);
      } else {
        toast.error("Failed to fetch RTE officers");
      }
    } catch (error) {
      console.error("Error fetching RTE officers:", error);
      toast.error("Error fetching RTE officers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRTEOfficers();
  }, []);

  // Handle edit button click
  const handleEditClick = (rte) => {
    setSelectedRTE(rte);
    setFormData({
      first_name: rte.first_name,
      last_name: rte.last_name,
      email: rte.email,
      date_of_birth: rte.date_of_birth ? new Date(rte.date_of_birth) : null,
      hire_date: rte.hire_date ? new Date(rte.hire_date) : null,
      status: rte.status || "active",
    });
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (rte) => {
    setSelectedRTE(rte);
    setShowDeleteModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date,
    });
  };

  // Handle form submission for editing
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedData = {
        ...formData,
        date_of_birth: formData.date_of_birth
          ? formData.date_of_birth.toISOString().split("T")[0]
          : null,
        hire_date: formData.hire_date
          ? formData.hire_date.toISOString().split("T")[0]
          : null,
      };

      const response = await fetch(
        `http://localhost:3000/api/rte_update/${selectedRTE.rte_officer_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        toast.success("RTE officer updated successfully");
        setShowEditModal(false);
        fetchRTEOfficers(); // Refresh the data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update RTE officer");
      }
    } catch (error) {
      console.error("Error updating RTE officer:", error);
      toast.error("Error updating RTE officer");
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/rte_delete/${selectedRTE.rte_officer_id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("RTE officer deleted successfully");
        setShowDeleteModal(false);
        fetchRTEOfficers(); // Refresh the data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete RTE officer");
      }
    } catch (error) {
      console.error("Error deleting RTE officer:", error);
      toast.error("Error deleting RTE officer");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl font-bold mb-6">RTE Officers Management</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Date of Birth</th>
                <th className="py-3 px-4 text-left">Hire Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rteOfficers.length > 0 ? (
                rteOfficers.map((rte) => (
                  <tr
                    key={rte.rte_officer_id}
                    className="border-t border-gray-300 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{rte.rte_officer_id}</td>
                    <td className="py-3 px-4">{`${rte.first_name} ${rte.last_name}`}</td>
                    <td className="py-3 px-4">{rte.email}</td>
                    <td className="py-3 px-4">{rte.date_of_birth || "N/A"}</td>
                    <td className="py-3 px-4">{rte.hire_date || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          rte.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rte.status || "active"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(rte)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rte)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No RTE officers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit RTE Officer</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Date of Birth
                </label>
                <DatePicker
                  selected={formData.date_of_birth}
                  onChange={(date) => handleDateChange(date, "date_of_birth")}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Hire Date</label>
                <DatePicker
                  selected={formData.hire_date}
                  onChange={(date) => handleDateChange(date, "hire_date")}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete {selectedRTE.first_name}{" "}
              {selectedRTE.last_name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RTEDetails;
