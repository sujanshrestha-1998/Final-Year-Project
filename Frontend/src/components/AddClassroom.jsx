import React, { useState, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdAdd, MdDelete } from "react-icons/md";
import { PiProjectorScreenDuotone } from "react-icons/pi";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { BsPersonWorkspace } from "react-icons/bs";
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
  const [activeFilter, setActiveFilter] = useState("All");

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

  // Type icons mapping with React icons
  const typeIcons = {
    Lecture: <PiProjectorScreenDuotone className="text-xl" />,
    Tutorial: <LiaChalkboardTeacherSolid className="text-xl" />,
    Workshop: <BsPersonWorkspace className="text-xl" />,
  };

  // Type colors mapping - more subtle Apple-inspired colors
  const typeColors = {
    Lecture: "bg-blue-400 text-white",
    Tutorial: "bg-indigo-400 text-white",
    Workshop: "bg-orange-400 text-white",
  };

  // Type background colors for cards - lighter versions
  const typeBgColors = {
    Lecture: "bg-blue-50 text-blue-500",
    Tutorial: "bg-indigo-50 text-indigo-500",
    Workshop: "bg-orange-50 text-orange-500",
  };

  const handleTypeSelect = (type) => {
    setNewClassroom({ ...newClassroom, type });
  };

  // Filter function for classrooms list
  const getFilteredClassrooms = () => {
    if (activeFilter === "All") return classrooms;
    return classrooms.filter((classroom) => classroom.type === activeFilter);
  };

  return (
    <div className="p-6 h-full bg-gray-50 overflow-auto">
      {/* Header with title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="font-medium text-2xl text-gray-800">
            Classroom Management
          </h1>
          <IoMdInformationCircleOutline className="text-xl text-gray-400" />
        </div>

        {/* Summary cards with Apple-inspired design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(classroomCounts).map(([type, count]) => (
            <div
              key={type}
              className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-xl mr-4 ${typeBgColors[type]}`}>
                  {typeIcons[type]}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{type}s</h3>
                  <p className="text-sm text-gray-500">Total: {count}</p>
                </div>
              </div>
              <span className="text-2xl font-light text-gray-800">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Classroom Form - Apple-inspired design */}
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-medium mb-5 text-gray-800">
            Add New Classroom
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Classroom Name
              </label>
              <input
                type="text"
                value={newClassroom.name}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                placeholder="Enter classroom name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Classroom Type
              </label>
              <div className="flex space-x-3">
                {Object.keys(typeIcons).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                      newClassroom.type === type
                        ? `${typeColors[type]} border-transparent shadow-sm`
                        : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handleTypeSelect(type)}
                  >
                    {typeIcons[type]}
                    <span className="text-xs mt-2 font-medium">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-500 text-white py-2.5 px-4 rounded-xl hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <MdAdd className="text-lg" />
              {isSubmitting ? "Adding..." : "Add Classroom"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-medium text-blue-700 mb-2">
              Quick Info
            </h3>
            <ul className="text-xs text-blue-600 space-y-2">
              <li className="flex items-center gap-2">
                <PiProjectorScreenDuotone className="text-blue-500" /> Lecture:
                For large group sessions
              </li>
              <li className="flex items-center gap-2">
                <LiaChalkboardTeacherSolid className="text-indigo-500" />{" "}
                Tutorial: For smaller interactive groups
              </li>
              <li className="flex items-center gap-2">
                <BsPersonWorkspace className="text-orange-500" /> Workshop: For
                hands-on practical activities
              </li>
            </ul>
          </div>
        </div>

        {/* Classrooms List - Apple-inspired design */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-medium text-gray-800">
              Existing Classrooms
            </h2>
            <div className="text-sm text-gray-500">
              {getFilteredClassrooms().length} classrooms
            </div>
          </div>

          {/* Filter tabs - Apple-style pill buttons */}
          <div className="flex space-x-2 mb-5 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveFilter("All")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === "All"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {Object.entries(typeIcons).map(([type, icon]) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
                  activeFilter === type
                    ? type === "Lecture"
                      ? "bg-blue-500 text-white"
                      : type === "Tutorial"
                      ? "bg-indigo-500 text-white"
                      : "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {React.cloneElement(icon, { className: "text-sm" })}
                {type}s
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div
                className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-blue-400 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              ></div>
              <p className="mt-3 text-gray-500 text-sm">
                Loading classrooms...
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              {getFilteredClassrooms().length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No classrooms available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {activeFilter === "All"
                      ? "Add your first classroom using the form"
                      : `No ${activeFilter} classrooms found`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
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
                    <tbody className="bg-white divide-y divide-gray-100">
                      {getFilteredClassrooms().map((classroom) => (
                        <tr
                          key={classroom.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-800">
                              {classroom.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                typeColors[classroom.type] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {React.cloneElement(typeIcons[classroom.type], {
                                className: "text-sm mr-1",
                              })}
                              <span className="ml-1">{classroom.type}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => openDeleteModal(classroom)}
                              aria-label="Delete classroom"
                            >
                              <MdDelete className="text-lg" />
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
