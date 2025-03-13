import React, { useState, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdBookmarkAdd } from "react-icons/md";
import { IoGrid, IoList, IoCalendarOutline, IoSearch } from "react-icons/io5";
import axios from "axios";

const Classroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"

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
  // const currentDay = daysOfWeek[currentDayNumber];
  const currentDay = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(new Date());
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

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

        // Fetch groups
        const groupsResponse = await axios.get(
          "http://localhost:3000/api/get_groups"
        );
        const groupData = groupsResponse.data.data || [];
        setGroups(groupData);

        // Fetch schedules for all groups and combine them
        let allGroupSchedules = [];
        for (const group of groupData) {
          const groupSchedules = await fetchGroupSchedule(group.id);
          const schedulesWithGroup = groupSchedules.map((schedule) => ({
            ...schedule,
            group_id: group.id,
          }));
          allGroupSchedules = [...allGroupSchedules, ...schedulesWithGroup];
        }

        setAllSchedules(allGroupSchedules);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load classroom data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Define continuous time slots for the day (7 AM to 5 PM)
  const timeSlots = [
    { id: 1, label: "7:00 - 9:00", start: "07:00", end: "09:00" },
    { id: 2, label: "9:00 - 11:00", start: "09:00", end: "11:00" },
    { id: 3, label: "11:00 - 13:00", start: "11:00", end: "13:00" },
    { id: 4, label: "13:00 - 15:00", start: "13:00", end: "15:00" },
    { id: 5, label: "15:00 - 17:00", start: "15:00", end: "17:00" },
  ];

  // Filter schedules based on active tab and current day
  const getFilteredSchedules = () => {
    // First filter by day
    const daySchedules = allSchedules.filter(
      (schedule) => schedule.day_of_week === currentDay
    );

    // Then filter by group if a specific group is selected
    if (activeTab !== "all") {
      return daySchedules.filter(
        (schedule) => schedule.group_id.toString() === activeTab
      );
    }

    return daySchedules;
  };

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
    // Group schedules by classroom
    const schedulesByClassroom = classrooms.map((classroom) => {
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
    <div className="h-screen w-[82vw] ml-4 overflow-auto ">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <h1 className="font-medium text-2xl text-black">
                CLASSROOM DETAILS
              </h1>
              <IoMdInformationCircleOutline className="text-2xl" />
            </div>
            <div className="relative w-80">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">
                  {currentDay}, {formattedDate}
                </span>
              </div>
            </div>
            <button className="px-4 py-1 bg-blue-500 flex items-center gap-1 text-white text-sm rounded-md hover:bg-blue-600 transition-colors">
              <MdBookmarkAdd className="text-md" />
              Book a Classroom
            </button>
          </div>
        </div>

        {/* Controls - Group Tabs and View Toggle */}
        <div className="flex justify-between border-b border-gray-200 bg-white">
          <div className="flex overflow-x-auto">
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "all"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Groups
            </button>

            {groups.map((group) => (
              <button
                key={group.id}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === group.id.toString()
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab(group.id.toString())}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center mr-4">
            <button
              className={`p-2 rounded-l-md ${
                viewMode === "table"
                  ? "bg-gray-200 text-gray-800"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setViewMode("table")}
            >
              <IoList className="text-lg" />
            </button>
            <button
              className={`p-2 rounded-r-md ${
                viewMode === "card"
                  ? "bg-gray-200 text-gray-800"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setViewMode("card")}
            >
              <IoGrid className="text-lg" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-5 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              {activeTab === "all" ? "All Groups" : `Group ${activeTab}`} -
              Today's Schedule
            </h2>

            <div className="flex items-center text-sm text-gray-500">
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span>
              <span className="mr-3">Available</span>
              <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-1"></span>
              <span>Occupied</span>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <colgroup>
                    <col className="w-32" /> {/* Classroom column width */}
                    {timeSlots.map((slot) => (
                      <col
                        key={slot.id}
                        className="w-32"
                      /> /* All time slots same width */
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Classroom
                      </th>
                      {timeSlots.map((slot) => (
                        <th
                          key={slot.id}
                          className="py-3 px-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                        >
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classrooms.map((classroom) => (
                      <tr key={classroom.id}>
                        <td className="py-3 px-3 border-r border-gray-200 h-20">
                          <div className="font-medium text-gray-800">
                            {classroom.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {classroom.type}
                          </div>
                        </td>
                        {timeSlots.map((slot) => {
                          const status = getClassroomStatus(classroom.id, slot);
                          return (
                            <td
                              key={`${classroom.id}-${slot.id}`}
                              className={`py-2 px-2 border-r border-gray-200 h-20 ${
                                status.occupied ? "bg-red-50" : "bg-green-50"
                              }`}
                            >
                              <div className="h-full w-full flex flex-col justify-center">
                                {status.occupied ? (
                                  <div className="text-xs">
                                    <div className="font-medium text-gray-800 truncate">
                                      {status.course}
                                    </div>
                                    <div className="text-blue-600">
                                      {status.group}
                                    </div>
                                    <div className="text-gray-500">
                                      {status.startTime} - {status.endTime}
                                    </div>
                                    <div className="text-gray-500 italic truncate">
                                      {status.teacher}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-green-600 font-medium text-center">
                                    Available
                                  </div>
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

          {/* Card View - Fixed size cards */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getAllClassroomSchedules().map((classroom) => (
                <div
                  key={classroom.id}
                  className="bg-white rounded-lg shadow border border-gray-200 w-full h-64"
                >
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-medium text-gray-800">
                      {classroom.name}
                    </h3>
                    <p className="text-xs text-gray-500">{classroom.type}</p>
                  </div>

                  <div className="p-4 h-48 overflow-y-auto">
                    {classroom.schedules.length > 0 ? (
                      <div className="space-y-3">
                        {classroom.schedules.map((schedule, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-md bg-blue-50 border border-blue-100 h-24 flex flex-col justify-center"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-gray-800 truncate max-w-xs">
                                {schedule.course_name}
                              </span>
                              <span className="text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-600 whitespace-nowrap ml-1">
                                {schedule.group_name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1 truncate">
                              {schedule.teacher_name}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                              {schedule.start_time} - {schedule.end_time}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center">
                        <p className="text-sm text-gray-500">
                          No classes scheduled today
                        </p>
                        <p className="text-xs text-green-600 mt-1">
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
