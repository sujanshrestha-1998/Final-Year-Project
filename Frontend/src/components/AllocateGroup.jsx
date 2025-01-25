import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiOutlineChevronUpDown } from "react-icons/hi2";

const AllocateGroup = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const studentsResponse = await axios.get(
          "http://localhost:3000/api/stud_details"
        );
        setStudents(studentsResponse.data.students);

        // Fetch groups
        const groupsResponse = await axios.get(
          "http://localhost:3000/api/groups"
        );
        setGroups(groupsResponse.data.groups);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGroupChange = async (studentId, groupId) => {
    try {
      await axios.put("http://localhost:3000/api/update_student_group", {
        studentId,
        groupId,
      });

      // Update local state to reflect the change
      setStudents(
        students.map((student) =>
          student.stud_id === studentId
            ? { ...student, stud_group: groupId }
            : student
        )
      );
    } catch (err) {
      console.error("Error updating student group:", err);
      setError("Error updating student group");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Allocate Student Groups</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.stud_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.stud_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.grade_level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select
                      value={student.stud_group || ""}
                      onChange={(e) =>
                        handleGroupChange(student.stud_id, e.target.value)
                      }
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select Group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <HiOutlineChevronUpDown className="h-4 w-4" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllocateGroup;
