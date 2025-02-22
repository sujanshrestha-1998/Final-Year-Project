import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import RegisterStudent from "./RegisterStudent";
const RegisterStudentDashboard = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 h-full overflow-hidden">
        <DashboardMenu />
      </div>
      <div className="flex-grow overflow-auto">
        <RegisterStudent />
      </div>
    </div>
  );
};

export default RegisterStudentDashboard;
