import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import Students from "../components/Students";

const StudentsDashboard = () => {
  return (
    <div>
      <div>
        <DashboardMenu />
      </div>
      <div className="mx-8">
        <Students />
      </div>
    </div>
  );
};

export default StudentsDashboard;
