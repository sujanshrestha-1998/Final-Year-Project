import React, { useState, useEffect, useRef } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoGrid, IoList } from "react-icons/io5";
import { LuChevronsUpDown } from "react-icons/lu";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { MdBookmarkAdd } from "react-icons/md";
import { PiProjectorScreenDuotone } from "react-icons/pi";
import { BsFillCalendarFill, BsPersonWorkspace } from "react-icons/bs";

import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

  // Replace day selection with date selection
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Add separate refs for each dropdown
  const groupDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const calendarRef = useRef(null);

  // Get current day of week
  const currentDate = new Date();
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Function to get day of week from date
  const getDayOfWeek = (date) => {
    return daysOfWeek[date.getDay()];
  };

  // Function to format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("en-UK", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

        // Fetch all groups instead of hardcoding them
        const groupsResponse = await axios.get(
          "http://localhost:3000/api/groups"
        );
        const fetchedGroups = groupsResponse.data.groups || [];
        setGroups(fetchedGroups);

        // Get group IDs from the fetched groups
        const groupIds = fetchedGroups.map((group) => group.id);

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

        // Format reservations to match schedule structure
        const formattedReservations = approvedReservations.map(
          (reservation) => {
            // Convert reservation date to day of week
            const reservationDate = new Date(reservation.reservation_date);
            const dayOfWeek = reservationDate.toLocaleDateString("en-US", {
              weekday: "long",
            });

            return {
              id: reservation.id,
              classroom_id: reservation.classroom_id,
              day_of_week: dayOfWeek,
              reservation_date: reservation.reservation_date, // Keep the full date for filtering
              start_time: reservation.start_time.substring(0, 5), // Format to HH:MM
              end_time: reservation.end_time.substring(0, 5), // Format to HH:MM
              user_id: reservation.user_id,
              user_name: reservation.user_name,
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
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Options for the type filter
  const options = [
    {
      value: "all",
      label: "All Types",
      icon: <IoMdInformationCircleOutline className="text-gray-500" />,
    },
    {
      value: "Lecture",
      label: "Lecture",
      icon: <PiProjectorScreenDuotone className="text-blue-500" />,
    },
    {
      value: "Tutorial",
      label: "Tutorial",
      icon: <LiaChalkboardTeacherSolid className="text-green-500" />,
    },
    {
      value: "Workshop",
      label: "Workshop",
      icon: <BsPersonWorkspace className="text-orange-500" />,
    },
  ];

  // REMOVE THIS DUPLICATE EFFECT
  // Updated click outside handler for all dropdowns
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       groupDropdownRef.current &&
  //       !groupDropdownRef.current.contains(event.target)
  //     ) {
  //       setIsGroupOpen(false);
  //     }
  //     if (
  //       typeDropdownRef.current &&
  //       !typeDropdownRef.current.contains(event.target)
  //     ) {
  //       setIsTypeOpen(false);
  //     }
  //     if (
  //       dayDropdownRef.current &&
  //       !dayDropdownRef.current.contains(event.target)
  //     ) {
  //       setIsDayOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

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
    // First filter by date
    let dateSchedules = allSchedules.filter((schedule) => {
      // For regular schedules (not reservations), filter by day of week
      if (!schedule.reservation_date) {
        return schedule.day_of_week === getDayOfWeek(selectedDate);
      }

      // For reservations, check if the date matches the selected date
      const reservationDate = new Date(schedule.reservation_date);
      return (
        reservationDate.getFullYear() === selectedDate.getFullYear() &&
        reservationDate.getMonth() === selectedDate.getMonth() &&
        reservationDate.getDate() === selectedDate.getDate()
      );
    });

    // Then filter by group if a specific group is selected
    if (activeTab !== "all") {
      dateSchedules = dateSchedules.filter(
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
      dateSchedules = dateSchedules.filter((schedule) =>
        classroomIdsOfType.includes(parseInt(schedule.classroom_id))
      );
    }

    return dateSchedules;
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
        (schedule.status && schedule.status !== "approved")
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
            {/* Replace Day Selection with Date Picker */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date
              </span>
              <div className="relative" ref={calendarRef}>
                <button
                  className="flex items-center justify-between px-2 py-1 w-56 
                  rounded-md bg-gray-100 text-sm font-medium 
                  text-gray-800 hover:bg-gray-200
                  transition-all duration-200 focus:outline-none"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                >
                  <div className="flex items-center gap-2">
                    <BsFillCalendarFill
                      className={`text-blue-500 ${
                        selectedDate.toDateString() ===
                        currentDate.toDateString()
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    />
                    <span>{formatDisplayDate(selectedDate)}</span>
                  </div>
                  <LuChevronsUpDown
                    className={`h-4 w-4 text-gray-500 ${
                      isCalendarOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isCalendarOpen && (
                  <div
                    className="absolute left-0 mt-2 rounded-xl bg-white 
                    shadow-lg border border-gray-100 overflow-hidden z-30"
                  >
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }}
                      inline
                      calendarClassName="border-none shadow-none"
                    />
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
                  className="flex items-center justify-between px-2 py-1 w-40 
                  rounded-md bg-gray-100 text-sm font-medium 
                  text-gray-800 hover:bg-gray-200
                  transition-all duration-200 focus:outline-none"
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                >
                  <div className="flex items-center gap-2">
                    {
                      options.find((option) => option.value === typeFilter)
                        ?.icon
                    }
                    <span>
                      {
                        options.find((option) => option.value === typeFilter)
                          ?.label
                      }
                    </span>
                  </div>
                  <LuChevronsUpDown
                    className={`h-4 w-4 text-gray-500 ${
                      isTypeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isTypeOpen && (
                  <div
                    className="absolute left-0 mt-2 w-40 rounded-xl bg-white 
                    shadow-lg border border-gray-100 overflow-hidden z-30"
                  >
                    <div className="py-1">
                      {options.map((option) => (
                        <button
                          key={option.value}
                          className={`flex items-center w-full px-4 py-2 text-sm text-left
                          ${
                            typeFilter === option.value
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSelect(option.value)}
                        >
                          <span className="mr-2">{option.icon}</span>
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
          <div className="flex gap-2 items-center">
            {viewMode === "card" && (
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showOnlyAvailable}
                    onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    Show only available
                  </span>
                </label>
              </div>
            )}
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                <button
                  className={`p-1.5 rounded-full transition-all duration-200 ${
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
                  className={`p-1.5 rounded-full transition-all duration-200 ${
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

              {/* Availability Filter - Only show in Card View */}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-5 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              {typeFilter !== "all" ? ` - ${typeFilter} Rooms` : ""}
              {` Schedule for ${formatDisplayDate(selectedDate)}`}
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
