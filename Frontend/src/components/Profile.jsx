import React from "react";

const Profile = ({ userData, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Profile Modal Content */}
      <div className="relative bg-white w-96 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        {userData ? (
          <div>
            <p>
              <strong>Name:</strong> {userData.username}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Role ID:</strong> {userData.role_id}
            </p>
          </div>
        ) : (
          <p>Loading profile data...</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Profile;
