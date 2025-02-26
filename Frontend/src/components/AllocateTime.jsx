import React, { useEffect, useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiChevronUpDown } from "react-icons/hi2";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const AllocateTime = () => {
  const [schedules, setSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    schedule_id: null,
    group_id: selectedGroupId,
    classroom_id: "",
    course_id: "",
    teacher_id: "",
    day_of_week: "Sunday",
    start_time: "",
    end_time: "",
  });

  // Format time from "12:00:00" to "12:00 AM"
  const formatTime = (timeString) => {
    if (!timeString) return "";

    // Parse the time string
    const [hours, minutes] = timeString.split(":");
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hour = hour % 12;
    hour = hour ? hour : 12; // If hour is 0, make it 12

    return `${hour}:${minutes} ${ampm}`;
  };

  // Fetch groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/groups");
        const data = await response.json();
        setGroups(data.groups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  // Fetch schedules when selectedGroupId changes
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/fetch_schedule",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group_id: selectedGroupId }),
          }
        );
        const data = await response.json();
        if (Array.isArray(data.schedules)) setSchedules(data.schedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
    fetchSchedules();
  }, [selectedGroupId]);

  // Open modal for adding/editing a schedule
  const handleOpenModal = (schedule = null) => {
    setFormData(
      schedule
        ? {
            schedule_id: schedule.schedule_id,
            group_id: schedule.group_id || selectedGroupId,
            classroom_id: schedule.classroom_id || "",
            course_id: schedule.course_id || "",
            teacher_id: schedule.teacher_id || "",
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          }
        : {
            schedule_id: null,
            group_id: selectedGroupId,
            classroom_id: "",
            course_id: "",
            teacher_id: "",
            day_of_week: "Sunday",
            start_time: "",
            end_time: "",
          }
    );
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => setIsModalOpen(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission (add/edit schedule)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3000/api/update_schedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      alert(data.message);
      // Refresh schedules after update
      const updatedResponse = await fetch(
        "http://localhost:3000/api/fetch_schedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group_id: selectedGroupId }),
        }
      );
      const updatedData = await updatedResponse.json();
      setSchedules(updatedData.schedules);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Failed to update schedule.");
    }
  };

  // Handle schedule deletion
  const handleDelete = async (scheduleId) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        const response = await fetch(
          "http://localhost:3000/api/delete_schedule",
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schedule_id: scheduleId }),
          }
        );
        const data = await response.json();
        alert(data.message);
        // Refresh schedules after deletion
        setSchedules(
          schedules.filter((schedule) => schedule.schedule_id !== scheduleId)
        );
      } catch (error) {
        console.error("Error deleting schedule:", error);
        alert("Failed to delete schedule.");
      }
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col mx-8">
      <div className="flex items-center gap-2 py-5">
        <h1 className="font-semibold text-2xl text-gray-800">
          TIME ALLOCATION
        </h1>
        <IoMdInformationCircleOutline className="text-2xl text-gray-600" />
      </div>
      <div className="mb-4 flex items-center space-x-2">
        <label className="font-medium whitespace-nowrap">Select Group:</label>
        <div className="relative w-32">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-2 py-1 text-[14px] bg-gray-200
              border-none rounded-lg appearance-none
              pr-8 focus:ring-2 focus:ring-[#0066FF] focus:bg-white
              transition-all duration-200"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none">
            <HiChevronUpDown className="bg-blue-500 rounded-md text-white h-5" />
          </div>
        </div>
        <button
          className="bg-blue-500 text-white px-2 py-0.5 rounded-md"
          onClick={() => handleOpenModal()}
        >
          + Add Schedule
        </button>
      </div>
      <div className="overflow-x-auto w-full flex justify-center">
        <table className="min-w-full divide-y divide-[#e5e5ea]">
          <thead>
            <tr className="bg-[#f5f5f7]">
              <th className="px-6 py-1 text-left">
                <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                  DAY
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                  CLASSROOM
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                  COURSE
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                  TEACHER
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                  TIME
                </span>
              </th>

              <th className="px-6 py-1 text-left">
                <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                  ACTIONS
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5ea]">
            {schedules.map((schedule) => (
              <tr
                key={schedule.schedule_id}
                className="hover:bg-[#f5f5f7] transition-colors duration-150"
              >
                <td className="px-6 py-2 text-[14px] text-gray-900">
                  {schedule.day_of_week}
                </td>
                <td className="px-6 py-2 text-[14px] text-gray-900">
                  {schedule.classroom_name}
                </td>
                <td className="px-6 py-2 text-[14px] text-gray-900">
                  {schedule.course_name}
                </td>
                <td className="px-6 py-2 text-[14px] text-gray-900">
                  {schedule.teacher_name}
                </td>
                <td className="px-6 py-2 text-[14px] text-gray-900">
                  {formatTime(schedule.start_time)} -{" "}
                  {formatTime(schedule.end_time)}
                </td>

                <td className="px-6 py-2">
                  <div className="flex gap-2">
                    <button
                      className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => handleOpenModal(schedule)}
                      aria-label="Edit"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors duration-200"
                      onClick={() => handleDelete(schedule.schedule_id)}
                      aria-label="Delete"
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for Adding/Editing Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {formData.schedule_id ? "Edit Schedule" : "Add Schedule"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Day of Week
                  </label>
                  <select
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Classroom
                  </label>
                  <input
                    type="text"
                    name="classroom_id"
                    value={formData.classroom_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course
                  </label>
                  <input
                    type="text"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teacher
                  </label>
                  <input
                    type="text"
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocateTime;
