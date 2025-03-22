import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChalkboardTeacher, FaCheck, FaTimes } from "react-icons/fa";
import { BsCalendar2EventFill } from "react-icons/bs";
import { BiTime } from "react-icons/bi";
import { MdOutlineDescription, MdPeople } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { PiProjectorScreenDuotone, PiClockUserDuotone } from "react-icons/pi";

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
        {/* Header */}
        <div className="mb-4 flex py-1 gap-1 items-center">
          <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            RESERVATION REQUETS
          </h1>
          <IoMdInformationCircleOutline className="text-xl" />
        </div>

        {/* Content */}
        <div>
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-3">
                <FaChalkboardTeacher className="text-[#86868b] text-lg" />
              </div>
              <h3 className="text-lg font-medium text-[#1d1d1f] mb-1">
                No Pending Requests
              </h3>
              <p className="text-[#86868b] text-sm max-w-md mx-auto">
                There are no classroom reservation requests pending approval at
                this time.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#e6e6e6] transition-all hover:shadow-md"
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
                      <div className="bg-[#fff8e6] text-[#ff9500] px-2 py-0.5 rounded-full text-xs font-medium">
                        Pending
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
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
                    </div>

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
