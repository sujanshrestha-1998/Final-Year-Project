import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FaRegAddressCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TeacherList = ({ teachers, selectedTeacher, onTeacherClick }) => {
  return (
    <div className="max-h-[500px] overflow-y-auto rounded-[8px] shadow-sm">
      {teachers.map((teacher) => (
        <div
          key={teacher.teacher_id}
          className={`border-b border-gray-300 p-2 shadow-md cursor-pointer ${
            selectedTeacher && selectedTeacher.teacher_id === teacher.teacher_id
              ? "bg-blue-500 text-white"
              : "bg-white text-black"
          }`}
          onClick={() => onTeacherClick(teacher)}
        >
          <p className="text-md font-semibold">
            {teacher.first_name} {teacher.last_name}
          </p>
          <p className="text-sm">{teacher.email}</p>
        </div>
      ))}
    </div>
  );
};

const Teacher = () => {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/teacher_details"
        );
        setTeachers(response.data.teachers);
        setError("");

        if (response.data.teachers.length > 0) {
          setSelectedTeacher(response.data.teachers[0]);
        }
      } catch (err) {
        console.error("Error fetching teacher details:", err);
        setError(
          "Error fetching teacher details. " +
            (err.response ? err.response.data : err.message)
        );
        setTeachers([]);
      }
    };

    fetchTeachers();
  }, []);

  const handleRegisterClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/registerteacher");
    }, 1500);
  };

  return (
    <div>
      <div className="h-screen bg-[#f2f1f1]">
        <div className="mx-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">TEACHER DETAILS</h1>
            <IoMdInformationCircleOutline className="text-2xl" />
          </div>
          <div className="flex mt-5">
            <button
              onClick={handleRegisterClick}
              className="bg-blue-500 rounded-[8px] px-6 py-1 flex justify-center font-medium items-center gap-2 text-white transform transition-all duration-300"
            >
              {loading ? (
                <div className="loader w-6 h-6 bg-blue-500 border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Register Teacher
                  <FaRegAddressCard className="bg-blue-500 text-lg" />
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-600 font-bold">{error}</p>}
          <div className="flex w-full gap-20">
            <div className="w-2/5">
              {teachers.length > 0 ? (
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">All Students</h2>
                  <TeacherList
                    teachers={teachers}
                    selectedTeacher={selectedTeacher}
                    onTeacherClick={(teacher) => setSelectedTeacher(teacher)}
                  />
                </div>
              ) : (
                <p className="text-gray-600 mt-6">No teachers found</p>
              )}
            </div>
            <div className="w-full">
              <img
                src="/src/assets/TeacherDashboard.png"
                alt=""
                width={900}
                height={900}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teacher;
