import React, { useState, useEffect, useRef } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoGrid, IoList } from "react-icons/io5";
import { ChevronDown } from "lucide-react";
import { BsCalendar2EventFill } from "react-icons/bs";
import { MdBookmarkAdd } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import axios from "axios";

const Classroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [typeFilter, setTypeFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get current day of week
  const currentDayNumber = new Date().getDay();
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = daysOfWeek[currentDayNumber];

  // Function to fetch schedules for a specific group
  const fetchGroupSchedule = async (groupId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/fetch_schedule",
        { group_id: groupId }
      );
      return response.data.schedules || [];
    } catch (err) {
      console.error(`Error fetching schedule for group ${groupId}:`, err);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch classrooms
        const classroomsResponse = await axios.get(
          "http://localhost:3000/api/get_classrooms"
        );
        const classroomData = classroomsResponse.data.data || [];
        setClassrooms(classroomData);

        // For this example, let's assume we have group IDs 1-5
        const groupIds = [1, 2, 3, 4, 5];
        setGroups(groupIds.map((id) => ({ id, name: `Group ${id}` })));

        // Fetch schedules for all groups and combine them
        let allGroupSchedules = [];
        for (const groupId of groupIds) {
          const groupSchedules = await fetchGroupSchedule(groupId);
          const schedulesWithGroup = groupSchedules.map((schedule) => ({
            ...schedule,
            group_id: groupId,
          }));
          allGroupSchedules = [...allGroupSchedules, ...schedulesWithGroup];
        }

        setAllSchedules(allGroupSchedules);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load classroom data: ${err.message}`);
        setLoading(false);

        // Use dummy data if API calls fail
        setTimeout(() => {
          useDummyData();
        }, 2000);
      }
    };

    fetchAllData();
  }, []);

  const options = [
    { value: "all", label: "All Types" },
    { value: "Lecture", label: "Lecture" },
    { value: "Tutorial", label: "Tutorial" },
    { value: "Workshop", label: "Workshop" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (value) => {
    setTypeFilter(value);
    setIsOpen(false);
  };

  // Define continuous time slots for the day (7 AM to 5 PM)
  const timeSlots = [
    { id: 1, label: "07:00 - 08:00", start: "07:00", end: "08:00" },
    { id: 2, label: "08:00 - 09:00", start: "08:00", end: "09:00" },
    { id: 3, label: "09:00 - 10:00", start: "09:00", end: "10:00" },
    { id: 4, label: "10:00 - 11:00", start: "10:00", end: "11:00" },
    { id: 5, label: "11:00 - 12:00", start: "11:00", end: "12:00" },
    { id: 6, label: "12:00 - 13:00", start: "12:00", end: "13:00" },
    { id: 7, label: "13:00 - 14:00", start: "13:00", end: "14:00" },
    { id: 8, label: "14:00 - 15:00", start: "14:00", end: "15:00" },
    { id: 9, label: "15:00 - 16:00", start: "15:00", end: "16:00" },
    { id: 10, label: "16:00 - 17:00", start: "16:00", end: "17:00" },
  ];

  // Filter schedules based on active tab and current day
  const getFilteredSchedules = () => {
    // First filter by day
    let daySchedules = allSchedules.filter(
      (schedule) => schedule.day_of_week === currentDay
    );

    // Then filter by group if a specific group is selected
    if (activeTab !== "all") {
      daySchedules = daySchedules.filter(
        (schedule) => schedule.group_id.toString() === activeTab
      );
    }

    // Then filter by classroom type if a specific type is selected
    if (typeFilter !== "all") {
      // Get classrooms of the selected type
      const classroomsOfType = classrooms.filter(
        (classroom) => classroom.type === typeFilter
      );

      // Get the IDs of these classrooms
      const classroomIdsOfType = classroomsOfType.map(
        (classroom) => classroom.id
      );

      // Filter schedules to only include those in classrooms of the selected type
      daySchedules = daySchedules.filter((schedule) =>
        classroomIdsOfType.includes(parseInt(schedule.classroom_id))
      );
    }

    return daySchedules;
  };

  // Filter classrooms based on the type filter
  const getFilteredClassrooms = () => {
    if (typeFilter === "all") {
      return classrooms;
    } else {
      return classrooms.filter((classroom) => classroom.type === typeFilter);
    }
  };

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  // Function to check if a classroom is occupied at a certain time
  const getClassroomStatus = (classroomId, timeSlot) => {
    const filteredSchedules = getFilteredSchedules();

    const [startHour, startMinute] = timeSlot.start.split(":").map(Number);
    const [endHour, endMinute] = timeSlot.end.split(":").map(Number);

    // Convert to minutes for easier comparison
    const slotStartMinutes = startHour * 60 + startMinute;
    const slotEndMinutes = endHour * 60 + endMinute;

    // Check if classroom is occupied during this time slot
    const occupyingSchedule = filteredSchedules.find((schedule) => {
      // Check if it's for this classroom
      if (parseInt(schedule.classroom_id) !== parseInt(classroomId))
        return false;

      // Parse schedule times
      const [scheduleStartHour, scheduleStartMinute] = schedule.start_time
        .split(":")
        .map(Number);
      const [scheduleEndHour, scheduleEndMinute] = schedule.end_time
        .split(":")
        .map(Number);

      const scheduleStartMinutes = scheduleStartHour * 60 + scheduleStartMinute;
      const scheduleEndMinutes = scheduleEndHour * 60 + scheduleEndMinute;

      // Check for overlap
      return (
        slotStartMinutes < scheduleEndMinutes &&
        slotEndMinutes > scheduleStartMinutes
      );
    });

    return occupyingSchedule
      ? {
          occupied: true,
          course: occupyingSchedule.course_name,
          teacher: occupyingSchedule.teacher_name,
          group: occupyingSchedule.group_name,
          startTime: occupyingSchedule.start_time,
          endTime: occupyingSchedule.end_time,
        }
      : {
          occupied: false,
        };
  };

  // Get all classroom schedules for card view
  const getAllClassroomSchedules = () => {
    const filteredSchedules = getFilteredSchedules();
    // Use filtered classrooms based on type
    const filteredClassrooms = getFilteredClassrooms();

    // Group schedules by classroom
    const schedulesByClassroom = filteredClassrooms.map((classroom) => {
      const classroomSchedules = filteredSchedules.filter(
        (schedule) => parseInt(schedule.classroom_id) === classroom.id
      );
      return {
        ...classroom,
        schedules: classroomSchedules,
      };
    });
    return schedulesByClassroom;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    // Format the time to 12-hour format with AM/PM
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-US", options);
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600">Loading classroom data...</p>
        </div>
      </div>
    );

  return (
    <div className="h-screen w-[82vw] overflow-auto pl-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-gray-200">
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 py-1">
                <h1 className="font-semibold text-2xl text-black">
                  CLASSROOM DETAILS
                </h1>
                <IoMdInformationCircleOutline className="text-2xl" />
              </div>
              <div className="flex gap-2 items-center text-sm text-gray-800">
                <BsCalendar2EventFill className="text-blue-500" />
                {formattedDate}
              </div>
            </div>
            <div className="relative w-96">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-8 pr-4 py-1 bg-gray-200 rounded-md 
               text-[14px] border-none 
               transition-all duration-200 placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-3 py-2 flex gap-1 items-center bg-blue-500 text-white text-sm font-semibold rounded-md shadow-md transition-transform duration-200 hover:scale-105 hover:brightness-105">
              <MdBookmarkAdd />
              Reserve Classroom
            </button>
          </div>
        </div>

        {/* Controls - Group Tabs and View Toggle */}
        <div className="flex justify-between border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "all"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Groups
            </button>

            {groups.map((group) => (
              <button
                key={group.id}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === group.id.toString()
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab(group.id.toString())}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="ml-auto flex items-center" ref={dropdownRef}>
            <div className="relative">
              <button
                className="flex items-center justify-between px-4 py-2 w-40 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 transition-colors duration-150 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
              >
                {options.find((opt) => opt.value === typeFilter)?.label}
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 overflow-hidden z-10">
                  <div className="py-1">
                    {options.map((option) => (
                      <button
                        key={option.value}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          typeFilter === option.value
                            ? "bg-blue-500 text-white font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelect(option.value)}
                        role="option"
                        aria-selected={typeFilter === option.value}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center mr-4 gap-2">
            <h1 className="font-medium text-gray-500 text-sm">View:</h1>
            <div>
              {" "}
              <button
                className={`p-2 rounded-full ${
                  viewMode === "table"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setViewMode("table")}
              >
                <IoList className="text-lg" />
              </button>
              <button
                className={`p-2 rounded-full ${
                  viewMode === "card"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setViewMode("card")}
              >
                <IoGrid className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-5 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              {activeTab === "all" ? "All Groups" : `Group ${activeTab}`}
              {typeFilter !== "all" ? ` - ${typeFilter} Rooms` : ""}
              {" - Today's Schedule"}
            </h2>

            <div className="flex items-center text-sm text-gray-500">
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span>
              <span className="mr-3">Available</span>
              <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-1"></span>
              <span>Occupied</span>
            </div>
          </div>

          {/* Table View - Apple UI Design Theme */}
          {viewMode === "table" && (
            <div className="bg-white">
              <div className="overflow-x-auto scrollbar-hidden">
                <table className="w-full table-fixed divide-y divide-gray-100">
                  <thead>
                    <tr>
                      <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-32 sticky left-0 bg-white z-10">
                        Classroom
                      </th>
                      {timeSlots.map((slot) => (
                        <th
                          key={slot.id}
                          className="py-3 px-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wide w-32"
                        >
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-500">
                    {/* Use filtered classrooms instead of all classrooms */}
                    {getFilteredClassrooms().map((classroom) => (
                      <tr key={classroom.id}>
                        <td className="py-3 px-2 h-20 sticky left-0 bg-white z-10">
                          <div className="font-medium text-gray-800">
                            {classroom.name}
                          </div>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                classroom.type === "Lecture"
                                  ? "bg-blue-500"
                                  : classroom.type === "Tutorial"
                                  ? "bg-purple-500"
                                  : classroom.type === "Workshop"
                                  ? "bg-orange-500"
                                  : "bg-gray-500"
                              }`}
                            ></span>
                            {classroom.type}
                          </div>
                        </td>
                        {timeSlots.map((slot) => {
                          const status = getClassroomStatus(classroom.id, slot);
                          return (
                            <td
                              key={`${classroom.id}-${slot.id}`}
                              className={`p-2 h-20 w-32 ${
                                status.occupied ? "bg-red-200" : "bg-green-50"
                              }`}
                            >
                              <div className="h-full flex flex-col justify-center rounded-lg p-2">
                                {status.occupied ? (
                                  <div className="text-sm">
                                    <div className="text-blue-500 font-semibold mt-1">
                                      {status.group}
                                    </div>
                                    <div className="text-black mt-1">
                                      {formatTime(status.startTime)} -{" "}
                                      {formatTime(status.endTime)}
                                    </div>
                                    <div className="text-gray-600 truncate mt-1">
                                      {status.teacher}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-green-500 font-medium text-center"></div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Card View - Apple UI Theme */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
              {getAllClassroomSchedules().map((classroom) => (
                <div
                  key={classroom.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 w-full h-64 overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      {classroom.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {classroom.type}
                    </p>
                  </div>
                  <div className="p-5 h-48 overflow-y-auto">
                    {classroom.schedules.length > 0 ? (
                      <div className="space-y-3">
                        {classroom.schedules.map((schedule, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-blue-50 border-0 transition-all duration-200 hover:bg-blue-100"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-gray-800 truncate max-w-xs">
                                {schedule.course_name}
                              </span>
                              <span className="text-xs px-2.5 py-1 bg-white rounded-full text-blue-600 whitespace-nowrap ml-1 shadow-sm">
                                {schedule.group_name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1.5 truncate">
                              {schedule.teacher_name}
                            </div>
                            <div className="text-sm font-medium text-gray-700 flex items-center">
                              <svg
                                className="w-3.5 h-3.5 mr-1.5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatTime(schedule.start_time)} -{" "}
                              {formatTime(schedule.end_time)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center">
                        <svg
                          className="w-10 h-10 text-gray-300 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm text-gray-500 font-medium">
                          No classes scheduled
                        </p>
                        <p className="text-xs text-green-600 mt-1.5 bg-green-50 px-3 py-1 rounded-full">
                          Available all day
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Classroom;
