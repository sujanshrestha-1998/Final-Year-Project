import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { BsCalendar2EventFill } from "react-icons/bs";
import { LuChevronsUpDown } from "react-icons/lu";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaUsersLine } from "react-icons/fa6";
import { RiComputerFill } from "react-icons/ri";
import { MdOutlineDescription, MdPeople } from "react-icons/md";
import { BiTime } from "react-icons/bi";

const ReserveClassroom = ({ isOpen, onClose, classroom = null }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

  // Animation effect when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle reservation submission
    console.log({
      classroom,
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
              {/* Selected Classroom */}
              {classroom && (
                <div className="mb-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Selected Classroom
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      {classroom.type === "Lecture" ? (
                        <FaChalkboardTeacher className="text-blue-500 text-2xl" />
                      ) : classroom.type === "Tutorial" ? (
                        <FaUsersLine className="text-green-500 text-2xl" />
                      ) : (
                        <RiComputerFill className="text-orange-500 text-2xl" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {classroom.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {classroom.type} Room
                      </p>
                      <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                        Capacity: {classroom.capacity || "Unknown"}
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
