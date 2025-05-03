import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoSearch } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {
  FaUserCheck,
  FaUserTimes,
  FaFilter,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { TbCalendarUser } from "react-icons/tb";
import { MdLocationOn, MdAccessTime } from "react-icons/md";
import TeacherMeetingPanel from "./TeacherMeetingPanel";

const TeacherView = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherStatus, setTeacherStatus] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "available", "busy"
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isMeetingPanelOpen, setIsMeetingPanelOpen] = useState(false);
  const [meetings, setMeetings] = useState([]);

  // Fetch teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:3000/api/teacher_details"
        );
        if (response.data && response.data.teachers) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch current schedules to determine teacher availability
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // Get current date and time
        const now = new Date();
        const dayOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Fetch all schedules
        const response = await axios.get(
          "http://localhost:3000/api/get_all_schedules"
        );
        if (response.data && response.data.schedules) {
          setSchedules(response.data.schedules);

          // Fetch all teacher meetings
          const meetingsResponse = await axios.get(
            "http://localhost:3000/api/get_all_teacher_meetings"
          );

          const teacherMeetings =
            meetingsResponse.data && meetingsResponse.data.meetings
              ? meetingsResponse.data.meetings.filter(
                  (m) => m.status === "approved"
                )
              : [];

          setMeetings(teacherMeetings);

          // Calculate teacher status based on schedules and meetings
          const statusMap = {};

          teachers.forEach((teacher) => {
            const teacherId = teacher.teacher_id;

            // Find current schedule for this teacher
            const currentSchedule = response.data.schedules.find((schedule) => {
              if (
                schedule.teacher_id !== teacherId ||
                schedule.day_of_week !== dayOfWeek
              ) {
                return false;
              }

              // Parse schedule times
              const [startHour, startMinute] = schedule.start_time
                .split(":")
                .map(Number);
              const [endHour, endMinute] = schedule.end_time
                .split(":")
                .map(Number);

              // Convert to minutes for easier comparison
              const scheduleStart = startHour * 60 + startMinute;
              const scheduleEnd = endHour * 60 + endMinute;
              const currentTime = currentHour * 60 + currentMinute;

              // Check if current time falls within schedule
              return currentTime >= scheduleStart && currentTime < scheduleEnd;
            });

            // Find current meeting for this teacher
            const currentMeeting = teacherMeetings.find((meeting) => {
              if (meeting.teacher_id !== teacherId) {
                return false;
              }

              // Check if meeting is today
              const meetingDate = new Date(meeting.meeting_date);
              const today = new Date();
              if (meetingDate.toDateString() !== today.toDateString()) {
                return false;
              }

              // Parse meeting times
              const [startHour, startMinute] = meeting.start_time
                .split(":")
                .map(Number);
              const [endHour, endMinute] = meeting.end_time
                .split(":")
                .map(Number);

              // Convert to minutes for easier comparison
              const meetingStart = startHour * 60 + startMinute;
              const meetingEnd = endHour * 60 + endMinute;
              const currentTime = currentHour * 60 + currentMinute;

              // Check if current time falls within meeting
              return currentTime >= meetingStart && currentTime < meetingEnd;
            });

            if (currentSchedule) {
              statusMap[teacherId] = {
                status: "busy",
                activity: "class",
                location: currentSchedule.classroom_name || "Unknown Classroom",
                course: currentSchedule.course_name || "Class Session",
                startTime: currentSchedule.start_time,
                endTime: currentSchedule.end_time,
              };
            } else if (currentMeeting) {
              statusMap[teacherId] = {
                status: "busy",
                activity: "meeting",
                location: "Meeting Room",
                course: "Student Meeting",
                startTime: currentMeeting.start_time,
                endTime: currentMeeting.end_time,
              };
            } else {
              statusMap[teacherId] = {
                status: "available",
                location: teacher.assigned_academics
                  ? `Academics ${String.fromCharCode(
                      64 + parseInt(teacher.assigned_academics)
                    )}`
                  : "Unknown",
                course: "Available",
                startTime: null,
                endTime: null,
              };
            }
          });

          setTeacherStatus(statusMap);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    if (teachers.length > 0) {
      fetchSchedules();

      // Set up interval to refresh status every minute
      const intervalId = setInterval(fetchSchedules, 60000);

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [teachers]);

  // Filter teachers based on search query and status
  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      (teacher.course &&
        teacher.course.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    const status = teacherStatus[teacher.teacher_id]?.status || "unknown";
    return statusFilter === status;
  });

  // Format time from "HH:MM:SS" to "HH:MM AM/PM"
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get status badge color - updated for Apple-inspired design
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-50 text-green-600 border border-green-200";
      case "busy":
        return "bg-red-50 text-red-600 border border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status, activity) => {
    switch (status) {
      case "available":
        return <FaUserCheck className="text-green-500" />;
      case "busy":
        return activity === "class" ? (
          <FaChalkboardTeacher className="text-red-500" />
        ) : (
          <FaUserTimes className="text-red-500" />
        );
      default:
        return <FaUserCheck className="text-gray-500" />;
    }
  };

  const handleScheduleMeeting = (teacher) => {
    setSelectedTeacher(teacher);
    setIsMeetingPanelOpen(true);
  };

  return (
    <div className="h-screen w-[82vw] overflow-hidden p-4">
      {/* Header with search and filter */}

      <div className="flex justify-between full items-center mb-8">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-2xl text-black">
              TEACHERS DIRECTORY
            </h1>
            <IoMdInformationCircleOutline className="text-2xl" />
          </div>
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or subject"
              className="w-80 pl-8 pr-4 py-1 bg-gray-200 rounded-md 
              text-[14px] border-none 
              transition-all duration-200 placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Circular toggle button for Available Only */}
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow
              ${
                statusFilter === "available"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            onClick={() =>
              setStatusFilter(
                statusFilter === "available" ? "all" : "available"
              )
            }
            title={
              statusFilter === "available"
                ? "Show All Teachers"
                : "Show Available Only"
            }
          >
            <FaUserCheck className="text-lg" />
          </button>
        </div>
      </div>

      {/* Status summary cards - Apple-style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Teachers</p>
              <p className="text-3xl font-medium text-gray-900">
                {teachers.length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-full">
              <FaChalkboardTeacher className="text-blue-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Available</p>
              <p className="text-3xl font-medium text-gray-900">
                {
                  Object.values(teacherStatus).filter(
                    (s) => s.status === "available"
                  ).length
                }
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-full">
              <FaUserCheck className="text-green-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Busy</p>
              <p className="text-3xl font-medium text-gray-900">
                {
                  Object.values(teacherStatus).filter(
                    (s) => s.status === "busy"
                  ).length
                }
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-full">
              <FaUserTimes className="text-red-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Teacher cards grid - Apple-style */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <FaChalkboardTeacher className="text-gray-300 text-5xl mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-800 mb-3">
            No Teachers Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "There are no teachers matching the selected filter"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => {
            const status = teacherStatus[teacher.teacher_id] || {
              status: "unknown",
              location: "Unknown",
              course: "",
              startTime: null,
              endTime: null,
            };

            return (
              <div
                key={teacher.teacher_id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-lg shadow-sm group-hover:shadow transition-all">
                        {teacher.first_name.charAt(0)}
                        {teacher.last_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-gray-900">
                          {teacher.first_name} {teacher.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {teacher.course || "No course assigned"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        status.status
                      )}`}
                    >
                      {status.status.charAt(0).toUpperCase() +
                        status.status.slice(1)}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <MdLocationOn className="text-gray-400" />
                      <span className="text-gray-600">{status.location}</span>
                    </div>

                    {status.status === "busy" && (
                      <div className="flex items-center gap-2 text-sm">
                        <MdAccessTime className="text-gray-400" />
                        <span className="text-gray-600">
                          {formatTime(status.startTime)} -{" "}
                          {formatTime(status.endTime)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon(status.status, status.activity)}
                      <span className="text-gray-600">
                        {status.status === "busy"
                          ? `Currently in ${
                              status.activity === "class"
                                ? "class"
                                : "a meeting"
                            }`
                          : "Available for meetings"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleScheduleMeeting(teacher)}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200
                      ${
                        status.status === "available"
                          ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={status.status !== "available"}
                  >
                    <TbCalendarUser />
                    Schedule Meeting
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Meeting scheduling panel */}
      <TeacherMeetingPanel
        isOpen={isMeetingPanelOpen}
        onClose={() => setIsMeetingPanelOpen(false)}
        teachers={selectedTeacher ? [selectedTeacher] : []}
      />
    </div>
  );
};

export default TeacherView;
