import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import Schedule from "../components/Schedule";
import AllocateGroup from "../components/AllocateGroup";
import TeacherData from "../components/TeacherData";
const ScheduleDashboard = () => {
  return (
    <div className="flex">
      <div className>
        <DashboardMenu />
      </div>
      <div>
        <TeacherData />
      </div>
    </div>
  );
};

export default ScheduleDashboard;
