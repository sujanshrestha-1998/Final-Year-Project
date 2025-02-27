import React, { useEffect, useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiChevronUpDown } from "react-icons/hi2";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { IoChevronBackOutline } from "react-icons/io5";

const AllocateTime = () => {
  const [schedules, setSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("1");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
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
  const [classrooms, setClassrooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedType, setSelectedType] = useState("");

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

  // Fetch classrooms on component mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/get_classrooms"
        );
        const data = await response.json();
        setClassrooms(data.data);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };
    fetchClassrooms();
  }, []);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/get_courses");
        const data = await response.json();
        setCourses(data.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/teacher_details"
        );
        const data = await response.json();
        setTeachers(data.teachers);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  // Get unique types from classrooms
  const classroomTypes = [
    ...new Set(classrooms.map((classroom) => classroom.type)),
  ];

  // Filter classrooms based on selected type
  const filteredClassrooms = selectedType
    ? classrooms.filter((classroom) => classroom.type === selectedType)
    : classrooms;

  // Open side panel for adding/editing a schedule
  const handleOpenSidePanel = (schedule = null) => {
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
    setIsSidePanelOpen(true);
    // Add no-scroll class to body when panel is open
    document.body.classList.add("overflow-hidden");
  };

  // Close side panel
  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    // Remove no-scroll class from body when panel is closed
    document.body.classList.remove("overflow-hidden");
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to check for overlapping schedules
  const isOverlappingSchedule = () => {
    // If start or end time is empty, we can't check for overlaps
    if (!formData.start_time || !formData.end_time) return false;

    return schedules.some((schedule) => {
      // If editing the same schedule, don't count it as an overlap
      if (
        formData.schedule_id &&
        schedule.schedule_id === formData.schedule_id
      ) {
        return false;
      }

      // Check if day and classroom match
      if (
        schedule.day_of_week === formData.day_of_week &&
        schedule.classroom_id === formData.classroom_id
      ) {
        const existingStart = new Date(`1970-01-01T${schedule.start_time}`);
        const existingEnd = new Date(`1970-01-01T${schedule.end_time}`);
        const newStart = new Date(`1970-01-01T${formData.start_time}`);
        const newEnd = new Date(`1970-01-01T${formData.end_time}`);

        // Check for any overlap in time periods
        return (
          (newStart < existingEnd && newEnd > existingStart) || // General overlap
          newStart.getTime() === existingStart.getTime() || // Same start time
          newEnd.getTime() === existingEnd.getTime() || // Same end time
          (newStart < existingStart && newEnd > existingEnd) // New schedule completely contains existing one
        );
      }

      return false;
    });
  };

  // Handle form submission (add/edit schedule)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for overlapping schedules client-side
    if (isOverlappingSchedule()) {
      alert(
        "Cannot schedule: This classroom is already booked during this time period on the selected day."
      );
      return;
    }

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

      // Check if the response indicates an error (specifically for overlap)
      if (response.status === 409) {
        alert(data.message);
        return;
      }

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
      handleCloseSidePanel();
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
    <div className="h-screen w-[78vw] overflow-hidden flex flex-col mx-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 py-5">
          <h1 className="font-semibold text-2xl text-gray-800">
            TIME ALLOCATION
          </h1>
          <IoMdInformationCircleOutline className="text-2xl text-gray-600" />
        </div>
        <div className="flex items-center gap-4">
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
            onClick={() => handleOpenSidePanel()}
          >
            + Add Schedule
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-t w-full mt-5 flex justify-center">
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
                      onClick={() => handleOpenSidePanel(schedule)}
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

      {/* Side Panel with Blur Background */}
      {isSidePanelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with blur effect */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
            onClick={handleCloseSidePanel}
          ></div>

          {/* Side Panel */}
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <button
              type="button"
              onClick={handleCloseSidePanel}
              className="text-blue-500 flex items-center p-5 gap-2 font-semibold"
            >
              <IoChevronBackOutline />
              Back
            </button>
            {/* Panel Header */}
            <div className="px-6 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {formData.schedule_id ? "Edit Schedule" : "Add New Schedule"}
              </h2>
              <button
                onClick={handleCloseSidePanel}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="h-full overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Week
                    </label>
                    <select
                      name="day_of_week"
                      value={formData.day_of_week}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select a type</option>
                      {classroomTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classroom
                    </label>
                    <select
                      name="classroom_id"
                      value={formData.classroom_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select a classroom</option>
                      {filteredClassrooms.map((classroom) => (
                        <option key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      name="course_id"
                      value={formData.course_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher
                    </label>
                    <select
                      name="teacher_id"
                      value={formData.teacher_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option
                          key={teacher.teacher_id}
                          value={teacher.teacher_id}
                        >
                          {teacher.first_name} {teacher.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel Footer */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseSidePanel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
                  >
                    {formData.schedule_id ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocateTime;
