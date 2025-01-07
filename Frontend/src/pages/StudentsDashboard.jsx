// StudentsDashboard.jsx
import React, { useState } from "react";
import DashboardMenu from "../components/DashboardMenu";
import Students from "../components/Students";

const StudentsDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    // You can add further logic here, like navigating to a student detail page
    console.log("Selected Student:", student);
  };

  return (
    <div>
      <div>
        <DashboardMenu onStudentSelect={handleStudentSelect} />
      </div>
      <div className="">
        <Students selectedStudent={selectedStudent} />
      </div>
    </div>
  );
};

export default StudentsDashboard;
