import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FaUserEdit, FaEnvelope } from "react-icons/fa";
import { BsCalendarDate, BsShieldCheck } from "react-icons/bs";
import axios from "axios";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem("userEmail");
      const roleId = localStorage.getItem("roleId");

      if (!email) {
        setError("User email not found");
        setIsLoading(false);
        return;
      }

      try {
        // First get basic user info
        const userResponse = await axios.post(
          "http://localhost:3000/api/fetch_profile",
          { email }
        );

        const basicUserData = userResponse.data.user;

        // Based on role, fetch additional details
        if (basicUserData.role_id === 4) {
          // Student
          const studentResponse = await axios.get(
            `http://localhost:3000/api/search_students?query=${encodeURIComponent(
              email
            )}`
          );

          if (
            studentResponse.data.students &&
            studentResponse.data.students.length > 0
          ) {
            setUserData({
              ...basicUserData,
              details: studentResponse.data.students[0],
            });
          } else {
            setUserData(basicUserData);
          }
        } else if (basicUserData.role_id === 3) {
          // Teacher
          const teacherResponse = await axios.get(
            `http://localhost:3000/api/search_teachers?query=${encodeURIComponent(
              email
            )}`
          );

          if (
            teacherResponse.data.teachers &&
            teacherResponse.data.teachers.length > 0
          ) {
            setUserData({
              ...basicUserData,
              details: teacherResponse.data.teachers[0],
            });
          } else {
            setUserData(basicUserData);
          }
        } else {
          // For other roles, just use the basic data
          setUserData(basicUserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return "Administrator";
      case 2:
        return "RTE Officer";
      case 3:
        return "Teacher";
      case 4:
        return "Student";
      default:
        return "User";
    }
  };

  const getRoleColor = (roleId) => {
    switch (roleId) {
      case 1:
        return "bg-purple-100 text-purple-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-green-100 text-green-800";
      case 4:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-white min-h-screen">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="border-b pb-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-500 mt-1">
              Account information and personal details
            </p>
          </div>

          {/* Profile section */}
          <div className="flex flex-col md:flex-row gap-10 mb-10">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <img
                src="/src/assets/Profile.png"
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover shadow-sm"
              />
              <div
                className={`mt-4 px-4 py-1.5 rounded-md text-sm font-medium ${getRoleColor(
                  userData?.role_id
                )}`}
              >
                {getRoleName(userData?.role_id)}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {userData?.username || "N/A"}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <FaEnvelope className="text-gray-400" />
                <span>{userData?.email || "N/A"}</span>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-md text-sm">
                  <BsShieldCheck />
                  <span>Active Account</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-sm">
                  <BsCalendarDate />
                  <span>
                    Joined{" "}
                    {new Date(userData?.created_at).getFullYear() || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details section */}
          {userData?.details && (
            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {userData.role_id === 4
                  ? "Student Information"
                  : "Teacher Information"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                {userData.role_id === 4 && (
                  <>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                        Student ID
                      </p>
                      <p className="text-lg font-medium">
                        {userData.details.stud_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                        Grade Level
                      </p>
                      <p className="text-lg font-medium">
                        {userData.details.grade_level}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                        Enrollment Date
                      </p>
                      <p className="text-lg font-medium">
                        {new Date(
                          userData.details.enrollment_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                        Date of Birth
                      </p>
                      <p className="text-lg font-medium">
                        {new Date(
                          userData.details.date_of_birth
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}

                {userData.role_id === 3 && (
                  <>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                        Teacher ID
                      </p>
                      <p className="text-lg font-medium">
                        {userData.details.teacher_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                        Course
                      </p>
                      <p className="text-lg font-medium">
                        {userData.details.course}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                        Enrolled Date
                      </p>
                      <p className="text-lg font-medium">
                        {new Date(
                          userData.details.enrolled_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                        Academics Block
                      </p>
                      <p className="text-lg font-medium">
                        {userData.details.assigned_academics
                          ? `Academics ${String.fromCharCode(
                              64 + parseInt(userData.details.assigned_academics)
                            )}`
                          : "Not Assigned"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
