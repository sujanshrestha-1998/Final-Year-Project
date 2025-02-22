import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import AllocateTime from "../components/AllocateTime";
const TimeDashboard = () => {
  return (
    <div className="flex">
      <div className>
        <DashboardMenu />
      </div>
      <div>
        <AllocateTime />
      </div>
    </div>
  );
};

export default TimeDashboard;
