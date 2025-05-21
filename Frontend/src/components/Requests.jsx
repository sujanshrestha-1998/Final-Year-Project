import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import { BsCalendar2EventFill, BsPersonWorkspace } from "react-icons/bs";
import { BiTime } from "react-icons/bi";
import { MdOutlineDescription, MdPeople } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {
  PiProjectorScreenDuotone,
  PiChalkboardTeacherDuotone,
} from "react-icons/pi";
import { IoGrid, IoList } from "react-icons/io5";
import { FaExclamationTriangle, FaClock } from "react-icons/fa";
import { CheckCircle, XCircle, Clock, List } from "lucide-react";

const Requests = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [conflictingRequests, setConflictingRequests] = useState({});
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/get_all_reservations"
        );

        if (response.data.success) {
          const requests = response.data.reservations;
          setReservations(requests);

          // Identify conflicting requests
          const conflicts = findConflictingRequests(requests);
          setConflictingRequests(conflicts);
        } else {
          setError("Failed to fetch reservation requests");
        }
      } catch (err) {
        console.error("Error fetching reservation requests:", err);
        setError("An error occurred while fetching reservation requests");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [refreshTrigger]);

  // Function to find conflicting requests (same classroom, date and overlapping times)
  const findConflictingRequests = (requests) => {
    const conflicts = {};

    // Group requests by classroom and date
    const requestsByClassroomAndDate = {};

    requests.forEach((request) => {
      const key = `${request.classroom_id}_${request.reservation_date}`;
      if (!requestsByClassroomAndDate[key]) {
        requestsByClassroomAndDate[key] = [];
      }
      requestsByClassroomAndDate[key].push(request);
    });

    // Check for time overlaps within each group
    Object.keys(requestsByClassroomAndDate).forEach((key) => {
      const groupRequests = requestsByClassroomAndDate[key];

      if (groupRequests.length > 1) {
        // Check each pair of requests for time overlap
        for (let i = 0; i < groupRequests.length; i++) {
          for (let j = i + 1; j < groupRequests.length; j++) {
            const req1 = groupRequests[i];
            const req2 = groupRequests[j];

            // Convert times to minutes for easier comparison
            const req1Start = timeToMinutes(req1.start_time);
            const req1End = timeToMinutes(req1.end_time);
            const req2Start = timeToMinutes(req2.start_time);
            const req2End = timeToMinutes(req2.end_time);

            // Check for overlap
            if (req1Start < req2End && req1End > req2Start) {
              // Determine which request has priority (earlier created_at)
              const req1Date = new Date(req1.created_at);
              const req2Date = new Date(req2.created_at);
              const priorityRequest = req1Date < req2Date ? req1 : req2;

              // Store conflict information
              if (!conflicts[req1.id]) conflicts[req1.id] = [];
              if (!conflicts[req2.id]) conflicts[req2.id] = [];

              conflicts[req1.id].push({
                conflictsWith: req2.id,
                hasPriority: priorityRequest.id === req1.id,
                timeDifference: Math.abs(req1Date - req2Date),
                priorityRequestTime: formatDateTime(priorityRequest.created_at),
              });

              conflicts[req2.id].push({
                conflictsWith: req1.id,
                hasPriority: priorityRequest.id === req2.id,
                timeDifference: Math.abs(req1Date - req2Date),
                priorityRequestTime: formatDateTime(priorityRequest.created_at),
              });
            }
          }
        }
      }
    });

    return conflicts;
  };

  // Helper function to convert time string (HH:MM:SS) to minutes
  const timeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Format date and time for display
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleUpdateStatus = async (reservationId, status) => {
    try {
      // If we're approving a request, we need to handle conflicts
      if (status === "approved" && conflictingRequests[reservationId]) {
        // Get the IDs of all conflicting requests
        const conflictingIds = conflictingRequests[reservationId].map(
          (conflict) => conflict.conflictsWith
        );

        // First, approve the current request
        const approveResponse = await axios.post(
          "http://localhost:3000/api/update_reservation_status",
          {
            reservation_id: reservationId,
            status: "approved",
          }
        );

        if (!approveResponse.data.success) {
          alert(
            `Failed to approve reservation: ${approveResponse.data.message}`
          );
          return;
        }

        // Then, automatically decline all conflicting requests
        const declinePromises = conflictingIds.map((conflictId) =>
          axios.post("http://localhost:3000/api/update_reservation_status", {
            reservation_id: conflictId,
            status: "rejected",
            auto_rejected: true, // Optional flag to indicate this was auto-rejected
          })
        );

        // Wait for all decline operations to complete
        await Promise.all(declinePromises);

        // Show success message
        alert(
          "Reservation approved and conflicting requests automatically declined."
        );

        // Refresh the list
        setRefreshTrigger((prev) => prev + 1);
      } else {
        // Regular status update for non-approval or non-conflicting requests
        const response = await axios.post(
          "http://localhost:3000/api/update_reservation_status",
          {
            reservation_id: reservationId,
            status: status,
          }
        );

        if (response.data.success) {
          // Refresh the list after successful update
          setRefreshTrigger((prev) => prev + 1);
        } else {
          alert(`Failed to ${status} reservation: ${response.data.message}`);
        }
      }
    } catch (err) {
      console.error(`Error ${status}ing reservation:`, err);
      alert(`An error occurred while ${status}ing the reservation`);
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

  // Function to get time difference in human-readable format
  const getTimeDifference = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} earlier`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} earlier`;
    } else {
      return `${seconds} second${seconds > 1 ? "s" : ""} earlier`;
    }
  };

  // Filter reservations based on active tab
  const filteredReservations = reservations.filter((request) => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  // Count requests by status
  const pendingCount = reservations.filter(
    (req) => req.status === "pending"
  ).length;
  const approvedCount = reservations.filter(
    (req) => req.status === "approved"
  ).length;
  const rejectedCount = reservations.filter(
    (req) => req.status === "rejected"
  ).length;

  if (loading) {
    return (
      <div className="h-screen w-[82vw] overflow-auto pl-4 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-1"></div>
          <p className="text-gray-600 text-sm">
            Loading reservation requests...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-[82vw] overflow-auto pl-4 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-1">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-[82vw] pl-4 overflow-auto">
      <div className="w-full px-4 py-4">
        {/* Header with view toggle */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex py-1 gap-1 items-center">
            <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
              RESERVATION REQUESTS
            </h1>
            <IoMdInformationCircleOutline className="text-2xl" />
          </div>

          {/* View toggle buttons */}
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
                    {reservations.length}
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
            {filteredReservations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-3">
                  <PiProjectorScreenDuotone className="text-[#86868b] text-lg" />
                </div>
                <h3 className="text-lg font-medium text-[#1d1d1f] mb-1">
                  No {activeTab !== "all" ? activeTab : ""} Reservation Requests
                </h3>
                <p className="text-[#86868b] text-sm max-w-md mx-auto">
                  {activeTab === "all"
                    ? "There are no classroom reservation requests at this time."
                    : activeTab === "pending"
                    ? "There are no pending classroom reservation requests to review."
                    : activeTab === "approved"
                    ? "There are no approved classroom reservations."
                    : "There are no rejected classroom reservations."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredReservations.map((request) => (
                  <div
                    key={request.id}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden border ${
                      request.status === "pending" &&
                      conflictingRequests[request.id]
                        ? "border-amber-300"
                        : "border-[#e6e6e6]"
                    } transition-all hover:shadow-md`}
                  >
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-2">
                          <div className="p-2 bg-[#f2f2f7] rounded-lg">
                            <PiProjectorScreenDuotone className="text-[#007aff] text-base" />
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-[#1d1d1f]">
                              {request.classroom_name}
                            </h3>
                            <p className="text-xs text-[#86868b]">
                              Requested by {request.user_name}
                            </p>
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
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </div>
                      </div>

                      {/* Conflict Warning - only show for pending requests */}
                      {request.status === "pending" &&
                        conflictingRequests[request.id] && (
                          <div
                            className={`mb-3 p-2 rounded-md ${
                              conflictingRequests[request.id][0].hasPriority
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <div className="flex items-center gap-1 text-xs font-medium">
                              {conflictingRequests[request.id][0]
                                .hasPriority ? (
                                <>
                                  <FaCheck className="text-green-500" />
                                  <span>This request has priority</span>
                                </>
                              ) : (
                                <>
                                  <FaExclamationTriangle className="text-amber-500" />
                                  <span>Conflicts with another request</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs mt-1">
                              <FaClock className="text-gray-500" />
                              <span>
                                {conflictingRequests[request.id][0].hasPriority
                                  ? `Requested ${getTimeDifference(
                                      conflictingRequests[request.id][0]
                                        .timeDifference
                                    )} than conflicting request`
                                  : `Priority to request from ${
                                      conflictingRequests[request.id][0]
                                        .priorityRequestTime
                                    }`}
                              </span>
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#f2f2f7] flex items-center justify-center">
                            <BsCalendar2EventFill className="text-[#007aff] text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-[#86868b]">Date</p>
                            <p className="font-medium text-[#1d1d1f]">
                              {formatDate(request.reservation_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#f2f2f7] flex items-center justify-center">
                            <BiTime className="text-[#007aff] text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-[#86868b]">Time</p>
                            <p className="font-medium text-[#1d1d1f]">
                              {formatTime(request.start_time)} -{" "}
                              {formatTime(request.end_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#f2f2f7] flex items-center justify-center">
                            <MdOutlineDescription className="text-[#007aff] text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-[#86868b]">Purpose</p>
                            <p className="font-medium text-[#1d1d1f]">
                              {request.purpose}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#f2f2f7] flex items-center justify-center">
                            <MdPeople className="text-[#007aff] text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-[#86868b]">Attendees</p>
                            <p className="font-medium text-[#1d1d1f]">
                              {request.attendees || "Not specified"}
                            </p>
                          </div>
                        </div>
                        {/* Requested Time */}
                        <div className="flex items-center gap-2 col-span-2 mt-1">
                          <div className="w-6 h-6 rounded-full bg-[#f2f2f7] flex items-center justify-center">
                            <FaClock className="text-[#007aff] text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-[#86868b]">
                              Requested On
                            </p>
                            <p className="font-medium text-[#1d1d1f]">
                              {formatDateTime(request.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Only show action buttons for pending requests */}
                      {request.status === "pending" && (
                        <div className="flex justify-end gap-2">
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
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-2">
                {filteredReservations.map((request) => (
                  <div
                    key={request.id}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden border ${
                      request.status === "pending" &&
                      conflictingRequests[request.id]
                        ? "border-amber-300"
                        : "border-[#e6e6e6]"
                    } transition-all hover:shadow-md`}
                  >
                    <div className="p-3">
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
                        <div className="flex items-center gap-3 w-full md:w-auto mb-2 md:mb-0">
                          <div className="p-2 bg-[#f2f2f7] rounded-lg">
                            <PiProjectorScreenDuotone className="text-[#007aff] text-base" />
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-[#1d1d1f]">
                              {request.classroom_name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[#86868b]">
                              <span>{request.user_name}</span>
                              <span>•</span>
                              <span>
                                {formatDate(request.reservation_date)}
                              </span>
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

                          {/* Only show action buttons for pending requests */}
                          {request.status === "pending" && (
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  handleUpdateStatus(request.id, "rejected")
                                }
                                className="px-2 py-1 bg-white border border-[#e6e6e6] text-[#1d1d1f] rounded-full text-xs font-medium flex items-center gap-1 hover:bg-[#f5f5f7] transition-colors"
                              >
                                <FaTimes className="text-[#ff3b30] text-xs" />
                                Decline
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(request.id, "approved")
                                }
                                className="px-2 py-1 bg-[#007aff] text-white rounded-full text-xs font-medium flex items-center gap-1 hover:bg-[#0071e3] transition-colors"
                              >
                                <FaCheck className="text-xs" />
                                Approve
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Conflict Warning - only show for pending requests */}
                      {request.status === "pending" &&
                        conflictingRequests[request.id] && (
                          <div
                            className={`mt-2 p-2 rounded-md ${
                              conflictingRequests[request.id][0].hasPriority
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <div className="flex items-center gap-1 text-xs font-medium">
                              {conflictingRequests[request.id][0]
                                .hasPriority ? (
                                <>
                                  <FaCheck className="text-green-500" />
                                  <span>This request has priority</span>
                                </>
                              ) : (
                                <>
                                  <FaExclamationTriangle className="text-amber-500" />
                                  <span>Conflicts with another request</span>
                                </>
                              )}
                              <span className="mx-1">•</span>
                              <FaClock className="text-gray-500" />
                              <span>
                                {conflictingRequests[request.id][0].hasPriority
                                  ? `Requested ${getTimeDifference(
                                      conflictingRequests[request.id][0]
                                        .timeDifference
                                    )} than conflicting request`
                                  : `Priority to request from ${
                                      conflictingRequests[request.id][0]
                                        .priorityRequestTime
                                    }`}
                              </span>
                            </div>
                          </div>
                        )}

                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Purpose:</span>{" "}
                        <span className="text-gray-700">{request.purpose}</span>
                        {request.attendees && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-gray-500">
                              Attendees:
                            </span>{" "}
                            <span className="text-gray-700">
                              {request.attendees}
                            </span>
                          </>
                        )}
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

export default Requests;

// Add this where appropriate in the component
const typeIcons = {
  Lecture: <PiProjectorScreenDuotone className="text-xl" />,
  Tutorial: <PiChalkboardTeacherDuotone className="text-xl" />,
  Workshop: <BsPersonWorkspace className="text-xl" />,
};

// Update any references to the old icons in the component
// For example, in the grid view where it shows classroom icons:

// Replace:
// <PiProjectorScreenDuotone className="text-[#007aff] text-base" />

// With something like:
// {typeIcons[request.classroom_type] || <PiProjectorScreenDuotone className="text-[#007aff] text-base" />}
