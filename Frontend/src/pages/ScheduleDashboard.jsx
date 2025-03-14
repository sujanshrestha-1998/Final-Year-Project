import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import Schedule from "../components/Schedule";
import AllocateGroup from "../components/AllocateGroup";
const ScheduleDashboard = () => {
  return (
    <div className="flex">
      <div className>
        <DashboardMenu />
      </div>
      <div>
        <AllocateGroup />
      </div>
    </div>
  );
};

export default ScheduleDashboard;
