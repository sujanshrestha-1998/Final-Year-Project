import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserGraduate,
  FaShuffle,
  FaUsers,
  FaSchool,
  FaLayerGroup,
  FaChevronDown,
} from "react-icons/fa6"; // Using only fa6 icons

const AllocateGroup = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAutoAllocating, setIsAutoAllocating] = useState(false);

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
      // If groupId is "none", send null to the backend
      const groupValue = groupId === "none" ? null : groupId;

      await axios.put("http://localhost:3000/api/update_student_group", {
        studentId,
        groupId: groupValue,
      });

      // Update local state to reflect the change
      setStudents(
        students.map((student) =>
          student.stud_id === studentId
            ? { ...student, stud_group: groupValue }
            : student
        )
      );
    } catch (err) {
      console.error("Error updating student group:", err);
      setError("Error updating student group");
    }
  };

  const handleAutoAllocate = async () => {
    try {
      setIsAutoAllocating(true);
      const response = await axios.post(
        "http://localhost:3000/api/auto_allocate_groups"
      );

      // Refresh the student list after auto allocation
      const studentsResponse = await axios.get(
        "http://localhost:3000/api/stud_details"
      );
      setStudents(studentsResponse.data.students);

      // Show success message (you might want to add a toast notification here)
      console.log(response.data.message);
    } catch (err) {
      console.error("Error in auto allocation:", err);
      setError("Error in auto allocation process");
    } finally {
      setIsAutoAllocating(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.stud_id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {/* Header Section */}
      <div className="p-5 border-b border-[#e5e5ea]">
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-3">
            <FaUsers className="text-2xl text-[#0066FF]" />
            <h2 className="text-[20px] font-medium text-gray-900">
              Group Allocation
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Auto Allocate Button - macOS style */}
            <button
              onClick={handleAutoAllocate}
              disabled={isAutoAllocating}
              className={`
                inline-flex items-center gap-2.5 px-4 py-2 rounded-lg text-[14px]
                font-medium transition-all duration-200
                ${
                  isAutoAllocating
                    ? "bg-[#e5e5ea] text-gray-400 cursor-not-allowed"
                    : "bg-[#34c759] text-white hover:bg-[#2db14f]"
                }
              `}
            >
              <FaShuffle className="text-lg" />
              {isAutoAllocating ? "Allocating..." : "Auto Allocate"}
            </button>

            {/* Search Input - macOS style */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 bg-[#f5f5f7] rounded-lg
                          text-[14px] border-none
                          focus:ring-2 focus:ring-[#0066FF] focus:bg-white
                          transition-all duration-200 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section - macOS style */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e5e5ea]">
          <thead>
            <tr className="bg-[#f5f5f7]">
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <FaUserGraduate className="text-[#8e8e93]" />
                  <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                    Student ID
                  </span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <FaSchool className="text-[#8e8e93]" />
                  <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                    Name
                  </span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                  Grade Level
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <FaLayerGroup className="text-[#8e8e93]" />
                  <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                    Group
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5ea]">
            {filteredStudents.map((student) => (
              <tr
                key={student.stud_id}
                className="hover:bg-[#f5f5f7] transition-colors duration-150"
              >
                <td className="px-6 py-4 text-[14px] text-gray-900">
                  {student.stud_id}
                </td>
                <td className="px-6 py-4">
                  <div className="text-[14px] font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] text-gray-500">
                  {student.grade_level}
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <select
                      value={student.stud_group || "none"}
                      onChange={(e) =>
                        handleGroupChange(student.stud_id, e.target.value)
                      }
                      className="block w-full pl-3 pr-10 py-2 text-[14px]
                               bg-[#f5f5f7] border-none rounded-lg
                               focus:ring-2 focus:ring-[#0066FF] focus:bg-white
                               transition-all duration-200"
                    >
                      <option value="none">None</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8e8e93]"></div>
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
