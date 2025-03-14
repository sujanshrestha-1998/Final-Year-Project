import React, { useState, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {
  MdAdd,
  MdDelete,
  MdDesktopMac,
  MdPeople,
  MdBuild,
} from "react-icons/md";
import { toast } from "react-toastify";
import DeleteModal from "./DeleteModal";

const AddClassroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    type: "Lecture",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    classroom: null,
  });
  const [classroomCounts, setClassroomCounts] = useState({
    Lecture: 0,
    Tutorial: 0,
    Workshop: 0,
  });

  // Fetch classrooms
  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Calculate counts for each classroom type
  useEffect(() => {
    const counts = {
      Lecture: 0,
      Tutorial: 0,
      Workshop: 0,
    };

    classrooms.forEach((classroom) => {
      if (counts[classroom.type] !== undefined) {
        counts[classroom.type]++;
      }
    });

    setClassroomCounts(counts);
  }, [classrooms]);

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
    if (!newClassroom.name.trim()) {
      toast.error("Please enter a classroom name");
      return;
    }

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
        setNewClassroom({ ...newClassroom, name: "" }); // Reset name only
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

  // Type icons mapping
  const typeIcons = {
    Lecture: <img src="/src/assets/Lecture.png" alt="" width={30} />,
    Tutorial: <img src="/src/assets/Tutorial.png" alt="" width={30} />,
    Workshop: <img src="/src/assets/Workshop.png" alt="" width={30} />,
  };

  // Type colors mapping
  const typeColors = {
    Lecture: "bg-blue-500 text-white",
    Tutorial: "bg-purple-500 text-white",
    Workshop: "bg-orange-500 text-white",
  };

  const handleTypeSelect = (type) => {
    setNewClassroom({ ...newClassroom, type });
  };

  // Filter function for classrooms list
  const getFilteredClassrooms = (type = null) => {
    if (!type) return classrooms;
    return classrooms.filter((classroom) => classroom.type === type);
  };

  return (
    <div className="p-6 h-full bg-gray-100 overflow-auto">
      {/* Header with summary cards */}
      <div className="mb-6">
        <div className="flex items-center gap-2 p-5">
          <h1 className="font-medium text-2xl">CLASSROOM MANAGEMENT</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(classroomCounts).map(([type, count]) => (
            <div
              key={type}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className={`p-3 rounded-full mr-3 border-2 border-gray-200`}
                >
                  {typeIcons[type]}
                </div>
                <div>
                  <h3 className="font-medium">{type}s</h3>
                  <p className="text-sm text-gray-500">Total: {count}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-800">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Classroom Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
            Add New Classroom
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classroom Name
              </label>
              <input
                type="text"
                value={newClassroom.name}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter classroom name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classroom Type
              </label>
              <div className="flex space-x-3">
                {Object.keys(typeIcons).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      newClassroom.type === type
                        ? `${typeColors[type]} border-transparent`
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handleTypeSelect(type)}
                  >
                    {typeIcons[type]}
                    <span className="text-xs mt-2 font-medium">
                      {type.replace(" Room", "")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <MdAdd className="text-xl" />
              {isSubmitting ? "Adding..." : "Add Classroom"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Quick Info
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Lecture: For large group sessions</li>
              <li>• Tutorial Rooms: For smaller interactive groups</li>
              <li>• Workshops: For hands-on practical activities</li>
            </ul>
          </div>
        </div>

        {/* Classrooms List */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-gray-800">
              Existing Classrooms
            </h2>
            <div className="text-sm text-gray-500">
              Total: {classrooms.length} classrooms
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              ></div>
              <p className="mt-2 text-gray-500">Loading classrooms...</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {classrooms.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No classrooms available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add your first classroom using the form
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Classroom
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classrooms.map((classroom) => (
                        <tr key={classroom.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {classroom.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                typeColors[classroom.type] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {typeIcons[classroom.type]}
                              <span className="ml-1">
                                {classroom.type.replace(" Room", "")}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                              onClick={() => openDeleteModal(classroom)}
                            >
                              <MdDelete className="text-xl" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!isLoading && classrooms.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              {Object.entries(classroomCounts).map(([type, count]) => (
                <div key={type} className="bg-gray-50 py-2 px-3 rounded-lg">
                  <span className="font-medium">{type}s:</span> {count}
                </div>
              ))}
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
