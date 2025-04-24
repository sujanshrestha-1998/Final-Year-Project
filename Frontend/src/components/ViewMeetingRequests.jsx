import React, { useState, useEffect } from "react";
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
      <div className="h-screen w-[82vw] overflow-auto pl-6 flex items-center justify-center bg-[#f5f5f7]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-[#007aff] rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600 text-sm font-medium">
            Loading meeting requests...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-[82vw] overflow-auto pl-6 flex items-center justify-center bg-[#f5f5f7]">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md text-center">
          <div className="w-12 h-12 bg-[#ffeaec] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-[#ff3b30] text-lg" />
          </div>
          <p className="text-lg font-semibold text-[#1d1d1f] mb-2">Error</p>
          <p className="text-[#86868b]">{error}</p>
        </div>
      </div>
    );
  }

  const renderMeetingCard = (request) => (
    <div
      key={request.id}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#e6e6e6] transition-all hover:shadow-md"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#f2f2f7] rounded-lg">
              <FaUser className="text-[#007aff] text-base" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#1d1d1f]">
                {request.student_first_name} {request.student_last_name}
              </h3>
              <p className="text-xs text-[#86868b]">{request.student_email}</p>
            </div>
          </div>
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
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

        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#f2f2f7] flex items-center justify-center">
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
            <div className="w-7 h-7 rounded-full bg-[#f2f2f7] flex items-center justify-center">
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

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-[#f2f2f7] flex items-center justify-center">
              <MdOutlineDescription className="text-[#007aff] text-xs" />
            </div>
            <p className="text-xs text-[#86868b]">Purpose</p>
          </div>
          <p className="text-sm pl-9 text-[#1d1d1f]">{request.purpose}</p>
        </div>

        {request.status === "pending" && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleUpdateStatus(request.id, "approved")}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#e4f9e5] text-[#34c759] py-2.5 rounded-lg text-sm font-medium hover:bg-[#d0f5d1] transition-colors"
            >
              <FaCheck size={12} />
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus(request.id, "rejected")}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#ffeaec] text-[#ff3b30] py-2.5 rounded-lg text-sm font-medium hover:bg-[#ffd5d9] transition-colors"
            >
              <FaTimes size={12} />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-[82vw] pl-6 overflow-auto bg-[#f5f5f7]">
      <div className="w-full px-6 py-6">
        {/* Header with view toggle */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex py-1 gap-1.5 items-center">
            <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
              Meeting Requests
            </h1>
            <IoMdInformationCircleOutline className="text-2xl text-[#86868b]" />
          </div>

          {/* View toggle buttons */}
          <div className="flex bg-[#e5e5ea] rounded-full p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-[#007aff]"
                  : "text-[#86868b] hover:bg-white/30"
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <IoGrid className="text-lg" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-[#007aff]"
                  : "text-[#86868b] hover:bg-white/30"
              }`}
              aria-label="List view"
              title="List view"
            >
              <IoList className="text-lg" />
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="mb-6">
          <div className="flex bg-[#e5e5ea] rounded-xl p-1 max-w-xl">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-white shadow-sm text-[#007aff]"
                  : "text-[#86868b] hover:bg-white/30"
              }`}
            >
              All ({meetingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-white shadow-sm text-[#ff9500]"
                  : "text-[#86868b] hover:bg-white/30"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "approved"
                  ? "bg-white shadow-sm text-[#34c759]"
                  : "text-[#86868b] hover:bg-white/30"
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "rejected"
                  ? "bg-white shadow-sm text-[#ff3b30]"
                  : "text-[#86868b] hover:bg-white/30"
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-[#86868b] text-xl" />
              </div>
              <h3 className="text-xl font-medium text-[#1d1d1f] mb-2">
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
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => renderMeetingCard(request))}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-[#e5e5ea]">
                <thead className="bg-[#f5f5f7]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider"
                    >
                      Student
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider"
                    >
                      Date & Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider"
                    >
                      Purpose
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e5e5ea]">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-[#f9f9fb] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-9 w-9 bg-[#f2f2f7] rounded-full flex items-center justify-center">
                            <FaUser className="text-[#007aff] text-sm" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#1d1d1f]">
                              {request.student_first_name}{" "}
                              {request.student_last_name}
                            </div>
                            <div className="text-sm text-[#86868b]">
                              {request.student_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#1d1d1f]">
                          {formatDate(request.meeting_date)}
                        </div>
                        <div className="text-sm text-[#86868b]">
                          {formatTime(request.start_time)} -{" "}
                          {formatTime(request.end_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#1d1d1f] max-w-xs truncate">
                          {request.purpose}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                            request.status === "pending"
                              ? "bg-[#fff8e6] text-[#ff9500]"
                              : request.status === "approved"
                              ? "bg-[#e4f9e5] text-[#34c759]"
                              : "bg-[#ffeaec] text-[#ff3b30]"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === "pending" && (
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleUpdateStatus(request.id, "approved")
                              }
                              className="text-[#34c759] hover:text-[#2eb350] font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(request.id, "rejected")
                              }
                              className="text-[#ff3b30] hover:text-[#e0352b] font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMeetingRequests;
