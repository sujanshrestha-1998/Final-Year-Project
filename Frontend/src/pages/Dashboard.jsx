import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import Classroom from "../components/Classroom";

const Dashboard = () => {
  return (
    <div>
      <div className="w-full h-10  ">
        <DashboardMenu />
      </div>
      <div>
        <Classroom />
      </div>
    </div>
  );
};

export default Dashboard;
