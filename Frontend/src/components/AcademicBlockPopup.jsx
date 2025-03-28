import React from "react";
import { IoMdClose } from "react-icons/io";

const AcademicBlockPopup = ({ 
  isOpen, 
  onClose, 
  blockName, 
  teachers, 
  blockInfo 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#92bd63] text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{blockName}</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Block Information */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg mb-2">Block Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Location:</span> {blockInfo?.location || 'Administration Building'}</p>
            <p><span className="font-medium">Floor:</span> {blockInfo?.floor || 'Not specified'}</p>
            <p><span className="font-medium">Facilities:</span> {blockInfo?.facilities || 'Classrooms, Staff Rooms'}</p>
          </div>
        </div>

        {/* Teachers List */}
        <div className="p-4 max-h-[300px] overflow-y-auto">
          <h3 className="font-semibold text-lg mb-2">Teachers</h3>
          
          {teachers && teachers.length > 0 ? (
            <div className="space-y-3">
              {teachers.map((teacher, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-800">{teacher.name}</p>
                  <p className="text-sm text-gray-600">{teacher.subject}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No teachers assigned to this block</p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#92bd63] text-white rounded-md hover:bg-[#7da952] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicBlockPopup;