import React from "react";

const Profile = ({ onClose }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <p>This is the profile component content.</p>
      <button
        onClick={onClose} // Close the modal when clicked
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  );
};

export default Profile;
