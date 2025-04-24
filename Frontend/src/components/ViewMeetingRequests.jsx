import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, List } from "lucide-react";

import axios from "axios";
import {
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaUser,
} from "react-icons/fa";
import { MdOutlineDescription } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoGrid, IoList } from "react-icons/io5";

const ViewMeetingRequests = () => {
  const [meetingRequests, setMeetingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchMeetingRequests = async () => {
      try {
        setLoading(true);

        // Get user ID from localStorage
        const userEmail = localStorage.getItem("userEmail");
        const isAuthenticated =
          localStorage.getItem("isAuthenticated") === "true";

        if (!isAuthenticated || !userEmail) {
          setError("You must be logged in to view meeting requests");
          setLoading(false);
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
          setError(
            "Could not retrieve your user information. Please log in again."
          );
          setLoading(false);
          return;
        }

        const userId = userResponse.data.user.id;
        console.log("Fetching meeting requests for teacher ID:", userId);

        // Now fetch meeting requests for this teacher
        const response = await axios.get(
          "http://localhost:3000/api/get_teacher_meeting_requests",
          {
            params: { teacher_id: userId },
          }
        );

        if (response.data.success) {
          console.log(
            "Meeting requests received:",
            response.data.meeting_requests
          );
          setMeetingRequests(response.data.meeting_requests || []);
        } else {
          console.error("API returned error:", response.data.message);
          setError(
            `Failed to fetch meeting requests: ${response.data.message}`
          );
        }
      } catch (err) {
        console.error("Error fetching meeting requests:", err);
        setError(`An error occurred: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingRequests();
  }, [refreshTrigger]);

  const handleUpdateStatus = async (meetingId, status) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/update_meeting_request_status",
        {
          meeting_id: meetingId,
          status: status,
        }
      );

      if (response.data.success) {
        // Refresh the list after successful update
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert(`Failed to ${status} meeting: ${response.data.message}`);
      }
    } catch (err) {
      console.error(`Error ${status}ing meeting:`, err);
      alert(`An error occurred while ${status}ing the meeting`);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Filter meeting requests based on active tab
  const filteredRequests = meetingRequests.filter((request) => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  // Count requests by status
  const pendingCount = meetingRequests.filter(
    (req) => req.status === "pending"
  ).length;
  const approvedCount = meetingRequests.filter(
    (req) => req.status === "approved"
  ).length;
  const rejectedCount = meetingRequests.filter(
    (req) => req.status === "rejected"
  ).length;

  if (loading) {
    return (
      <div className="h-screen w-[82vw] overflow-auto pl-4 flex items-center justify-center bg-[#f5f5f7]">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-1"></div>
          <p className="text-gray-600 text-sm">Loading meeting requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-[82vw] overflow-auto pl-4 flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-1">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const renderMeetingCard = (request) => (
    <div
      key={request.id}
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#e6e6e6] transition-all hover:shadow-md max-w-sm h-full"
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg ">
              <img src="/src/assets/Profile.png" alt="" width={40} />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#1d1d1f]">
                {request.student_first_name} {request.student_last_name}
              </h3>
              <p className="text-xs text-[#86868b]">{request.student_email}</p>
            </div>
          </div>
          <div
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              request.status === "pending"
                ? "bg-[#fff8e6] text-[#ff9500]"
                : request.status === "approved"
                ? "bg-[#e4f9e5] text-[#34c759]"
                : "bg-[#ffeaec] text-[#ff3b30]"
            }`}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#f2f2f7] flex items-center justify-center">
              <FaCalendarAlt className="text-[#007aff] text-xs" />
            </div>
            <div>
              <p className="text-xs text-[#86868b]">Date</p>
              <p className="font-medium text-[#1d1d1f]">
                {formatDate(request.meeting_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#f2f2f7] flex items-center justify-center">
              <FaClock className="text-[#007aff] text-xs" />
            </div>
            <div>
              <p className="text-xs text-[#86868b]">Time</p>
              <p className="font-medium text-[#1d1d1f]">
                {formatTime(request.start_time)} -{" "}
                {formatTime(request.end_time)}
              </p>
            </div>
          </div>
        </div>

        {/* Enlarged purpose section with more height */}
        <div className="mb-3 p-3 rounded-lg flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#f2f2f7] flex items-center justify-center">
              <MdOutlineDescription className="text-[#007aff] text-xs" />
            </div>
            <p className="text-xs font-medium text-[#86868b]">Purpose</p>
          </div>
          <p className="text-sm pl-8 text-[#1d1d1f] line-clamp-4">
            {request.purpose}
          </p>
        </div>

        {request.status === "pending" && (
          <div className="flex justify-end gap-2 mt-auto">
            <button
              onClick={() => handleUpdateStatus(request.id, "rejected")}
              className="px-3 py-1.5 bg-white border border-[#e6e6e6] text-[#1d1d1f] rounded-full text-xs font-medium flex items-center gap-1 hover:bg-[#f5f5f7] transition-colors"
            >
              <FaTimes className="text-[#ff3b30] text-xs" />
              Decline
            </button>
            <button
              onClick={() => handleUpdateStatus(request.id, "approved")}
              className="px-3 py-1.5 bg-[#007aff] text-white rounded-full text-xs font-medium flex items-center gap-1 hover:bg-[#0071e3] transition-colors"
            >
              <FaCheck className="text-xs" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-[82vw] pl-4 overflow-auto">
      <div className="w-full px-4 py-4">
        {/* Header with view toggle */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex py-1 gap-1 items-center">
            <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
              MEETING REQUESTS
            </h1>
            <IoMdInformationCircleOutline className="text-2xl" />
          </div>

          {/* View toggle buttons - updated to match Requests.jsx style */}
          <div className="flex bg-[#f2f2f7] rounded-full p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-blue-500"
                  : "text-gray-500 hover:bg-white/30"
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <IoGrid className="text-lg" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-blue-500"
                  : "text-gray-500 hover:bg-white/30"
              }`}
              aria-label="List view"
              title="List view"
            >
              <IoList className="text-lg" />
            </button>
          </div>
        </div>

        {/* Main content area with status bar and grid side by side */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status tabs - vertical layout for desktop */}
          <div className="md:w-48 flex-shrink-0">
            <div className="flex flex-col bg-[#f4f4f7] rounded-xl p-1.5 shadow-inner">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-1.5 justify-start px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-1 ${
                  activeTab === "all"
                    ? "bg-white shadow-sm text-[#007aff]"
                    : "text-[#7d7d85] hover:bg-white/30 hover:text-[#007aff]/70"
                }`}
              >
                <List size={14} />
                <span className="relative">
                  All
                  <span className="ml-1 inline-flex items-center justify-center bg-[#007aff]/10 text-[#007aff] text-xs font-semibold rounded-full h-4 min-w-4 px-1">
                    {meetingRequests.length}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-1.5 justify-start px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-1 ${
                  activeTab === "pending"
                    ? "bg-white shadow-sm text-[#ff9500]"
                    : "text-[#7d7d85] hover:bg-white/30 hover:text-[#ff9500]/70"
                }`}
              >
                <Clock size={14} />
                <span className="relative">
                  Pending
                  <span
                    className={`ml-1 inline-flex items-center justify-center ${
                      pendingCount > 0
                        ? "bg-[#ff9500]/10 text-[#ff9500]"
                        : "bg-gray-100 text-gray-400"
                    } text-xs font-semibold rounded-full h-4 min-w-4 px-1`}
                  >
                    {pendingCount}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`flex items-center gap-1.5 justify-start px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-1 ${
                  activeTab === "approved"
                    ? "bg-white shadow-sm text-[#34c759]"
                    : "text-[#7d7d85] hover:bg-white/30 hover:text-[#34c759]/70"
                }`}
              >
                <CheckCircle size={14} />
                <span className="relative">
                  Approved
                  <span
                    className={`ml-1 inline-flex items-center justify-center ${
                      approvedCount > 0
                        ? "bg-[#34c759]/10 text-[#34c759]"
                        : "bg-gray-100 text-gray-400"
                    } text-xs font-semibold rounded-full h-4 min-w-4 px-1`}
                  >
                    {approvedCount}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("rejected")}
                className={`flex items-center gap-1.5 justify-start px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "rejected"
                    ? "bg-white shadow-sm text-[#ff3b30]"
                    : "text-[#7d7d85] hover:bg-white/30 hover:text-[#ff3b30]/70"
                }`}
              >
                <XCircle size={14} />
                <span className="relative">
                  Rejected
                  <span
                    className={`ml-1 inline-flex items-center justify-center ${
                      rejectedCount > 0
                        ? "bg-[#ff3b30]/10 text-[#ff3b30]"
                        : "bg-gray-100 text-gray-400"
                    } text-xs font-semibold rounded-full h-4 min-w-4 px-1`}
                  >
                    {rejectedCount}
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1">
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-3">
                  <FaCalendarAlt className="text-[#86868b] text-lg" />
                </div>
                <h3 className="text-lg font-medium text-[#1d1d1f] mb-1">
                  No {activeTab !== "all" ? activeTab : ""} Meeting Requests
                </h3>
                <p className="text-[#86868b] text-sm max-w-md mx-auto">
                  {activeTab === "all"
                    ? "You don't have any meeting requests at this time."
                    : activeTab === "pending"
                    ? "You don't have any pending meeting requests to review."
                    : activeTab === "approved"
                    ? "You haven't approved any meeting requests yet."
                    : "You haven't rejected any meeting requests yet."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              // Grid View - adjusted columns and sizing
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {filteredRequests.map((request) => renderMeetingCard(request))}
              </div>
            ) : (
              // List View
              <div className="space-y-2">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#e6e6e6] transition-all hover:shadow-md"
                  >
                    <div className="p-3">
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
                        <div className="flex items-center gap-3 w-full md:w-auto mb-2 md:mb-0">
                          <div className="p-2 bg-[#f2f2f7] rounded-lg">
                            <FaUser className="text-[#007aff] text-base" />
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-[#1d1d1f]">
                              {request.student_first_name}{" "}
                              {request.student_last_name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[#86868b]">
                              <span>{request.student_email}</span>
                              <span>•</span>
                              <span>{formatDate(request.meeting_date)}</span>
                              <span>•</span>
                              <span>
                                {formatTime(request.start_time)} -{" "}
                                {formatTime(request.end_time)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              request.status === "pending"
                                ? "bg-[#fff8e6] text-[#ff9500]"
                                : request.status === "approved"
                                ? "bg-[#e4f9e5] text-[#34c759]"
                                : "bg-[#ffeaec] text-[#ff3b30]"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </div>
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(request.id, "rejected")
                                }
                                className="px-3 py-1.5 bg-white border border-[#e6e6e6] text-[#1d1d1f] rounded-full text-xs font-medium flex items-center gap-1 hover:bg-[#f5f5f7] transition-colors"
                              >
                                <FaTimes className="text-[#ff3b30] text-xs" />
                                Decline
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(request.id, "approved")
                                }
                                className="px-3 py-1.5 bg-[#007aff] text-white rounded-full text-xs font-medium flex items-center gap-1 hover:bg-[#0071e3] transition-colors"
                              >
                                <FaCheck className="text-xs" />
                                Approve
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Enlarged purpose section in list view */}
                      <div className="mt-2 bg-[#f9f9fb] p-2 rounded-lg">
                        <span className="font-medium text-[#1d1d1f]">
                          Purpose:{" "}
                        </span>
                        <span className="text-[#1d1d1f]">
                          {request.purpose}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMeetingRequests;
