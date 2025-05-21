import React from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaUsersLine } from "react-icons/fa6";
import { RiComputerFill } from "react-icons/ri";

// Component for displaying classroom type icon
const ClassroomTypeIcon = ({ type }) => {
  if (type === "Lecture")
    return <FaChalkboardTeacher className="text-blue-500 mr-1" />;
  if (type === "Tutorial")
    return <FaUsersLine className="text-green-500 mr-1" />;
  if (type === "Workshop")
    return <RiComputerFill className="text-orange-500 mr-1" />;
  return <span className="w-2 h-2 rounded-full mr-1 bg-gray-500"></span>;
};

// Table View Component
// Inside the TableView component, we need to ensure we're safely accessing properties
export const TableView = ({
  filteredClassrooms,
  timeSlots,
  calculateCellSpan,
  formatTime,
}) => {
  return (
    <div className="bg-white">
      <div className="overflow-x-auto scrollbar-hidden">
        <table className="w-full table-fixed divide-y divide-gray-100">
          <thead>
            <tr>
              <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-32 sticky left-0 bg-white z-10">
                Classroom
              </th>
              {timeSlots.map((slot) => (
                <th
                  key={slot.id}
                  className="py-3 px-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wide w-32"
                >
                  {slot.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-500">
            {filteredClassrooms.map((classroom) => {
              // Calculate cell spans for this classroom
              const cellSpans = calculateCellSpan(classroom, timeSlots);

              return (
                <tr key={classroom.id}>
                  <td className="py-3 px-2 h-20 sticky left-0 bg-white z-10">
                    <div className="font-medium text-gray-800">
                      {classroom.name}
                    </div>
                    <div className="py-2 border-b border-gray-100">
                      <p className="flex items-center text-xs text-gray-500 mt-1">
                        <ClassroomTypeIcon type={classroom.type} />
                        {classroom.type}
                      </p>
                    </div>
                  </td>

                  {timeSlots.map((slot, slotIndex) => {
                    // Skip cells that are part of a span
                    if (
                      Object.keys(cellSpans).some((startIdx) => {
                        const span = cellSpans[startIdx];
                        // Add null check for span
                        if (!span) return false;

                        const endIdx = parseInt(startIdx) + span.span - 1;
                        return (
                          slotIndex > parseInt(startIdx) && slotIndex <= endIdx
                        );
                      })
                    ) {
                      return null;
                    }

                    // Occupied cell with span
                    if (cellSpans[slotIndex]) {
                      const { span, status } = cellSpans[slotIndex];

                      // Add null check for status
                      if (!status) {
                        return (
                          <td
                            key={`${classroom.id}-${slot.id}`}
                            className="p-2 h-20 border-x-2 border-gray-200 bg-green-50"
                            colSpan={span || 1}
                          >
                            <div className="h-full flex flex-col justify-center rounded-lg p-2">
                              <div className="text-xs text-green-500 font-medium text-center">
                                Error: Invalid status
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={`${classroom.id}-${slot.id}`}
                          className="p-2 h-20 border-x-2 border-gray-200 bg-red-200"
                          colSpan={span}
                        >
                          <div className="h-full flex flex-col justify-center rounded-lg p-2">
                            <div className="text-sm">
                              {status.isApproved ? (
                                <div className="text-blue-500 font-semibold mt-1">
                                  Occupied by {status.username || "User"}
                                </div>
                              ) : (
                                <div className="text-blue-500 font-semibold mt-1">
                                  {status.group || "Unknown Group"}
                                </div>
                              )}
                              <div className="text-black mt-1">
                                {formatTime(status.startTime)} -{" "}
                                {formatTime(status.endTime)}
                              </div>
                              <div className="text-gray-600 truncate mt-1">
                                {status.isApproved
                                  ? "Reserved"
                                  : status.teacher || "Unknown Teacher"}
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Regular unoccupied cell
                    return (
                      <td
                        key={`${classroom.id}-${slot.id}`}
                        className="p-2 h-20 w-32 bg-green-50"
                      >
                        <div className="h-full flex flex-col justify-center rounded-lg p-2">
                          <div className="text-xs text-green-500 font-medium text-center"></div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Card View Component
export const CardView = ({
  classroomsWithSchedules,
  formatTime,
  handleOpenReservation,
}) => {
  return (
    <div className="p-6">
      {classroomsWithSchedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {classroomsWithSchedules.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 w-full h-64 overflow-hidden transition-shadow duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => handleOpenReservation(classroom)}
            >
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {classroom.name}
                  </h3>
                  <p className="flex items-center text-xs text-gray-500 mt-1">
                    <ClassroomTypeIcon type={classroom.type} />
                    {classroom.type}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classroom.isCurrentlyOccupied
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {classroom.isCurrentlyOccupied ? "Occupied" : "Available"}
                </div>
              </div>
              <div className="p-5 h-48 overflow-y-auto">
                {classroom.schedules.length > 0 ? (
                  <div className="space-y-3">
                    {classroom.schedules.map((schedule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-blue-50 border-0 transition-all duration-200 hover:bg-blue-100"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800 truncate max-w-xs">
                            {schedule.isApproved
                              ? "Reserved"
                              : schedule.course_name}
                          </span>
                          <span className="text-xs px-2.5 py-1 bg-white rounded-full text-blue-600 whitespace-nowrap ml-1 shadow-sm">
                            {schedule.isApproved
                              ? "Approved"
                              : schedule.group_name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1.5 truncate">
                          {schedule.isApproved
                            ? `Occupied by ${schedule.username || "User"}`
                            : schedule.teacher_name}
                        </div>
                        <div className="text-sm font-medium text-gray-700 flex items-center">
                          <svg
                            className="w-3.5 h-3.5 mr-1.5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {formatTime(schedule.start_time)} -{" "}
                          {formatTime(schedule.end_time)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5M8 19h8"
                      />
                    </svg>
                    <p className="text-sm text-gray-700 font-medium">
                      Available All Day
                    </p>
                    <p className="text-xs text-green-600 mt-1.5 bg-green-50 px-3 py-1 rounded-full">
                      No classes scheduled
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5M8 19h8"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Classrooms Found
          </h3>
          <p className="text-sm text-gray-500 max-w-md text-center">
            No classrooms match your current filters. Try adjusting your
            selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default { TableView, CardView };
