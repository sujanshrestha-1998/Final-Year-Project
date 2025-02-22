import React, { useEffect, useState } from "react";

const AllocateTime = () => {
  const [schedules, setSchedules] = useState([]);
  const [groups, setGroups] = useState([]); // To store the group names
  const [selectedGroupId, setSelectedGroupId] = useState("1"); // Default selected group

  // Fetch the groups from the /groups API
  useEffect(() => {
    const fetchGroups = async () => {
      const response = await fetch("http://localhost:3000/api/groups");
      const data = await response.json();
      setGroups(data.groups); // Assuming the response contains a 'groups' array
    };

    fetchGroups();
  }, []);

  // Fetch schedules based on the selected group
  useEffect(() => {
    const fetchSchedules = async () => {
      const response = await fetch("http://localhost:3000/api/fetch_schedule", {
        method: "POST", // Use POST method
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
        body: JSON.stringify({ group_id: selectedGroupId }), // Send selected group_id as JSON in the body
      });

      const data = await response.json();
      console.log("Fetched data:", data); // Log the full response
      if (Array.isArray(data.schedules)) {
        setSchedules(data.schedules); // Set schedules from the 'schedules' property
      } else {
        console.error(
          "The response data.schedules is not an array:",
          data.schedules
        );
      }
    };

    fetchSchedules();
  }, [selectedGroupId]); // Re-fetch schedules whenever the selected group changes

  return (
    <div className="bg-[#f2f2f7] h-full flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Combo Box for selecting a group */}
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="mb-4 p-2 border rounded"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        {/* Display the fetched schedules */}
        {schedules.map((schedule) => (
          <div key={schedule.id}>
            <p>Group Name: {schedule.group_name}</p>
            <p>Classroom Name: {schedule.classroom_name}</p>
            <p>Course Name: {schedule.course_name}</p>
            <p>Teacher Name: {schedule.teacher_name}</p>
            <p>Day: {schedule.day_of_week}</p>
            <p>Start Time: {schedule.start_time}</p>
            <p>End Time: {schedule.end_time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllocateTime;
