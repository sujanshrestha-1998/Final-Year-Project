import React, { useState, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import DeleteModal from "./DeleteModal";

const AddClassroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    type: "Lecture Room",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    classroom: null,
  });

  // Fetch classrooms
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/get_classrooms");
      const data = await response.json();
      if (response.ok) {
        setClassrooms(data.data);
      } else {
        toast.error("Failed to fetch classrooms");
      }
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      toast.error("Error loading classrooms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/api/add_classroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClassroom),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Classroom added successfully");
        setNewClassroom({ name: "", type: "Lecture Room" }); // Reset form
        fetchClassrooms(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to add classroom");
      }
    } catch (error) {
      console.error("Error adding classroom:", error);
      toast.error("Error adding classroom");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (classroom) => {
    setDeleteModal({
      isOpen: true,
      classroom,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      classroom: null,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.classroom) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/delete_classroom/${deleteModal.classroom.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Classroom deleted successfully");
        fetchClassrooms(); // Refresh the list
      } else {
        toast.error("Failed to delete classroom");
      }
    } catch (error) {
      console.error("Error deleting classroom:", error);
      toast.error("Error deleting classroom");
    } finally {
      closeDeleteModal();
    }
  };

  const classroomTypes = [
    "Lecture Room",
    "Tutorial Room",
    "Workshop",
    "Laboratory",
    "Computer Lab",
  ];

  return (
    <div className="p-8 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-medium">CLASSROOM MANAGEMENT</h1>
        <IoMdInformationCircleOutline className="text-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Classroom Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4">Add New Classroom</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom Name
              </label>
              <input
                type="text"
                value={newClassroom.name}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter classroom name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom Type
              </label>
              <select
                value={newClassroom.type}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                {classroomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <MdAdd className="text-xl" />
              {isSubmitting ? "Adding..." : "Add Classroom"}
            </button>
          </form>
        </div>

        {/* Classrooms List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4">Existing Classrooms</h2>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classrooms.map((classroom) => (
                    <tr key={classroom.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {classroom.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {classroom.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => openDeleteModal(classroom)}
                          >
                            <MdDelete className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {classrooms.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No classrooms found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.classroom?.name}
      />
    </div>
  );
};

export default AddClassroom;
