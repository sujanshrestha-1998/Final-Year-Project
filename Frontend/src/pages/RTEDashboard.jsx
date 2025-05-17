import React from "react";
import RTEDetails from "../components/RTEDetails";
import DashboardMenu from "../components/DashboardMenu";

const RTEDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardMenu />
      <div className="flex-1 overflow-auto">
        <RTEDetails />
      </div>
    </div>
  );
};

export default RTEDashboard;
