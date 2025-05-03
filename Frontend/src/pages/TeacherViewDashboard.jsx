import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import TeacherView from "../components/TeacherView";

const TeacherViewDashboard = () => {
  return (
    <div className="flex">
      <div className>
        <DashboardMenu />
      </div>
      <div>
        <TeacherView />
      </div>
    </div>
  );
};

export default TeacherViewDashboard;
