import React, { useState, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { HiChevronUpDown } from "react-icons/hi2";
import { FiEdit } from "react-icons/fi";

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
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

  const filteredStudents = students.filter((student) => {
    const matchesSearchTerm =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.stud_id.toString().includes(searchTerm);

    const matchesGroup = selectedGroup
      ? student.stud_group.toString() === selectedGroup // Ensure both are strings for comparison
      : true;

    return matchesSearchTerm && matchesGroup;
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-black">Loading...</p>
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
    <div className="h-screen w-[78vw] overflow-hidden flex flex-col mx-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 py-5">
          <h1 className="font-medium text-2xl text-black">GROUP ALLOCATION</h1>
          <IoMdInformationCircleOutline className="text-2xl " />
          <div className="relative w-80 ml-2">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-1 bg-gray-200 rounded-md 
               text-[14px] border-none 
               transition-all duration-200 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Combo Box for Group Filtering */}
          <div className="relative w-48 mr-2">
            <select
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="block w-full pl-3 pr-8 py-1 text-[14px]
                     bg-gray-200 border-none rounded-md
                     focus:ring-2 focus:ring-[#0066FF] focus:bg-white
                     transition-all duration-200 appearance-none"
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <HiChevronUpDown className="absolute inset-y-0 right-1 flex h-5 items-center text-white pointer-events-none mt-1 bg-blue-500 rounded-md" />
          </div>
          <div className="flex  selection:items-center gap-4 justify-center">
            {/* Search Input */}

            <button
              onClick={handleAutoAllocate}
              disabled={isAutoAllocating}
              className={`
              inline-flex items-center gap-2.5 px-4 py-1 rounded-md text-[14px]
              font-medium transition-all duration-200 text-white
              ${
                isAutoAllocating
                  ? "bg-[#e5e5ea] text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white]"
              }
            `}
            >
              <FaShuffle className="text-lg" />
              {isAutoAllocating ? "Allocating..." : "Auto Allocate"}
            </button>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="w-full border-b flex mt-5 items-center justify-between"></div>
      {/* Table Section */}
      <div className="overflow-x-auto w-full flex  justify-start">
        <table className="w-full divide-y divide-[#e5e5ea]">
          <thead>
            <tr className="bg-[#f5f5f7]">
              <th className="px-6 py-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                    Student ID
                  </span>
                </div>
              </th>
              <th className="px-6 py-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                    Name
                  </span>
                </div>
              </th>
              <th className="px-6 py-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                    Course
                  </span>
                </div>
              </th>
              <th className="px-6 py-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                    Status
                  </span>
                </div>
              </th>
              <th className="px-6 py-1 text-left">
                <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
                  Grade Level
                </span>
              </th>
              <th className="px-6 py-1 text-left">
                <div className="flex items-center gap-2">
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
                className="font-medium transition-colors duration-150"
              >
                <td className="px-6 py-2 text-[14px] text-gray-900">
                  {student.stud_id}
                </td>
                <td className="px-6 py-2">
                  <div className="text-[14px] font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </div>
                </td>
                <td className="px-6 py-2">
                  <div className="text-[14px] font-medium text-gray-900">
                    Bsc (Hons) Computer Science
                  </div>
                </td>
                <td className="px-6 py-2">
                  <div className="text-[14px] font-medium text-gray-900">
                    Active
                  </div>
                </td>
                <td className="px-6 py-2 text-[14px] text-gray-500">
                  {student.grade_level}
                </td>
                <td className="px-6 py-2">
                  <div className="relative">
                    <select
                      value={student.stud_group || "none"}
                      onChange={(e) =>
                        handleGroupChange(student.stud_id, e.target.value)
                      }
                      className="w-full pl-3 py-1 text-[14px]
                         bg-gray-200 border-none rounded-md
                         focus:ring-2 focus:ring-[#0066FF] focus:bg-white
                         transition-all duration-200 appearance-none"
                    >
                      <option value="none">None</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <FiEdit className="absolute inset-y-0 right-2 flex items-center text-blue-500 mt-1.5 pointer-events-none" />
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
