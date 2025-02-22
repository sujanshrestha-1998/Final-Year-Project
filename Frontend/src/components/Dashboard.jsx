import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Dashboard = () => {
  return (
    <div className="flex">
      {/* Sidebar Menu */}
      <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <ul className="space-y-4">
          <li>
            <Link
              to="/allocate-groups"
              className="block p-2 rounded hover:bg-gray-700"
            >
              Allocate Groups
            </Link>
          </li>
          <li>
            <Link
              to="/allocate-time"
              className="block p-2 rounded hover:bg-gray-700"
            >
              Allocate Time
            </Link>
          </li>
          <li>
            <Link
              to="/view-schedule"
              className="block p-2 rounded hover:bg-gray-700"
            >
              View Schedule
            </Link>
          </li>
          {/* Add more menu items as needed */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow p-6">
        {/* Here you can render the main content based on the selected menu item */}
        <h1 className="text-3xl font-semibold">Welcome to the Dashboard</h1>
        {/* Add your main content here */}
      </div>
    </div>
  );
};

export default Dashboard;
