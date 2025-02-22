import React, { useEffect, useState } from "react";

const AllocateTime = () => {
  const [schedules, setSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("1");

  useEffect(() => {
    const fetchGroups = async () => {
      const response = await fetch("http://localhost:3000/api/groups");
      const data = await response.json();
      setGroups(data.groups);
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      const response = await fetch("http://localhost:3000/api/fetch_schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ group_id: selectedGroupId }),
      });

      const data = await response.json();
      if (Array.isArray(data.schedules)) {
        setSchedules(data.schedules);
      } else {
        console.error(
          "The response data.schedules is not an array:",
          data.schedules
        );
      }
    };

    fetchSchedules();
  }, [selectedGroupId]);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  return (
    <div className="bg-[#f2f2f7] h-full flex flex-col items-center p-6">
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Group:</label>
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="p-2 border rounded"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Day</th>
              <th className="border border-gray-300 p-2">Classroom</th>
              <th className="border border-gray-300 p-2">Course</th>
              <th className="border border-gray-300 p-2">Teacher</th>
              <th className="border border-gray-300 p-2">Start Time</th>
              <th className="border border-gray-300 p-2">End Time</th>
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map((day) => {
              const daySchedules = schedules.filter(
                (schedule) => schedule.day_of_week === day
              );
              return daySchedules.length > 0 ? (
                daySchedules.map((schedule, index) => (
                  <tr key={schedule.id} className="text-center">
                    {index === 0 && (
                      <td
                        className="border border-gray-300 p-2 font-semibold"
                        rowSpan={daySchedules.length}
                      >
                        {day}
                      </td>
                    )}
                    <td className="border border-gray-300 p-2">
                      {schedule.classroom_name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {schedule.course_name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {schedule.teacher_name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {schedule.start_time}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {schedule.end_time}
                    </td>
                  </tr>
                ))
              ) : (
                <tr key={day}>
                  <td className="border border-gray-300 p-2 font-semibold">
                    {day}
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan="5"
                  >
                    No Schedule
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllocateTime;
