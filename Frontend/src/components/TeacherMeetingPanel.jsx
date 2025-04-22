import React, { useState, useEffect } from "react";
import { IoChevronBack, IoClose } from "react-icons/io5";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaClipboardList,
} from "react-icons/fa";
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
  const [isTeacherAvailable, setIsTeacherAvailable] = useState(null); // null = not checked, true/false = available/unavailable
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [allTeachers, setAllTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

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
    setIsLoadingTeachers(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/teacher_details"
      );
      console.log("Teacher response:", response.data);

      if (response.data && response.data.teachers) {
        setAllTeachers(response.data.teachers);
      } else {
        console.error("No teachers found in response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setErrorMessage("Failed to load teachers. Please try again.");
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // Function to calculate end time based on start time and duration
  const calculateEndTime = (startTime, duration = "30") => {
    if (!startTime) return "";

    const [hours, minutes] = startTime.split(":");
    let endHour = parseInt(hours);
    let endMinutes = parseInt(minutes) + parseInt(duration);

    while (endMinutes >= 60) {
      endHour += 1;
      endMinutes -= 60;
    }

    // Format with leading zeros
    return `${endHour.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Format date for display (e.g., "Monday, April 24, 2025")
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display (e.g., "10:00 AM")
  const formatDisplayTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Check teacher availability when date, time, or selected teacher changes
  useEffect(() => {
    if (selectedTeacher && meetingDate && meetingTime) {
      checkTeacherAvailability();
    } else {
      // Reset availability status when any required field is cleared
      setIsTeacherAvailable(null);
    }
  }, [selectedTeacher, meetingDate, meetingTime, meetingDuration]);

  // Function to check teacher availability
  const checkTeacherAvailability = async () => {
    if (!selectedTeacher || !meetingDate || !meetingTime) return;

    setIsCheckingAvailability(true);
    setErrorMessage("");

    try {
      // Calculate end time based on selected duration
      const endTime = calculateEndTime(meetingTime, meetingDuration);

      console.log(
        `Checking availability for teacher ${selectedTeacher} on ${meetingDate} from ${meetingTime} to ${endTime}`
      );

      // Make API call to check teacher availability
      const response = await axios.get(
        "http://localhost:3000/api/check_teacher_availability",
        {
          params: {
            teacher_id: selectedTeacher,
            date: meetingDate,
            start_time: meetingTime,
            end_time: endTime,
          },
        }
      );

      console.log("Teacher availability response:", response.data);

      if (response.data.success) {
        // Check if the selected teacher is in the available teachers list
        const teacherIsAvailable = response.data.availableTeachers.some(
          (teacher) =>
            teacher.teacher_id.toString() === selectedTeacher.toString()
        );

        setIsTeacherAvailable(teacherIsAvailable);

        if (!teacherIsAvailable) {
          setErrorMessage(
            "The selected teacher is not available at this time slot. Please select a different time."
          );
        }
      } else {
        setErrorMessage(
          response.data.message || "Failed to check teacher availability"
        );
        setIsTeacherAvailable(false);
      }
    } catch (error) {
      console.error("Error checking teacher availability:", error);
      setErrorMessage("Error checking teacher availability. Please try again.");
      setIsTeacherAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!selectedTeacher || !meetingDate || !meetingTime || !meetingPurpose) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    // Check if teacher is available
    if (isTeacherAvailable === false) {
      setErrorMessage(
        "The selected teacher is not available at this time slot. Please select a different time."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Calculate end time
      const endTime = calculateEndTime(meetingTime, meetingDuration);

      // Get user email from localStorage
      const userEmail = localStorage.getItem("userEmail");
      const isAuthenticated =
        localStorage.getItem("isAuthenticated") === "true";

      if (!isAuthenticated || !userEmail) {
        setErrorMessage(
          "You must be logged in to schedule a meeting. Please log in and try again."
        );
        setIsSubmitting(false);
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
        setErrorMessage(
          "Could not retrieve your user information. Please log in again."
        );
        setIsSubmitting(false);
        return;
      }

      const userId = userResponse.data.user.id;

      // Prepare meeting data
      const meetingData = {
        teacher_id: selectedTeacher,
        student_id: userId,
        meeting_date: meetingDate,
        start_time: meetingTime,
        end_time: endTime,
        duration: meetingDuration,
        purpose: meetingPurpose,
        status: "pending", // Default status
      };

      // Submit meeting request to API
      const response = await axios.post(
        "http://localhost:3000/api/schedule_teacher_meeting",
        meetingData
      );

      if (response.data.success) {
        setSuccessMessage(
          "Meeting request submitted successfully! Awaiting teacher confirmation."
        );
        // Reset form
        setSelectedTeacher("");
        setMeetingDate("");
        setMeetingTime("");
        setMeetingPurpose("");
        setIsTeacherAvailable(null);

        // Close panel after a delay
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setErrorMessage(
          response.data.message ||
            "Failed to schedule meeting. Please try again."
        );
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      setErrorMessage(
        "An error occurred while scheduling your meeting. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // If panel is not open, don't render anything
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
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <button
              onClick={handleClose}
              className="p-2 flex gap-1 text-blue-500 items-center text-sm font-medium"
            >
              <IoChevronBack /> Cancel
            </button>
            <h2 className="text-xl ml-10 font-semibold text-gray-800">
              Schedule Teacher Meeting
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Success and Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 flex items-start">
                <div className="w-2 h-2 mt-1.5 mr-2 bg-green-500 rounded-full"></div>
                <p>{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 flex items-start">
                <div className="w-2 h-2 mt-1.5 mr-2 bg-red-500 rounded-full"></div>
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Teacher Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <FaUser className="text-blue-500" />
                  Select Teacher
                </label>
                <div className="relative">
                  <select
                    id="teacher"
                    className="block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-700 transition-all duration-200"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    required
                    disabled={isLoadingTeachers}
                  >
                    <option value="">
                      {isLoadingTeachers
                        ? "Loading teachers..."
                        : "Select a teacher"}
                    </option>
                    {allTeachers && allTeachers.length > 0 ? (
                      allTeachers.map((teacher) => (
                        <option
                          key={teacher.teacher_id}
                          value={teacher.teacher_id}
                        >
                          {teacher.first_name} {teacher.last_name} -{" "}
                          {teacher.course || "No course"}
                        </option>
                      ))
                    ) : !isLoadingTeachers ? (
                      <option value="" disabled>
                        No teachers available
                      </option>
                    ) : null}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    {isLoadingTeachers ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
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
                    )}
                  </div>
                </div>

                {isLoadingTeachers && (
                  <div className="text-sm text-gray-500 mt-3 flex items-center p-2 bg-gray-100 rounded-md">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Loading teachers...</span>
                  </div>
                )}
              </div>

              {/* Selected Teacher Display */}
              {selectedTeacher && allTeachers.length > 0 && (
                <div className="mb-6 p-6 rounded-lg bg-blue-50 shadow-sm border border-blue-100">
                  <h3 className="font-medium mb-3 text-gray-700">
                    Selected Teacher
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <FaUser className="text-blue-500 text-2xl" />
                    </div>
                    <div>
                      {(() => {
                        const teacher = allTeachers.find(
                          (t) =>
                            t.teacher_id.toString() ===
                            selectedTeacher.toString()
                        );
                        return teacher ? (
                          <>
                            <p className="font-bold text-gray-900 text-lg">
                              {teacher.first_name} {teacher.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {teacher.course || "No course assigned"}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Teacher information not available
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <FaCalendarAlt className="text-blue-500" />
                  Date {meetingDate && `- ${formatDisplayDate(meetingDate)}`}
                </label>
                <div className="relative">
                  <div className="flex items-center rounded-md p-2 bg-gray-100 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                    <input
                      type="date"
                      className="flex-1 outline-none text-gray-800 bg-gray-100"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      disabled={!selectedTeacher}
                    />
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <FaClock className="text-blue-500" />
                    Start Time
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-md p-2 pr-10 appearance-none bg-gray-100 text-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      required
                      disabled={!selectedTeacher || !meetingDate}
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={`start-${time}`} value={time}>
                          {formatDisplayTime(time)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
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
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <FaClock className="text-blue-500" />
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-md p-2 pr-10 appearance-none bg-gray-100 text-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                      value={meetingDuration}
                      onChange={(e) => setMeetingDuration(e.target.value)}
                      required
                      disabled={
                        !selectedTeacher || !meetingDate || !meetingTime
                      }
                    >
                      {durationOptions.map((duration) => (
                        <option key={`duration-${duration}`} value={duration}>
                          {duration} minutes
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
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
                </div>
              </div>

              {/* Meeting Time Summary */}
              {meetingTime && meetingDuration && (
                <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">
                      Meeting will end at{" "}
                      <span className="font-medium">
                        {formatDisplayTime(
                          calculateEndTime(meetingTime, meetingDuration)
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Availability Status */}
              {isCheckingAvailability && (
                <div className="mb-6 text-sm text-gray-500 flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Checking teacher availability...</span>
                </div>
              )}

              {selectedTeacher &&
                meetingDate &&
                meetingTime &&
                !isCheckingAvailability &&
                (isTeacherAvailable === true ? (
                  <div className="mb-6 text-sm text-green-600 p-3 bg-green-50 rounded-md border border-green-100 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Teacher is available for this time slot!</span>
                  </div>
                ) : isTeacherAvailable === false ? (
                  <div className="mb-6 text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-100 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span>
                      Teacher is not available at this time slot. Please select
                      a different time.
                    </span>
                  </div>
                ) : null)}

              {/* Purpose */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <FaClipboardList className="text-blue-500" />
                  Meeting Purpose
                </label>
                <textarea
                  className="w-full rounded-md p-3 bg-gray-100 text-gray-800 min-h-[120px] hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Describe the purpose of your meeting with the teacher"
                  value={meetingPurpose}
                  onChange={(e) => setMeetingPurpose(e.target.value)}
                  required
                  disabled={
                    !selectedTeacher ||
                    !meetingDate ||
                    !meetingTime ||
                    isTeacherAvailable === false
                  }
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Please provide enough details for the teacher to prepare for
                  the meeting.
                </p>
              </div>

              {/* Meeting Summary - Shows when a teacher is selected and available */}
              {selectedTeacher &&
                meetingDate &&
                meetingTime &&
                isTeacherAvailable === true && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Meeting Summary
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Date:</span>{" "}
                        {formatDisplayDate(meetingDate)}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Time:</span>{" "}
                        {formatDisplayTime(meetingTime)} -{" "}
                        {formatDisplayTime(
                          calculateEndTime(meetingTime, meetingDuration)
                        )}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Duration:</span>{" "}
                        {meetingDuration} minutes
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Teacher:</span>{" "}
                        {(() => {
                          const teacher = allTeachers.find(
                            (t) =>
                              t.teacher_id.toString() ===
                              selectedTeacher.toString()
                          );
                          return teacher
                            ? `${teacher.first_name} ${teacher.last_name}`
                            : "Selected Teacher";
                        })()}
                      </p>
                    </div>
                  </div>
                )}

              {/* Submit Button */}
              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-gray-400 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-500 active:bg-gray-300 transition-colors focus:outline-none shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
                  disabled={
                    isSubmitting ||
                    !selectedTeacher ||
                    !meetingDate ||
                    !meetingTime ||
                    isCheckingAvailability ||
                    isTeacherAvailable === false
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
          </div>

          <div className="mt-4 p-4 border-t border-gray-200">
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
