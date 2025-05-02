import React, { useState, useEffect } from "react";
import { FaUserCheck, FaUserClock, FaUserTimes, FaFilter } from "react-icons/fa";
import { TbCalendarUser } from "react-icons/tb";
import { MdLocationOn, MdAccessTime } from "react-icons/md";
import axios from "axios";

const TeacherDashboardView = ({ teachers, loading, onScheduleMeeting }) => {
  const [teacherStatus, setTeacherStatus] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "available", "busy"
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch current schedules to determine teacher availability
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // Get current date and time
        const now = new Date();
        const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Fetch all schedules
        const response = await axios.get("http://localhost:3000/api/get_all_schedules");
        if (response.data && response.data.schedules) {
          setSchedules(response.data.schedules);
          
          // Calculate teacher status based on schedules
          const statusMap = {};
          
          teachers.forEach(teacher => {
            const teacherId = teacher.teacher_id;
            
            // Find current schedule for this teacher
            const currentSchedule = response.data.schedules.find(schedule => {
              if (schedule.teacher_id !== teacherId || schedule.day_of_week !== dayOfWeek) {
                return false;
              }
              
              // Parse schedule times
              const [startHour, startMinute] = schedule.start_time.split(":").map(Number);
              const [endHour, endMinute] = schedule.end_time.split(":").map(Number);
              
              // Convert to minutes for easier comparison
              const scheduleStart = startHour * 60 + startMinute;
              const scheduleEnd = endHour * 60 + endMinute;
              const currentTime = currentHour * 60 + currentMinute;
              
              // Check if current time falls within schedule
              return currentTime >= scheduleStart && currentTime < scheduleEnd;
            });
            
            if (currentSchedule) {
              statusMap[teacherId] = {
                status: "busy",
                location: currentSchedule.classroom_name || "Unknown Classroom",
                course: currentSchedule.course_name || "Class Session",
                startTime: currentSchedule.start_time,
                endTime: currentSchedule.end_time
              };
            } else {
              // Check if teacher has any meetings
              const hasMeeting = false; // This would require another API call to check meetings
              
              statusMap[teacherId] = {
                status: hasMeeting ? "busy" : "available",
                location: hasMeeting ? "Meeting Room" : teacher.assigned_academics ? 
                  `Academics ${String.fromCharCode(64 + parseInt(teacher.assigned_academics))}` : "Unknown",
                course: hasMeeting ? "Meeting" : "Available",
                startTime: hasMeeting ? "00:00" : null,
                endTime: hasMeeting ? "00:00" : null
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
    }
  }, [teachers]);

  // Filter teachers based on status
  const filteredTeachers = teachers.filter(teacher => {
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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-600";
      case "busy":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return <FaUserCheck className="text-green-500" />;
      case "busy":
        return <FaUserTimes className="text-red-500" />;
      default:
        return <FaUserClock className="text-gray-500" />;
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">TEACHER DASHBOARD</h2>
        
        {/* Filter dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm font-medium"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FaFilter className="text-gray-500" />
            Filter by Status
          </button>
          
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === "all" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
                  onClick={() => {
                    setStatusFilter("all");
                    setIsFilterOpen(false);
                  }}
                >
                  All Teachers
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === "available" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
                  onClick={() => {
                    setStatusFilter("available");
                    setIsFilterOpen(false);
                  }}
                >
                  Available
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === "busy" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
                  onClick={() => {
                    setStatusFilter("busy");
                    setIsFilterOpen(false);
                  }}
                >
                  Busy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => {
            const status = teacherStatus[teacher.teacher_id] || { 
              status: "unknown", 
              location: "Unknown", 
              course: "Unknown" 
            };
            
            return (
              <div 
                key={teacher.teacher_id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium">
                        {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {teacher.first_name} {teacher.last_name}
                        </h3>
                        <p className="text-sm text-blue-500">{teacher.course}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status.status)}`}>
                      {getStatusIcon(status.status)}
                      <span>{status.status === "available" ? "Available" : "Busy"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MdLocationOn className="text-gray-500" />
                      <span className="text-gray-700">Location:</span>
                      <span className="font-medium">{status.location}</span>
                    </div>
                    
                    {status.status === "busy" && status.startTime && status.endTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <MdAccessTime className="text-gray-500" />
                        <span className="text-gray-700">Current Activity:</span>
                        <span className="font-medium">
                          {status.course} ({formatTime(status.startTime)} - {formatTime(status.endTime)})
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-700">Academic Block:</span>
                      <span className="font-medium">
                        {teacher.assigned_academics ? 
                          `Academics ${String.fromCharCode(64 + parseInt(teacher.assigned_academics))}` : 
                          "Not Assigned"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-700">Department:</span>
                      <span className="font-medium">{teacher.department || "Not Specified"}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => onScheduleMeeting(teacher)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-md transition-colors"
                    >
                      <TbCalendarUser />
                      <span>Schedule Meeting</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!loading && filteredTeachers.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-lg">No teachers found with the selected filter</p>
          {statusFilter !== "all" && (
            <button 
              className="mt-2 text-blue-500 hover:text-blue-700"
              onClick={() => setStatusFilter("all")}
            >
              Show all teachers
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboardView;