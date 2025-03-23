import React, { useState, useEffect, useRef } from "react";
import { IoChevronBack, IoSearch } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import { PiProjectorScreenDuotone } from "react-icons/pi";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { BsPersonWorkspace } from "react-icons/bs";
import axios from "axios";

const ReserveClassroom = ({ isOpen, onClose, classroom = null }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

  // New state variables for classroom selection
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(classroom);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [allSchedules, setAllSchedules] = useState([]);
  const [classroomAvailability, setClassroomAvailability] = useState({});
  // Move the reservation conflicts state to component level
  const [reservationConflicts, setReservationConflicts] = useState([]);

  // Ref for dropdown
  const dropdownRef = useRef(null);

  // Reset form function
  const resetForm = () => {
    setSelectedDate(new Date());
    setStartTime("");
    setEndTime("");
    setPurpose("");
    setAttendees("");
    // Only reset selected classroom if no classroom was passed as prop
    if (!classroom) {
      setSelectedClassroom(null);
    }
    setSearchQuery("");
    setIsDropdownOpen(false);
    setTypeFilter("all");
  };

  // Animation effect when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50);
      // Fetch classrooms when panel opens
      fetchClassrooms();
    } else {
      setAnimateIn(false);
      // Reset form when panel closes
      resetForm();
    }
  }, [isOpen, classroom]);

  // Set selected classroom when prop changes
  useEffect(() => {
    if (classroom) {
      setSelectedClassroom(classroom);
    }
  }, [classroom]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to calculate availability for all classrooms
  const calculateClassroomAvailability = (classrooms, schedules) => {
    const availability = {};

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Get current day of week
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDay = daysOfWeek[now.getDay()];

    // Calculate availability for each classroom
    classrooms.forEach((classroom) => {
      // Check if there are any schedules for this classroom at the current time
      const isOccupied = schedules.some((schedule) => {
        // Check if it's for this classroom and today
        if (
          parseInt(schedule.classroom_id) !== classroom.id ||
          schedule.day_of_week !== currentDay
        ) {
          return false;
        }

        // Parse schedule times
        const [startHour, startMinute] = schedule.start_time
          .split(":")
          .map(Number);
        const [endHour, endMinute] = schedule.end_time.split(":").map(Number);

        const scheduleStartMinutes = startHour * 60 + startMinute;
        const scheduleEndMinutes = endHour * 60 + endMinute;

        // Check if current time falls within the schedule
        const isWithinSchedule =
          currentTimeInMinutes >= scheduleStartMinutes &&
          currentTimeInMinutes < scheduleEndMinutes;

        return isWithinSchedule;
      });

      // Store availability for this classroom
      availability[classroom.id] = {
        isAvailable: !isOccupied,
        status: isOccupied ? "Occupied" : "Available",
      };
    });

    setClassroomAvailability(availability);
  };

  // Function to get classroom availability
  const getClassroomAvailability = (classroom) => {
    // Return stored availability or default to available if not found
    const availability = classroomAvailability[classroom.id] || {
      isAvailable: true,
      status: "Available",
    };
    return availability;
  };

  // Fetch classrooms from API
  const fetchClassrooms = async () => {
    setIsLoading(true);
    try {
      // Fetch classrooms
      const classroomsResponse = await axios.get(
        "http://localhost:3000/api/get_classrooms"
      );
      const fetchedClassrooms = classroomsResponse.data.data || [];
      setClassrooms(fetchedClassrooms);

      // Fetch schedules
      try {
        const schedulesResponse = await axios.get(
          "http://localhost:3000/api/get_all_schedules"
        );
        const fetchedSchedules = schedulesResponse.data.schedules || [];
        setAllSchedules(fetchedSchedules);

        // Calculate availability for each classroom
        calculateClassroomAvailability(fetchedClassrooms, fetchedSchedules);
      } catch (scheduleError) {
        console.error("Error fetching schedules:", scheduleError);
        setAllSchedules([]);
        calculateClassroomAvailability(fetchedClassrooms, []);
      }
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      setClassrooms([]);
      setAllSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots from 7 AM to 5 PM
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 7; hour <= 17; hour++) {
      const hourFormatted = hour.toString().padStart(2, "0");
      options.push(`${hourFormatted}:00`);
      if (hour < 17) options.push(`${hourFormatted}:30`);
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Filter classrooms based on search query and type filter
  const getFilteredClassrooms = () => {
    return classrooms.filter((room) => {
      const matchesSearch = room.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || room.type === typeFilter;
      return matchesSearch && matchesType;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (
      !selectedClassroom ||
      !selectedDate ||
      !startTime ||
      !endTime ||
      !purpose ||
      !attendees
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if the classroom is available for the selected time
    if (!checkAvailabilityForSelectedTime()) {
      alert("This classroom is not available for the selected time slot");
      return;
    }

    // Format date for API
    const formattedDate = selectedDate.toISOString().split("T")[0];

    try {
      // Get user email from localStorage instead of user object
      const userEmail = localStorage.getItem("userEmail");
      const isAuthenticated =
        localStorage.getItem("isAuthenticated") === "true";

      console.log("Auth status:", isAuthenticated, "Email:", userEmail);

      if (!isAuthenticated || !userEmail) {
        alert(
          "You must be logged in to reserve a classroom. Please log in and try again."
        );
        return;
      }

      // First, fetch the user ID using the email
      const userResponse = await axios.get(
        `http://localhost:3000/api/get_user_by_email?email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (
        !userResponse.data.success ||
        !userResponse.data.user ||
        !userResponse.data.user.id
      ) {
        alert("Could not retrieve your user information. Please log in again.");
        return;
      }

      const userId = userResponse.data.user.id;
      console.log("Retrieved user ID:", userId);

      // Prepare reservation data
      const reservationData = {
        classroom_id: selectedClassroom.id,
        user_id: userId,
        purpose: purpose,
        reservation_date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        attendees: parseInt(attendees),
      };

      console.log("Sending reservation data:", reservationData);

      // Submit reservation to API
      const response = await axios.post(
        "http://localhost:3000/api/reserve_classroom",
        reservationData
      );

      if (response.data.success) {
        alert(
          "Classroom reservation submitted successfully! Awaiting approval."
        );
        // Reset form after successful submission
        resetForm();
        // Close the panel after successful submission
        handleClose();
      } else {
        alert(
          "Failed to reserve classroom: " +
            (response.data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
      alert(
        "An error occurred while submitting your reservation. Please try again."
      );
    }
  };

  // Add this useEffect at the component level
  useEffect(() => {
    // Only check for reservation conflicts when all required fields are filled
    if (selectedClassroom && selectedDate && startTime && endTime) {
      checkReservationConflicts();
    }
  }, [selectedClassroom, selectedDate, startTime, endTime]);

  // Move this function to component level
  const checkReservationConflicts = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await axios.get(
        `http://localhost:3000/api/check_reservation_conflicts?classroom_id=${selectedClassroom.id}&date=${formattedDate}&start_time=${startTime}&end_time=${endTime}`
      );

      if (response.data && response.data.conflicts) {
        setReservationConflicts(response.data.conflicts);
      } else {
        setReservationConflicts([]);
      }
    } catch (error) {
      console.error("Error checking reservation conflicts:", error);
      setReservationConflicts([]);
    }
  };

  // Fix this function to not use hooks inside
  const checkAvailabilityForSelectedTime = () => {
    if (!selectedClassroom || !selectedDate || !startTime || !endTime) {
      return true; // If any required field is missing, assume available
    }

    // Get day of week for selected date
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const selectedDayOfWeek = daysOfWeek[selectedDate.getDay()];

    // Parse selected times
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const selectedStartMinutes = startHour * 60 + startMinute;
    const selectedEndMinutes = endHour * 60 + endMinute;

    // Check if there are any schedules that conflict with the selected time
    const hasScheduleConflict = allSchedules.some((schedule) => {
      // Check if it's for this classroom and the selected day
      if (
        parseInt(schedule.classroom_id) !== selectedClassroom.id ||
        schedule.day_of_week !== selectedDayOfWeek
      ) {
        return false;
      }

      // Parse schedule times
      const [schStartHour, schStartMinute] = schedule.start_time
        .split(":")
        .map(Number);
      const [schEndHour, schEndMinute] = schedule.end_time
        .split(":")
        .map(Number);

      const scheduleStartMinutes = schStartHour * 60 + schStartMinute;
      const scheduleEndMinutes = schEndHour * 60 + schEndMinute;

      // Check for overlap
      return (
        selectedStartMinutes < scheduleEndMinutes &&
        selectedEndMinutes > scheduleStartMinutes
      );
    });

    // Use the reservationConflicts state that's now at component level
    // If there are any conflicts (either from schedules or reservations), return false
    return !hasScheduleConflict && reservationConflicts.length === 0;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time to 12-hour format
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Handle close with animation
  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Handle classroom selection
  const handleSelectClassroom = (room) => {
    setSelectedClassroom(room);
    setIsDropdownOpen(false);
  };

  // Handle type filter selection
  const handleTypeFilter = (type) => {
    setTypeFilter(type);
  };

  if (!isOpen) return null;

  // Rest of the component remains unchanged
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with blur effect */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      ></div>

      {/* Slide-in panel */}
      <div
        className={`absolute inset-y-0 right-0 w-[450px] max-w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          animateIn ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <button
              onClick={handleClose}
              className="p-2 flex gap-1 text-blue-500 items-center text-sm font-medium"
            >
              <IoChevronBack /> Cancel
            </button>
            <h2 className="text-xl ml-10 font-semibold text-gray-800">
              Reserve Classroom
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit}>
              {/* Classroom Selection */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  Select Classroom
                </label>

                {/* Search and dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="flex items-center rounded-md p-2 bg-gray-100 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedClassroom ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {selectedClassroom.type === "Lecture" ? (
                            <PiProjectorScreenDuotone className="text-blue-500" />
                          ) : selectedClassroom.type === "Tutorial" ? (
                            <LiaChalkboardTeacherSolid className="text-green-500" />
                          ) : (
                            <BsPersonWorkspace className="text-orange-500" />
                          )}
                          <span className="text-gray-800">
                            {selectedClassroom.name}
                          </span>
                        </div>
                        <IoMdArrowDropdown className="text-gray-400 text-xl" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-gray-500">
                          Select a classroom
                        </span>
                        <IoMdArrowDropdown className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      {/* Search input */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search classrooms..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Type filters */}
                      <div className="flex p-2 gap-1 border-b border-gray-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTypeFilter("all");
                          }}
                          className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                            typeFilter === "all"
                              ? "bg-gray-800 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTypeFilter("Lecture");
                          }}
                          className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                            typeFilter === "Lecture"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <PiProjectorScreenDuotone className="text-xs" />
                          Lecture
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTypeFilter("Tutorial");
                          }}
                          className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                            typeFilter === "Tutorial"
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <LiaChalkboardTeacherSolid className="text-xs" />
                          Tutorial
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTypeFilter("Workshop");
                          }}
                          className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                            typeFilter === "Workshop"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <BsPersonWorkspace className="text-xs" />
                          Workshop
                        </button>
                      </div>

                      {/* Classroom list */}
                      {isLoading ? (
                        <div className="p-4 text-center">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                          <p className="mt-2 text-sm text-gray-500">
                            Loading classrooms...
                          </p>
                        </div>
                      ) : getFilteredClassrooms().length > 0 ? (
                        <div className="py-1">
                          {getFilteredClassrooms().map((room) => (
                            <div
                              key={room.id}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectClassroom(room);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {room.type === "Lecture" ? (
                                  <PiProjectorScreenDuotone className="text-blue-500" />
                                ) : room.type === "Tutorial" ? (
                                  <LiaChalkboardTeacherSolid className="text-green-500" />
                                ) : (
                                  <BsPersonWorkspace className="text-orange-500" />
                                )}
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {room.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {room.type} Room
                                  </div>
                                </div>
                              </div>
                              {/* Display availability status */}
                              <div
                                className={`text-xs px-2 py-1 rounded-full ${
                                  getClassroomAvailability(room).isAvailable
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {getClassroomAvailability(room).status}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No classrooms found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Classroom Display */}
              {selectedClassroom && (
                <div className="mb-6 p-6 rounded-lg bg-blue-100 shadow-md">
                  <h3 className="font-medium mb-3">Selected Classroom</h3>
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      {selectedClassroom.type === "Lecture" ? (
                        <PiProjectorScreenDuotone className="text-blue-500 text-2xl" />
                      ) : selectedClassroom.type === "Tutorial" ? (
                        <LiaChalkboardTeacherSolid className="text-green-500 text-2xl" />
                      ) : (
                        <BsPersonWorkspace className="text-orange-500 text-2xl" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {selectedClassroom.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedClassroom.type} Room
                      </p>
                      {/* Display current availability status */}
                      <div
                        className={`mt-2 text-xs font-medium px-3 py-1 rounded-full inline-block ${
                          getClassroomAvailability(selectedClassroom)
                            .isAvailable
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {getClassroomAvailability(selectedClassroom).status}
                      </div>

                      {/* Add availability for selected time slot if all fields are filled */}
                      {selectedDate && startTime && endTime && (
                        <div
                          className={`mt-2 ml-2 text-xs font-medium px-3 py-1 rounded-full inline-block ${
                            checkAvailabilityForSelectedTime()
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {checkAvailabilityForSelectedTime()
                            ? "Available for selected time"
                            : "Unavailable for selected time"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  Date - {formatDate(selectedDate)}
                </label>
                <div className="relative">
                  <div className="flex items-center rounded-md p-2 bg-gray-100 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                    <input
                      type="date"
                      className="flex-1 outline-none text-gray-800 bg-gray-100"
                      value={selectedDate.toISOString().split("T")[0]}
                      onChange={(e) =>
                        setSelectedDate(new Date(e.target.value))
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-md p-1.5 pr-10 appearance-none bg-gray-100 text-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        // If end time is not set or is earlier than new start time, reset it
                        if (!endTime || endTime <= e.target.value) {
                          setEndTime("");
                        }
                      }}
                      required
                    >
                      <option value="">Select time</option>
                      {timeOptions.map((time) => (
                        <option key={`start-${time}`} value={time}>
                          {formatTime(time)}
                        </option>
                      ))}
                    </select>
                    <IoMdArrowDropdown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-md p-1.5 pr-10 appearance-none bg-gray-100 text-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      disabled={!startTime}
                    >
                      <option value="">Select time</option>
                      {timeOptions.map((time) => (
                        <option
                          key={`end-${time}`}
                          value={time}
                          disabled={startTime && time <= startTime}
                        >
                          {formatTime(time)}
                        </option>
                      ))}
                    </select>
                    <IoMdArrowDropdown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  Purpose
                </label>
                <textarea
                  className="w-full  rounded-md p-2 bg-gray-100 text-gray-800 min-h-[120px] hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="Describe the purpose of your reservation"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Attendees */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  Number of Attendees
                </label>
                <input
                  className="w-full  rounded-md p-2 bg-gray-100 text-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="Enter number of attendees"
                  min="1"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-gray-400 text-white py-1 px-2 rounded-lg font-medium hover:bg-gray-500 active:bg-gray-300 transition-colors focus:outline-none shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-1 px-2 rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
                >
                  Submit Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserveClassroom;
