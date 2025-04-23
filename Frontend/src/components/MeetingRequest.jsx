import React from "react";
import DashboardMenu from "./DashboardMenu";
import ViewMeetingRequests from "./ViewMeetingRequests";

const MeetingRequest = () => {
  return (
    <div className="flex">
      <div>
        <DashboardMenu />
      </div>
      <div>
        <ViewMeetingRequests />
      </div>
    </div>
  );
};

export default MeetingRequest;
