import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import axios from "axios";

const TeacherMeetingPanel = ({ isOpen, onClose, teachers = [] }) => {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingDuration, setMeetingDuration] = useState("30"); // Default 30 minutes
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [animateIn, setAnimateIn] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [allTeachers, setAllTeachers] = useState([]);

  // Generate time slots from 7am to 5pm in 30-minute intervals
  const timeSlots = [];
  for (let hour = 7; hour <= 17; hour++) {
    const hourFormatted = hour.toString().padStart(2, "0");
    timeSlots.push(`${hourFormatted}:00`);
    if (hour < 17) {
      timeSlots.push(`${hourFormatted}:30`);
    }
  }

  // Duration options in minutes
  const durationOptions = ["30", "60", "90", "120"];

  // Handle animation on open/close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50);
      // Fetch all teachers when panel opens
      fetchAllTeachers();
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // Fetch all teachers from the API
  const fetchAllTeachers = async () => {
    try {
      const response = await axios.get("/api/teacher_details");
      if (response.data && response.data.teachers) {
        setAllTeachers(response.data.teachers);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  // Check teacher availability when date or time changes
  useEffect(() => {
    if (meetingDate && meetingTime) {
      checkTeacherAvailability();
    } else {
      // Reset available teachers when date or time is cleared
      setAvailableTeachers([]);
    }
  }, [meetingDate, meetingTime, meetingDuration]);

  // Function to calculate end time based on start time and duration
  // Add this function to calculate end time
  const calculateEndTime = (startTime) => {
    if (!startTime) return "";

    const [hours, minutes] = startTime.split(":");
    let endHour = parseInt(hours);
    let endMinutes = parseInt(minutes) + 30; // Default to 30 minutes meeting

    if (endMinutes >= 60) {
      endHour += 1;
      endMinutes -= 60;
    }

    return `${endHour.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Function to check teacher availability
  const checkTeacherAvailability = async () => {
    if (!meetingDate || !meetingTime) return;

    setIsCheckingAvailability(true);
    setErrorMessage("");

    try {
      // Calculate end time (30 minutes after start time)
      const endTime = calculateEndTime(meetingTime);

      console.log(
        `Checking availability for ${meetingDate} from ${meetingTime} to ${endTime}`
      );

      // Make API call to check teacher availability
      const response = await axios.get(
        "http://localhost:3000/api/check_teacher_availability",
        {
          params: {
            date: meetingDate,
            start_time: meetingTime,
            end_time: endTime,
          },
        }
      );

      console.log("Teacher availability response:", response.data);

      if (response.data.success) {
        // Update the availableTeachers state with the full teacher objects
        setAvailableTeachers(response.data.availableTeachers || []);

        // If no teachers are available, show an error message
        if (response.data.availableTeachers.length === 0) {
          setErrorMessage(
            "No teachers available at this time slot. Please select a different time."
          );
        }
      } else {
        setErrorMessage(
          response.data.message || "Failed to check teacher availability"
        );
        setAvailableTeachers([]);
      }
    } catch (error) {
      console.error("Error checking teacher availability:", error);
      setErrorMessage("Error checking teacher availability. Please try again.");
      setAvailableTeachers([]);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Calculate end time based on duration
      const endTime = calculateEndTime(meetingTime, meetingDuration);

      // Get current user ID (you might need to implement this based on your auth system)
      const userEmail = localStorage.getItem("userEmail") || "";
      let userId = null;

      // Get user ID from email
      if (userEmail) {
        const userResponse = await axios.get("/api/get_user_by_email", {
          params: { email: userEmail },
        });
        if (userResponse.data.success) {
          userId = userResponse.data.user.id;
        }
      }

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      // Make API call to schedule meeting
      const response = await axios.post("/api/schedule_meeting", {
        teacher_id: selectedTeacher,
        user_id: userId,
        meeting_date: meetingDate,
        start_time: meetingTime,
        end_time: endTime,
        purpose: meetingPurpose,
      });

      setSuccessMessage("Meeting scheduled successfully!");
      // Reset form
      setSelectedTeacher("");
      setMeetingDate("");
      setMeetingTime("");
      setMeetingDuration("30");
      setMeetingPurpose("");

      // Close panel after a delay
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      setErrorMessage(
        error.message || "Failed to schedule meeting. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => onClose(), 300);
  };

  // If panel is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay with Apple-style blur */}
      <div
        className={`absolute inset-0 backdrop-blur-md bg-black/10 transition-opacity duration-300 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      ></div>

      {/* Side Panel - Apple UI Style */}
      <div
        className={`relative w-full max-w-md bg-white/95 backdrop-blur-xl h-full shadow-2xl transform transition-transform duration-300 ease-in-out overflow-auto border-l border-gray-100 ${
          animateIn ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium text-gray-800 tracking-tight">
              Schedule Meeting
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Close panel"
            >
              <IoClose size={18} />
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-100 flex items-center animate-fadeIn">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-100 flex items-center animate-fadeIn">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  className="block text-gray-700 text-sm font-medium mb-1"
                  htmlFor="date"
                >
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" size={14} />
                    <span>Date</span>
                  </div>
                </label>
                <input
                  id="date"
                  type="date"
                  className="block w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92bd63] focus:border-transparent text-gray-700 transition-all duration-200"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
                  required
                />
              </div>

              <div className="space-y-1">
                <label
                  className="block text-gray-700 text-sm font-medium mb-1"
                  htmlFor="time"
                >
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gray-400" size={14} />
                    <span>Start Time</span>
                  </div>
                </label>
                <select
                  id="time"
                  className="block w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92bd63] focus:border-transparent appearance-none text-gray-700 transition-all duration-200"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="block text-gray-700 text-sm font-medium mb-1"
                htmlFor="duration"
              >
                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-400" size={14} />
                  <span>Duration (minutes)</span>
                </div>
              </label>
              <select
                id="duration"
                className="block w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92bd63] focus:border-transparent appearance-none text-gray-700 transition-all duration-200"
                value={meetingDuration}
                onChange={(e) => setMeetingDuration(e.target.value)}
                required
              >
                {durationOptions.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} minutes
                  </option>
                ))}
              </select>
              {meetingTime && meetingDuration && (
                <p className="text-sm text-gray-600 mt-1">
                  End time: {calculateEndTime(meetingTime, meetingDuration)}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                className="block text-gray-700 text-sm font-medium mb-1"
                htmlFor="teacher"
              >
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" size={14} />
                  <span>Teacher</span>
                </div>
              </label>
              <div className="relative group">
                <select
                  id="teacher"
                  className="block w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92bd63] focus:border-transparent appearance-none text-gray-700 transition-all duration-200"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  required
                  disabled={
                    !meetingDate ||
                    !meetingTime ||
                    isCheckingAvailability ||
                    (meetingDate &&
                      meetingTime &&
                      availableTeachers.length === 0)
                  }
                >
                  <option value="">Select a teacher</option>
                  {availableTeachers.length > 0
                    ? availableTeachers.map((teacher) => (
                        <option
                          key={teacher.teacher_id}
                          value={teacher.teacher_id}
                        >
                          {teacher.first_name} {teacher.last_name} -{" "}
                          {teacher.course}
                        </option>
                      ))
                    : allTeachers.map((teacher) => (
                        <option
                          key={teacher.teacher_id}
                          value={teacher.teacher_id}
                          disabled={meetingDate && meetingTime}
                        >
                          {teacher.first_name} {teacher.last_name} -{" "}
                          {teacher.course}
                        </option>
                      ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-gray-500 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              {isCheckingAvailability && (
                <div className="text-sm text-gray-500 mt-1 flex items-center">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Checking teacher availability...
                </div>
              )}
              {!meetingDate || !meetingTime ? (
                <p className="text-sm text-amber-600 mt-1">
                  Please select a date and time first
                </p>
              ) : isCheckingAvailability ? null : availableTeachers.length ===
                0 ? (
                <p className="text-sm text-red-600 mt-1">
                  No teachers available at this time slot. Please select a
                  different time.
                </p>
              ) : (
                <p className="text-sm text-green-600 mt-1">
                  {availableTeachers.length} teacher(s) available
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                className="block text-gray-700 text-sm font-medium mb-1"
                htmlFor="purpose"
              >
                Purpose
              </label>
              <textarea
                id="purpose"
                className="block w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92bd63] focus:border-transparent text-gray-700 transition-all duration-200 resize-none"
                rows="4"
                placeholder="What would you like to discuss?"
                value={meetingPurpose}
                onChange={(e) => setMeetingPurpose(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="pt-4 mt-auto">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#92bd63] hover:bg-[#7da952] text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92bd63] focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                disabled={
                  isSubmitting || !selectedTeacher || isCheckingAvailability
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Scheduling...</span>
                  </div>
                ) : (
                  "Schedule Meeting"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Meetings are subject to teacher availability and confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherMeetingPanel;
