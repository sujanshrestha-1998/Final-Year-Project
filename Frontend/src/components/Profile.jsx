import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = ({ userData, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);

    // Add event listener for escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Delay closing to allow animation to complete
  };

  const handleViewProfile = () => {
    handleClose();
    navigate("/profile");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-200 ease-in-out z-50 ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Profile Menu */}
      <div
        className={`absolute left-4 bottom-24 w-[250px] bg-white rounded-lg shadow-xl transition-all duration-200 ease-in-out z-50 ${
          isVisible
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform translate-y-4"
        }`}
      >
        <div className="p-2 space-y-1">
          <button
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
            onClick={handleViewProfile}
          >
            <span>View Profile</span>
          </button>
          <button
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
            onClick={() => {
              /* Handle settings click */
            }}
          >
            <span>Settings</span>
          </button>
          <div className="h-px bg-gray-200 my-1"></div>
          <button
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;
