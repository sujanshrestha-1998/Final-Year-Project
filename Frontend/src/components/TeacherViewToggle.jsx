import React, { useState, useEffect } from "react";
import { FaMapMarkedAlt, FaTable } from "react-icons/fa";
import axios from "axios";
import Teacher from "./Teacher";
import TeacherDashboardView from "./TeacherDashboardView";

const TeacherViewToggle = () => {
  const [viewMode, setViewMode] = useState("map"); // "map" or "dashboard"
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isMeetingPanelOpen, setIsMeetingPanelOpen] = useState(false);

  useEffect(() => {
    // Fetch teachers data
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/teacher_details");
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

  const handleScheduleMeeting = (teacher) => {
    setSelectedTeacher(teacher);
    setIsMeetingPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with view toggle */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Teacher Locator</h1>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === "map" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setViewMode("map")}
              >
                <div className="flex items-center gap-2">
                  <FaMapMarkedAlt />
                  <span>Map View</span>
                </div>
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === "dashboard" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setViewMode("dashboard")}
              >
                <div className="flex items-center gap-2">
                  <FaTable />
                  <span>Dashboard View</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === "map" ? (
          <Teacher 
            onScheduleMeeting={handleScheduleMeeting} 
            isMeetingPanelOpen={isMeetingPanelOpen}
            setIsMeetingPanelOpen={setIsMeetingPanelOpen}
            selectedTeacher={selectedTeacher}
          />
        ) : (
          <TeacherDashboardView 
            teachers={teachers} 
            loading={loading} 
            onScheduleMeeting={handleScheduleMeeting} 
          />
        )}
      </div>
    </div>
  );
};

export default TeacherViewToggle;