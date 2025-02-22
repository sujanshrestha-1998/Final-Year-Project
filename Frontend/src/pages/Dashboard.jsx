import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import Classroom from "../components/Classroom";

const Dashboard = () => {
  return (
    <div className="flex">
      <div className="">
        <DashboardMenu />
      </div>
      <div>
        <Classroom />
      </div>
    </div>
  );
};

export default Dashboard;
