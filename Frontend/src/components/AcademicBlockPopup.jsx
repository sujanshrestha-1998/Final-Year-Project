import React from "react";
import { IoMdClose } from "react-icons/io";

const AcademicBlockPopup = ({
  isOpen,
  onClose,
  blockName,
  teachers,
  blockInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[200] p-2 transition-all duration-300">
      <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-fadeIn">
        {/* Header */}
        <div className=" p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight text-blue-500 leading-tight">
            {blockName}
          </h2>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white transition-colors rounded-full p-1.5 hover:bg-white/10 active:bg-white/20"
            aria-label="Close"
          >
            <IoMdClose
              size={22}
              className="text-white bg-red-600 rounded-full p-1"
            />
          </button>
        </div>

        {/* Block Information */}
        <div className="px-6 py-2 border-b border-gray-100">
          <h3 className="font-medium text-base mb-4 text-gray-800">
            Block Information
          </h3>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Location</span>
              <span className="text-gray-800 font-normal">
                {blockInfo?.location || "Administration Building"}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Floor</span>
              <span className="text-gray-800 font-normal">
                {blockInfo?.floor || "Not specified"}
              </span>
            </p>
          </div>
        </div>

        {/* Teachers List */}
        <div className="px-6 py-5 max-h-[250px] overflow-y-auto">
          <h3 className="font-medium text-base mb-4 text-gray-800">Teachers</h3>

          {teachers && teachers.length > 0 ? (
            <div className="space-y-3">
              {teachers.map((teacher, idx) => (
                <div key={idx} className="p-2 border-b-2 ">
                  <p className="font-medium text-gray-800">{teacher.name}</p>
                  <p className="text-xs text-blue-500 mt-1.5">
                    {teacher.subject}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              No teachers assigned to this block
            </p>
          )}
        </div>

        {/* Footer */}
        {/* <div className="bg-gray-50 px-6 py-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AcademicBlockPopup;
