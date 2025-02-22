import React from "react";
import { IoChevronBackOutline } from "react-icons/io5";

const EditStudentPopup = ({ student, onClose, onChange, onSave }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-end z-50">
      <div
        className="bg-black bg-opacity-50 absolute inset-0"
        onClick={onClose}
      ></div>
      <div className="bg-white w-1/3 h-full p-5 shadow-lg transform transition-transform translate-x-0">
        <div className="flex flex-col">
          <div className="flex justify-start font-semibold text-blue-500">
            <button
              onClick={onClose}
              className="flex justify-center items-center gap-1 mb-8"
            >
              <IoChevronBackOutline />
              <h1>Back</h1>
            </button>
          </div>
          <h2 className="text-lg font-semibold">Edit Student Details</h2>
        </div>
        <form className="flex flex-col gap-4 mt-4">
          <fieldset>
            <legend className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">
              Personal Information
            </legend>
            <div className="flex gap-2 mb-2">
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
          </fieldset>
          <fieldset>
            <legend className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">
              College Information
            </legend>

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
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default EditStudentPopup;
