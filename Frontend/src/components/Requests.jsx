import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChalkboardTeacher, FaCheck, FaTimes } from "react-icons/fa";
import { BsCalendar2EventFill } from "react-icons/bs";
import { BiTime } from "react-icons/bi";
import { MdOutlineDescription, MdPeople } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";

const Requests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/get_pending_reservations"
        );

        if (response.data.success) {
          setPendingRequests(response.data.reservations);
        } else {
          setError("Failed to fetch pending requests");
        }
      } catch (err) {
        console.error("Error fetching pending requests:", err);
        setError("An error occurred while fetching pending requests");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [refreshTrigger]);

  const handleUpdateStatus = async (reservationId, status) => {
    try {
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

  if (loading) {
    return (
      <div className="h-screen w-[82vw] overflow-auto pl-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600">Loading reservation requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-[82vw] overflow-auto pl-6 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-[82vw] overflow-auto pl-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-gray-200">
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 py-1">
                <h1 className="font-semibold text-2xl text-black">
                  CLASSROOM RESERVATION REQUESTS
                </h1>
                <IoMdInformationCircleOutline className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-gray-100 rounded-full p-4 inline-flex mb-4">
                <FaChalkboardTeacher className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No Pending Requests
              </h3>
              <p className="text-gray-500">
                There are no classroom reservation requests pending approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <FaChalkboardTeacher className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {request.classroom_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Requested by: {request.user_name}
                          </p>
                        </div>
                      </div>
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                        Pending
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <BsCalendar2EventFill className="text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-medium">
                            {formatDate(request.reservation_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BiTime className="text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-medium">
                            {formatTime(request.start_time)} -{" "}
                            {formatTime(request.end_time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdOutlineDescription className="text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Purpose</p>
                          <p className="text-sm font-medium">
                            {request.purpose}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdPeople className="text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Attendees</p>
                          <p className="text-sm font-medium">
                            {request.attendees || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() =>
                          handleUpdateStatus(request.id, "rejected")
                        }
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-100 transition-colors"
                      >
                        <FaTimes />
                        Decline
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(request.id, "approved")
                        }
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 hover:bg-green-100 transition-colors"
                      >
                        <FaCheck />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
