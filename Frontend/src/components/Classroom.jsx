import React, { useState, useEffect, useRef } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoGrid, IoList } from "react-icons/io5";
import { LuChevronsUpDown } from "react-icons/lu";
import { BsCalendar2EventFill } from "react-icons/bs";
import { MdBookmarkAdd } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaUsersLine } from "react-icons/fa6";
import { RiComputerFill } from "react-icons/ri";
import axios from "axios";
import ReserveClassroom from "./ReserveClassroom";
import { TableView, CardView } from "./ClassroomViews"; // Import the new components

const Classroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [typeFilter, setTypeFilter] = useState("all");
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  // Add these two state variables
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  // Add separate refs for each dropdown
  const groupDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);

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
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [isDayOpen, setIsDayOpen] = useState(false);

  // Add ref for day dropdown
  const dayDropdownRef = useRef(null);

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

  // Add a new function to fetch approved reservations
  const fetchApprovedReservations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/get_approved_reservations"
      );
      console.log("Approved reservations:", response.data); // Add this log
      return response.data.reservations || [];
    } catch (err) {
      console.error("Error fetching approved reservations:", err);
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

        // Fetch approved reservations and add them to schedules
        const approvedReservations = await fetchApprovedReservations();
        console.log(
          "Number of approved reservations:",
          approvedReservations.length
        ); // Add this log

        // Format reservations to match schedule structure
        // Update the formattedReservations mapping function:

        const formattedReservations = approvedReservations.map(
          (reservation) => {
            // Convert reservation date to day of week
            const reservationDate = new Date(reservation.reservation_date);
            const dayOfWeek = reservationDate.toLocaleDateString("en-US", {
              weekday: "long",
            });

            console.log(
              "Processing reservation with username:",
              reservation.user_name
            );

            return {
              id: reservation.id,
              classroom_id: reservation.classroom_id,
              day_of_week: dayOfWeek,
              start_time: reservation.start_time.substring(0, 5), // Format to HH:MM
              end_time: reservation.end_time.substring(0, 5), // Format to HH:MM
              user_id: reservation.user_id,
              user_name: reservation.user_name, // Make sure this is set correctly
              purpose: reservation.purpose,
              attendees: reservation.attendees,
              status: reservation.status,
              group_id: "all", // Reservations apply to all groups
            };
          }
        );

        // Combine regular schedules with approved reservations
        const combinedSchedules = [
          ...allGroupSchedules,
          ...formattedReservations,
        ];
        console.log("Combined schedules:", combinedSchedules.length); // Add this log
        setAllSchedules(combinedSchedules);
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
    {
      value: "all",
      label: "All Types",
      icon: <IoMdInformationCircleOutline className="text-gray-500" />,
    },
    {
      value: "Lecture",
      label: "Lecture",
      icon: <FaChalkboardTeacher className="text-blue-500" />,
    },
    {
      value: "Tutorial",
      label: "Tutorial",
      icon: <FaUsersLine className="text-green-500" />,
    },
    {
      value: "Workshop",
      label: "Workshop",
      icon: <RiComputerFill className="text-orange-500" />,
    },
  ];

  // Updated click outside handler for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(event.target)
      ) {
        setIsGroupOpen(false);
      }
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setIsTypeOpen(false);
      }
      if (
        dayDropdownRef.current &&
        !dayDropdownRef.current.contains(event.target)
      ) {
        setIsDayOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Updated handleSelect function
  const handleSelect = (value) => {
    setTypeFilter(value);
    setIsTypeOpen(false);
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

  // Filter schedules based on active tab and selected day
  const getFilteredSchedules = () => {
    console.log("All schedules:", allSchedules.length); // Add this log
    console.log("Selected day:", selectedDay); // Add this log

    // First filter by day
    let daySchedules = allSchedules.filter(
      (schedule) => schedule.day_of_week === selectedDay
    );

    console.log("Schedules for selected day:", daySchedules.length); // Add this log
    console.log(
      "Approved reservations for day:",
      daySchedules.filter((s) => s.status === "approved").length
    ); // Add this log

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

  // Function to check if a classroom is occupied at a certain time - OPTIMIZED
  const getClassroomStatus = (classroomId, timeSlot) => {
    const filteredSchedules = getFilteredSchedules();

    // Convert time slots to minutes for easier comparison
    const [startHour, startMinute] = timeSlot.start.split(":").map(Number);
    const [endHour, endMinute] = timeSlot.end.split(":").map(Number);
    const slotStartMinutes = startHour * 60 + startMinute;
    const slotEndMinutes = endHour * 60 + endMinute;

    // Check for approved reservations first
    const approvedReservation = filteredSchedules.find((schedule) => {
      // Skip if not for this classroom or not approved
      if (
        parseInt(schedule.classroom_id) !== parseInt(classroomId) ||
        schedule.status !== "approved"
      )
        return false;

      // Parse schedule times once
      const scheduleStartTime = schedule.start_time.substring(0, 5); // Ensure format is HH:MM
      const scheduleEndTime = schedule.end_time.substring(0, 5); // Ensure format is HH:MM

      const [scheduleStartHour, scheduleStartMinute] = scheduleStartTime
        .split(":")
        .map(Number);
      const [scheduleEndHour, scheduleEndMinute] = scheduleEndTime
        .split(":")
        .map(Number);
      const scheduleStartMinutes = scheduleStartHour * 60 + scheduleStartMinute;
      const scheduleEndMinutes = scheduleEndHour * 60 + scheduleEndMinute;

      // Check for overlap using simplified logic
      return (
        slotStartMinutes < scheduleEndMinutes &&
        slotEndMinutes > scheduleStartMinutes
      );
    });

    // Inside the getClassroomStatus function, update the return statement for approved reservations:

    // If there's an approved reservation, return it
    if (approvedReservation) {
      return {
        occupied: true,
        isApproved: true,
        // Use the user_name directly instead of constructing it from user_id
        username: approvedReservation.user_name,
        startTime: approvedReservation.start_time.substring(0, 5),
        endTime: approvedReservation.end_time.substring(0, 5),
        scheduleId: approvedReservation.id,
        purpose: approvedReservation.purpose,
      };
    }

    // Find regular occupying schedule
    const occupyingSchedule = filteredSchedules.find((schedule) => {
      // Skip if not for this classroom
      if (parseInt(schedule.classroom_id) !== parseInt(classroomId))
        return false;

      // Parse schedule times once
      const [scheduleStartHour, scheduleStartMinute] = schedule.start_time
        .split(":")
        .map(Number);
      const [scheduleEndHour, scheduleEndMinute] = schedule.end_time
        .split(":")
        .map(Number);
      const scheduleStartMinutes = scheduleStartHour * 60 + scheduleStartMinute;
      const scheduleEndMinutes = scheduleEndHour * 60 + scheduleEndMinute;

      // Check for overlap using simplified logic
      return (
        slotStartMinutes < scheduleEndMinutes &&
        slotEndMinutes > scheduleStartMinutes
      );
    });

    // Return regular schedule if it exists
    return occupyingSchedule
      ? {
          occupied: true,
          course: occupyingSchedule.course_name,
          teacher: occupyingSchedule.teacher_name,
          group: occupyingSchedule.group_name,
          startTime: occupyingSchedule.start_time,
          endTime: occupyingSchedule.end_time,
          scheduleId: occupyingSchedule.id,
          isApproved: false,
        }
      : { occupied: false };
  };

  // Get all classroom schedules for card view with availability filter - OPTIMIZED
  const getAllClassroomSchedules = () => {
    const filteredSchedules = getFilteredSchedules();
    const filteredClassrooms = getFilteredClassrooms();

    // Get current time once
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    // Create a map for faster schedule lookup
    const schedulesByClassroomId = filteredSchedules.reduce((acc, schedule) => {
      const id = parseInt(schedule.classroom_id);
      if (!acc[id]) acc[id] = [];

      // Ensure time formats are consistent
      const startTime = schedule.start_time.substring(0, 5); // Format to HH:MM
      const endTime = schedule.end_time.substring(0, 5); // Format to HH:MM

      // Add isApproved flag and username to each schedule
      const enhancedSchedule = {
        ...schedule,
        start_time: startTime,
        end_time: endTime,
        isApproved: schedule.status === "approved",
        username: schedule.user_name || `User ${schedule.user_id}`,
        purpose: schedule.purpose || "No purpose specified",
      };

      acc[id].push(enhancedSchedule);
      return acc;
    }, {});

    // Process classrooms with the schedule map
    const classroomsWithSchedules = filteredClassrooms.map((classroom) => {
      const classroomId = classroom.id;
      const classroomSchedules = schedulesByClassroomId[classroomId] || [];

      // Check if currently occupied using some() for early return
      const isCurrentlyOccupied = classroomSchedules.some((schedule) => {
        const [startHour, startMinute] = schedule.start_time
          .split(":")
          .map(Number);
        const [endHour, endMinute] = schedule.end_time.split(":").map(Number);

        const scheduleStartInMinutes = startHour * 60 + startMinute;
        const scheduleEndInMinutes = endHour * 60 + endMinute;

        return (
          currentTimeInMinutes >= scheduleStartInMinutes &&
          currentTimeInMinutes < scheduleEndInMinutes
        );
      });

      return {
        ...classroom,
        schedules: classroomSchedules,
        isCurrentlyOccupied,
      };
    });

    // Apply availability filter if needed
    return showOnlyAvailable && viewMode === "card"
      ? classroomsWithSchedules.filter(
          (classroom) => !classroom.isCurrentlyOccupied
        )
      : classroomsWithSchedules;
  };

  // Format time function remains the same
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-US", options);
  };

  // Add the missing calculateCellSpan function
  const calculateCellSpan = (classroom, timeSlots) => {
    const spans = {};
    const processed = new Set();

    // For each time slot
    timeSlots.forEach((slot, slotIndex) => {
      // Skip if already processed
      if (processed.has(slotIndex)) return;

      // Get status for this classroom and time slot
      const status = getClassroomStatus(classroom.id, slot);

      // If occupied, calculate span
      if (status.occupied) {
        // Convert times to minutes for easier comparison
        const [startHour, startMinute] = status.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = status.endTime.split(":").map(Number);
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        // Count how many slots this schedule spans
        let spanCount = 0;
        let currentSlotIndex = slotIndex;

        while (currentSlotIndex < timeSlots.length) {
          const currentSlot = timeSlots[currentSlotIndex];
          const [currentSlotEndHour, currentSlotEndMinute] = currentSlot.end
            .split(":")
            .map(Number);
          const currentSlotEndInMinutes =
            currentSlotEndHour * 60 + currentSlotEndMinute;

          // If the current slot ends after the schedule ends, stop counting
          if (currentSlotEndInMinutes > endTimeInMinutes) {
            break;
          }

          spanCount++;
          processed.add(currentSlotIndex);
          currentSlotIndex++;
        }

        // Store the span information
        spans[slotIndex] = {
          span: spanCount,
          status: status,
        };
      }
    });

    return spans;
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
  const handleOpenReservation = (classroom) => {
    setSelectedClassroom(classroom);
    setIsReservationOpen(true);
  };

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
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 flex gap-1 items-center bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md transition-transform duration-200 hover:scale-105 hover:brightness-105"
              onClick={() => handleOpenReservation(getFilteredClassrooms()[0])}
            >
              <MdBookmarkAdd />
              Reserve Classroom
            </button>
          </div>
        </div>

        {/* Controls - Group Tabs and View Toggle */}
        <div className="flex justify-between items-center border-b border-gray-200 bg-white/95 backdrop-blur-lg px-6 sticky top-0 z-20 py-3 shadow-sm">
          <div className="flex items-center gap-5">
            {/* Day Selection */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Day
              </span>
              <div className="relative" ref={dayDropdownRef}>
                <button
                  className="flex items-center justify-between px-2 py-1 w-36 
                  rounded-md bg-gray-100 text-sm font-medium 
                  text-gray-800 hover:bg-gray-200
                  transition-all duration-200 focus:outline-none"
                  onClick={() => setIsDayOpen(!isDayOpen)}
                >
                  <div className="flex items-center gap-2">
                    <BsCalendar2EventFill
                      className={`text-blue-500 ${
                        selectedDay === currentDay
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    />
                    {selectedDay}
                  </div>
                  <LuChevronsUpDown
                    className={`h-4 w-4 text-gray-500 ${
                      isDayOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDayOpen && (
                  <div
                    className="absolute left-0 mt-2 w-36 rounded-xl bg-white 
                    shadow-lg border border-gray-100 overflow-hidden z-30"
                  >
                    <div className="py-1">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          className={`w-full text-left px-4 py-2.5 text-sm
                          transition-colors duration-150 flex items-center gap-2
                          ${
                            selectedDay === day
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedDay(day);
                            setIsDayOpen(false);
                          }}
                        >
                          <BsCalendar2EventFill
                            className={`${
                              day === currentDay
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                          {day}
                          {day === currentDay && (
                            <span className="ml-auto text-xs text-blue-500">
                              (Today)
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group Selection */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Group
              </span>
              <div className="relative" ref={groupDropdownRef}>
                <button
                  className="flex items-center justify-between px-2 py-1 w-36 
                  rounded-md bg-gray-100 text-sm font-medium 
                  text-gray-800 hover:bg-gray-200
                  transition-all duration-200 focus:outline-none"
                  onClick={() => setIsGroupOpen(!isGroupOpen)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {activeTab === "all" ? "All Groups" : `Group ${activeTab}`}
                  </div>
                  <LuChevronsUpDown
                    className={`h-4 w-4 text-gray-500  ${
                      isGroupOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isGroupOpen && (
                  <div
                    className="absolute left-0 mt-2 w-36 rounded-xl bg-white 
                    shadow-lg border border-gray-100 overflow-hidden z-30"
                  >
                    <div className="py-1">
                      <button
                        className={`w-full text-left px-4 py-2.5 text-sm
                        transition-colors duration-150 flex items-center gap-2
                        ${
                          activeTab === "all"
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setActiveTab("all");
                          setIsGroupOpen(false);
                        }}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            activeTab === "all" ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        ></span>
                        All Groups
                      </button>
                      {groups.map((group) => (
                        <button
                          key={group.id}
                          className={`w-full text-left px-4 py-2.5 text-sm
                          transition-colors duration-150 flex items-center gap-2
                          ${
                            activeTab === group.id.toString()
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setActiveTab(group.id.toString());
                            setIsGroupOpen(false);
                          }}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              activeTab === group.id.toString()
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          ></span>
                          {group.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Type
              </span>
              <div className="relative" ref={typeDropdownRef}>
                <button
                  className="flex items-center justify-between px-2 py-1 w-36 
                  rounded-md bg-gray-100 text-sm font-medium 
                  text-gray-800 hover:bg-gray-200
                  transition-all duration-200 focus:outline-none"
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={isTypeOpen}
                >
                  <div className="flex items-center gap-2">
                    {options.find((opt) => opt.value === typeFilter)?.icon || (
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    )}
                    {options.find((opt) => opt.value === typeFilter)?.label}
                  </div>
                  <LuChevronsUpDown
                    className={`h-4 w-4 text-gray-500 ${
                      isTypeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isTypeOpen && (
                  <div
                    className="absolute right-0 mt-2 w-36 rounded-xl bg-white 
                    shadow-lg border border-gray-100 overflow-hidden z-30"
                  >
                    <div className="py-1">
                      {options.map((option) => (
                        <button
                          key={option.value}
                          className={`w-full text-left px-4 py-2.5 text-sm
                          flex items-center gap-2 transition-colors duration-150
                          ${
                            typeFilter === option.value
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSelect(option.value)}
                          role="option"
                          aria-selected={typeFilter === option.value}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Toggle and Availability Filter */}
          <div className="flex items-center gap-4">
            {/* Availability Filter - Only show in card view */}
            {viewMode === "card" && (
              <div className="flex items-center gap-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showOnlyAvailable}
                    onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
                  />
                  <div className="relative w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  <span className="ml-2 text-xs font-medium text-gray-700">
                    Available Only
                  </span>
                </label>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                View
              </span>
              <div className="flex bg-gray-100 p-1 rounded-full">
                <button
                  className={`p-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setViewMode("table")}
                  title="Table View"
                >
                  <IoList className="text-lg" />
                </button>
                <button
                  className={`p-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                    viewMode === "card"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setViewMode("card")}
                  title="Card View"
                >
                  <IoGrid className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-5 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              {activeTab === "all" ? "All Groups" : `Group ${activeTab}`}
              {typeFilter !== "all" ? ` - ${typeFilter} Rooms` : ""}
              {` - ${
                selectedDay === currentDay ? "Today's" : selectedDay + "'s"
              } Schedule`}
            </h2>

            <div className="flex items-center text-sm text-gray-500">
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span>
              <span className="mr-3">Available</span>
              <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-1"></span>
              <span>Occupied</span>
            </div>
          </div>

          {/* Table View - Using the extracted component */}
          {viewMode === "table" && (
            <TableView
              filteredClassrooms={getFilteredClassrooms()}
              timeSlots={timeSlots}
              calculateCellSpan={calculateCellSpan}
              formatTime={formatTime}
            />
          )}

          {/* Card View - Using the extracted component */}
          {viewMode === "card" && (
            <CardView
              classroomsWithSchedules={getAllClassroomSchedules()}
              formatTime={formatTime}
              handleOpenReservation={handleOpenReservation}
            />
          )}
        </div>
      </div>
      <ReserveClassroom
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        classroom={selectedClassroom}
      />
    </div>
  );
};

export default Classroom;
