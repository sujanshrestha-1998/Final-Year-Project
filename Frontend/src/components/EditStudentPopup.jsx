import React from "react";
import { FiX } from "react-icons/fi";

const EditStudentPopup = ({ student, onClose, onChange, onSave }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-end z-50">
      <div
        className="bg-black bg-opacity-50 absolute inset-0"
        onClick={onClose}
      ></div>
      <div className="bg-white w-1/3 h-full p-5 shadow-lg transform transition-transform translate-x-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Student Details</h2>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>
        <form className="flex flex-col gap-4 mt-4">
          <div>
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={student.first_name}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={student.last_name}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={student.date_of_birth}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>Email Address</label>
            <input
              type="text"
              name="student_email"
              value={student.student_email}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentPopup;
