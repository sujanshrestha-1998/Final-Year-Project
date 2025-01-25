import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import Schedule from "../components/Schedule";
const ScheduleDashboard = () => {
  return (
    <div>
      <div>
        <DashboardMenu />
      </div>
      <div>
        <Schedule />
      </div>
    </div>
  );
};

export default ScheduleDashboard;
