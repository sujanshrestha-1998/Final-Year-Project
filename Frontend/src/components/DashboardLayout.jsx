import React from "react";
import DashboardMenu from "./DashboardMenu";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardMenu />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default DashboardLayout;
