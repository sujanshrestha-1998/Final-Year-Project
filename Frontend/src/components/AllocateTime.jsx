import React, { useEffect, useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiChevronUpDown } from "react-icons/hi2";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdWarning, MdCheckCircle } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { IoChevronBackOutline } from "react-icons/io5";
import ConfirmationModal from "./ConfirmationModal";
import ErrorModal from "./ErrorModal";

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
    day_of_week: "Monday",
    start_time: "",
    end_time: "",
  });
  const [classrooms, setClassrooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    scheduleId: null,
  });
  const [overlapModal, setOverlapModal] = useState({
    isOpen: false,
    message: "",
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
  });
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
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
    console.log("Opening side panel with schedule:", schedule);
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
            day_of_week: "Monday",
            start_time: "",
            end_time: "",
          }
    );
    setIsSidePanelOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  // Close side panel
  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
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

    // Check for mandatory fields
    const { classroom_id, course_id, teacher_id, start_time, end_time } =
      formData;
    if (
      !classroom_id ||
      !course_id ||
      !teacher_id ||
      !start_time ||
      !end_time
    ) {
      setErrorModal({
        isOpen: true,
        message: "Please fill in all mandatory fields.",
      });
      return;
    }

    // Check for overlapping schedules client-side
    if (isOverlappingSchedule()) {
      setOverlapModal({
        isOpen: true,
        message:
          "Cannot schedule: This classroom is already booked during this time period on the selected day.",
      });
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
        setOverlapModal({
          isOpen: true,
          message: data.message,
        });
        return;
      }

      // Show success modal
      setSuccessModal({
        isOpen: true,
        message: data.message,
      });

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
      setOverlapModal({
        isOpen: true,
        message: "Failed to update schedule.",
      });
    }
  };

  // Handle schedule deletion
  const handleDelete = async (scheduleId) => {
    setDeleteModal({
      isOpen: true,
      scheduleId,
    });
  };

  // Add new function for confirming deletion
  const confirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/delete_schedule",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedule_id: deleteModal.scheduleId }),
        }
      );
      const data = await response.json();
      alert(data.message);
      setSchedules(
        schedules.filter(
          (schedule) => schedule.schedule_id !== deleteModal.scheduleId
        )
      );
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Failed to delete schedule.");
    } finally {
      setDeleteModal({ isOpen: false, scheduleId: null });
    }
  };

  // Add this constant at the top of the component
  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  // First, let's group the schedules by day
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week]) {
      acc[schedule.day_of_week] = [];
    }
    acc[schedule.day_of_week].push(schedule);
    return acc;
  }, {});

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
            <tr className="bg-[#f5f5f7] divide-x divide-[#e5e5ea]">
              <th className="px-6 py-1 text-left">
                <span className="text-[15px] font-semibold  uppercase tracking-wider">
                  DAY
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[15px] font-semibold  uppercase tracking-wider">
                  CLASSROOM
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[15px] font-semibold  uppercase tracking-wider">
                  COURSE
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[15px] font-semibold  uppercase tracking-wider">
                  TEACHER
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[15px] font-semibold  uppercase tracking-wider">
                  TIME
                </span>
              </th>

              <th className="px-6 py-1 text-left">
                <span className="text-[15px] font-semibold  uppercase tracking-wider">
                  ACTIONS
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5ea]">
            {Object.entries(groupedSchedules)
              .sort(([dayA], [dayB]) => dayOrder[dayA] - dayOrder[dayB])
              .map(([day, daySchedules]) =>
                daySchedules.map((schedule, index) => (
                  <tr
                    key={`${day}-${schedule.schedule_id}`}
                    className={`divide-x divide-[#e5e5ea] ${
                      index !== 0 ? "border-t border-[#e5e5ea]" : ""
                    }`}
                  >
                    {index === 0 ? (
                      <td
                        className="px-6 py-2 text-[15px] font-medium border-r border-[#e5e5ea]"
                        rowSpan={daySchedules.length}
                      >
                        {day}
                      </td>
                    ) : (
                      // Add an empty hidden cell to maintain table structure
                      <td className="hidden"></td>
                    )}
                    <td className="px-6 py-2 text-[15px] font-medium">
                      {schedule.classroom_name}
                    </td>
                    <td className="px-6 py-2 text-[15px] font-medium">
                      {schedule.course_name}
                    </td>
                    <td className="px-6 py-2 text-[15px] font-medium">
                      {schedule.teacher_name}
                    </td>
                    <td className="px-6 py-2 text-[15px] font-medium">
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
                ))
              )}
          </tbody>
        </table>
      </div>

      {/* Apple UI-themed Side Panel with Blur Background */}
      {isSidePanelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with blur effect */}
          <div
            className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm transition-opacity"
            onClick={handleCloseSidePanel}
          ></div>

          {/* Side Panel */}
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Panel Header with Apple-style design */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-20 mb-2">
                <button
                  type="button"
                  onClick={handleCloseSidePanel}
                  className="text-blue-500 flex items-center gap-1 font-medium text-sm"
                >
                  <IoChevronBackOutline className="text-lg" />
                  Cancel
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formData.schedule_id ? "Edit Schedule" : "New Schedule"}
                </h2>
                {/* <button
                  type="submit"
                  form="schedule-form"
                  className="text-blue-500 font-medium text-sm"
                >
                  {formData.schedule_id ? "Update" : "Add"}
                </button> */}
              </div>
            </div>

            {/* Panel Body with Apple-style form elements */}
            <div className="h-full overflow-y-auto p-6 pb-20">
              <form id="schedule-form" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Group Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Group
                        </label>
                        <select
                          name="group_id"
                          value={formData.group_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-base bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-200 appearance-none"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                          }}
                        >
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Day
                        </label>
                        <select
                          name="day_of_week"
                          value={formData.day_of_week}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-base bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-200 appearance-none"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                          }}
                        >
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-base bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-base bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Classroom Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Location
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Classroom Type
                        </label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full px-3 py-2 text-base bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-200 appearance-none"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                          }}
                        >
                          <option value="">All Types</option>
                          {classroomTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Classroom
                        </label>
                        <select
                          name="classroom_id"
                          value={formData.classroom_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-base bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-200 appearance-none"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                          }}
                        >
                          <option value="">Select a classroom</option>
                          {filteredClassrooms.map((classroom) => (
                            <option key={classroom.id} value={classroom.id}>
                              {classroom.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Course and Teacher Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Class Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Course
                        </label>
                        <select
                          name="course_id"
                          value={formData.course_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-base bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-200 appearance-none"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                          }}
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
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Teacher
                        </label>
                        <select
                          name="teacher_id"
                          value={formData.teacher_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-base bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-200 appearance-none"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                          }}
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
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Bottom floating action bar with shadow */}
            <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm border-t border-gray-200 p-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseSidePanel}
                  className="px-6 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="schedule-form"
                  className="px-6 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium text-sm shadow-sm"
                >
                  {formData.schedule_id ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, scheduleId: null })}
        onConfirm={confirmDelete}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />

      {/* Overlap Warning Modal */}
      <ConfirmationModal
        isOpen={overlapModal.isOpen}
        onClose={() => setOverlapModal({ isOpen: false, message: "" })}
        onConfirm={() => setOverlapModal({ isOpen: false, message: "" })}
        title="Schedule Conflict"
        message={overlapModal.message}
        confirmText="OK"
        confirmButtonClass="bg-blue-600 hover:bg-blue-500"
        icon={<MdWarning className="h-6 w-6 text-yellow-600" />}
        iconBgClass="bg-yellow-100"
        hideCancel={true}
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: "" })}
        onConfirm={() => setSuccessModal({ isOpen: false, message: "" })}
        title="Success"
        message={successModal.message}
        confirmText="OK"
        confirmButtonClass="bg-green-600 hover:bg-green-500"
        icon={<MdCheckCircle className="h-6 w-6 text-green-600" />}
        iconBgClass="bg-green-100"
        hideCancel={true}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        message={errorModal.message}
      />
    </div>
  );
};

export default AllocateTime;
