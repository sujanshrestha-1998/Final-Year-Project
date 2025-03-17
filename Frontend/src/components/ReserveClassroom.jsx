import React, { useState, useEffect, useRef } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { BsCalendar2EventFill } from "react-icons/bs";
import { LuChevronsUpDown } from "react-icons/lu";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaUsersLine } from "react-icons/fa6";
import { RiComputerFill } from "react-icons/ri";
import { MdOutlineDescription, MdPeople } from "react-icons/md";
import { BiTime } from "react-icons/bi";
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

  // Ref for dropdown
  const dropdownRef = useRef(null);

  // Animation effect when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50);
      // Fetch classrooms when panel opens
      fetchClassrooms();
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

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

  // Fetch classrooms from API
  const fetchClassrooms = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/get_classrooms"
      );
      setClassrooms(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      // Use dummy data if API call fails
      setClassrooms([
        { id: 1, name: "Room 101", type: "Lecture", capacity: 100 },
        { id: 2, name: "Room 102", type: "Tutorial", capacity: 30 },
        { id: 3, name: "Room 103", type: "Workshop", capacity: 50 },
        { id: 4, name: "Room 104", type: "Lecture", capacity: 80 },
        { id: 5, name: "Room 105", type: "Tutorial", capacity: 25 },
      ]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle reservation submission
    console.log({
      classroom: selectedClassroom,
      date: selectedDate,
      startTime,
      endTime,
      purpose,
      attendees,
    });
    // Close the panel after submission
    onClose();
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
    setTimeout(() => onClose(), 300);
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Reserve Classroom
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoClose className="text-gray-500 text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit}>
              {/* Classroom Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FaChalkboardTeacher className="text-blue-500" />
                  Select Classroom
                </label>

                {/* Search and dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="flex items-center border border-gray-300 rounded-xl p-3.5 bg-white hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedClassroom ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {selectedClassroom.type === "Lecture" ? (
                            <FaChalkboardTeacher className="text-blue-500" />
                          ) : selectedClassroom.type === "Tutorial" ? (
                            <FaUsersLine className="text-green-500" />
                          ) : (
                            <RiComputerFill className="text-orange-500" />
                          )}
                          <span className="text-gray-800">
                            {selectedClassroom.name}
                          </span>
                        </div>
                        <LuChevronsUpDown className="text-gray-400" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-gray-500">
                          Select a classroom
                        </span>
                        <LuChevronsUpDown className="text-gray-400" />
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
                          <FaChalkboardTeacher className="text-xs" />
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
                          <FaUsersLine className="text-xs" />
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
                          <RiComputerFill className="text-xs" />
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
                                  <FaChalkboardTeacher className="text-blue-500" />
                                ) : room.type === "Tutorial" ? (
                                  <FaUsersLine className="text-green-500" />
                                ) : (
                                  <RiComputerFill className="text-orange-500" />
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
                              <div className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                Capacity: {room.capacity || "Unknown"}
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
                <div className="mb-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Selected Classroom
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      {selectedClassroom.type === "Lecture" ? (
                        <FaChalkboardTeacher className="text-blue-500 text-2xl" />
                      ) : selectedClassroom.type === "Tutorial" ? (
                        <FaUsersLine className="text-green-500 text-2xl" />
                      ) : (
                        <RiComputerFill className="text-orange-500 text-2xl" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {selectedClassroom.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedClassroom.type} Room
                      </p>
                      <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                        Capacity: {selectedClassroom.capacity || "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <BsCalendar2EventFill className="text-blue-500" />
                  Date
                </label>
                <div className="relative">
                  <div className="flex items-center border border-gray-300 rounded-xl p-3.5 bg-white hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                    <input
                      type="date"
                      className="flex-1 outline-none text-gray-800"
                      value={selectedDate.toISOString().split("T")[0]}
                      onChange={(e) =>
                        setSelectedDate(new Date(e.target.value))
                      }
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 font-medium">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <BiTime className="text-blue-500" />
                    Start Time
                  </label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded-xl p-3.5 pr-10 appearance-none bg-white text-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
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
                    <LuChevronsUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <BiTime className="text-blue-500" />
                    End Time
                  </label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded-xl p-3.5 pr-10 appearance-none bg-white text-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
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
                    <LuChevronsUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MdOutlineDescription className="text-blue-500" />
                  Purpose
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl p-3.5 bg-white text-gray-800 min-h-[120px] hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="Describe the purpose of your reservation"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Attendees */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MdPeople className="text-blue-500" />
                  Number of Attendees
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-xl p-3.5 bg-white text-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="Enter number of attendees"
                  min="1"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
                >
                  Submit Reservation
                </button>
              </div>

              {/* Cancel Button */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors focus:outline-none"
                >
                  Cancel
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
