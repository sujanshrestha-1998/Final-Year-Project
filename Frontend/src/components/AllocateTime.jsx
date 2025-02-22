import React, { useEffect, useState } from "react";

const AllocateTime = () => {
  const [schedules, setSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    schedule_id: null,
    group_id: "1",
    classroom_id: "",
    course_id: "",
    teacher_id: "",
    day_of_week: "Sunday",
    start_time: "",
    end_time: "",
  });

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: selectedGroupId }),
      });
      const data = await response.json();
      if (Array.isArray(data.schedules)) setSchedules(data.schedules);
    };
    fetchSchedules();
  }, [selectedGroupId]);

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setFormData({
        schedule_id: schedule.schedule_id,
        group_id: schedule.group_id || selectedGroupId,
        classroom_id: schedule.classroom_id || "",
        course_id: schedule.course_id || "",
        teacher_id: schedule.teacher_id || "",
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
      });
    } else {
      setFormData({
        schedule_id: null,
        group_id: selectedGroupId,
        classroom_id: "",
        course_id: "",
        teacher_id: "",
        day_of_week: "Sunday",
        start_time: "",
        end_time: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3000/api/update_schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    alert(data.message);
    setIsModalOpen(false);
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      const response = await fetch(
        "http://localhost:3000/api/delete_schedule",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedule_id: scheduleId }),
        }
      );
      const data = await response.json();
      alert(data.message);

      setSchedules(
        schedules.filter((schedule) => schedule.schedule_id !== scheduleId)
      );
    }
  };

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
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.schedule_id} className="text-center">
                <td className="border border-gray-300 p-2">
                  {schedule.day_of_week}
                </td>
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
                <td className="border border-gray-300 p-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleOpenModal(schedule)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                    onClick={() => handleDelete(schedule.schedule_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => handleOpenModal()}
        >
          Add Schedule
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {formData.schedule_id ? "Update Schedule" : "Add New Schedule"}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="hidden"
                name="schedule_id"
                value={formData.schedule_id || ""}
              />
              <label>Group</label>
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>

              <label>Classroom ID</label>
              <input
                type="text"
                name="classroom_id"
                required
                value={formData.classroom_id}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2"
              />

              <label>Course ID</label>
              <input
                type="text"
                name="course_id"
                required
                value={formData.course_id}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2"
              />

              <label>Teacher ID</label>
              <input
                type="text"
                name="teacher_id"
                required
                value={formData.teacher_id}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2"
              />

              <label>Day of Week</label>
              <select
                name="day_of_week"
                required
                value={formData.day_of_week}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2"
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <label>Start Time</label>
              <input
                type="time"
                name="start_time"
                required
                value={formData.start_time}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2"
              />

              <label>End Time</label>
              <input
                type="time"
                name="end_time"
                required
                value={formData.end_time}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2"
              />

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocateTime;
