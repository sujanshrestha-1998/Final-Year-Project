import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import RegisterRTEPage from "../components/RegisterRTEPage";

const RegisterRTE = () => {
  return (
    <div className="flex">
      <div>
        <DashboardMenu />
      </div>
      <div>
        <RegisterRTEPage />
      </div>
    </div>
  );
};

export default RegisterRTE;
