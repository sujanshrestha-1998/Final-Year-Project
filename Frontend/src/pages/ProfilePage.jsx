import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { IoMdInformationCircleOutline } from "react-icons/io";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;

      try {
        const response = await fetch(
          "http://localhost:3000/api/fetch_profile",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-medium">USER PROFILE</h1>
          <IoMdInformationCircleOutline className="text-2xl" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
          <div className="flex items-start gap-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <img
                src="/src/assets/Profile.png"
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
              <button className="mt-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Change Photo
              </button>
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="font-medium">{userData?.username || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{userData?.email || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Role</label>
                    <p className="font-medium">
                      {(() => {
                        switch (userData?.role_id) {
                          case 1:
                            return "Administrator";
                          case 2:
                            return "RTE Officer";
                          case 3:
                            return "Teacher";
                          case 4:
                            return "Student";
                          default:
                            return "N/A";
                        }
                      })()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">
                      Phone Number
                    </label>
                    <p className="font-medium">{userData?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Address</label>
                    <p className="font-medium">{userData?.address || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
