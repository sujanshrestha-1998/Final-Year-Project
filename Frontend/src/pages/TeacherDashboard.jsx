import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import Teacher from "../components/Teacher";

const TeacherDashboard = () => {
  return (
    <div className="flex">
      <div>
        <DashboardMenu />
      </div>
      <div>
        <Teacher />
      </div>
    </div>
  );
};

export default TeacherDashboard;
