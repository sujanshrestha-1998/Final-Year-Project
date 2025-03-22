import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import Requests from "../components/Requests";

const ClassroomRequests = () => {
  return (
    <div className="flex">
      <div className="">
        <DashboardMenu />
      </div>
      <div>
        <Requests />
      </div>
    </div>
  );
};

export default ClassroomRequests;
