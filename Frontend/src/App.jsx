import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdministrationLogin from "./pages/AdministrationLogin";
import Dashboard from "./pages/Dashboard";
import StudentsDashboard from "./pages/StudentsDashboard"; // Import Students page
import PrivateRoute from "./components/PrivateRoute";
import RegisterStudent from "./pages/RegisterStudent";
import ScheduleDashboard from "./pages/ScheduleDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import RegisterTeacher from "./pages/RegisterTeacher";
import AllocateGroup from "./components/AllocateGroup";
import AllocateTime from "./components/AllocateTime";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/administration" element={<AdministrationLogin />} /> */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <PrivateRoute>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/students"
          element={
            <PrivateRoute>
              <StudentsDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/register"
          element={
            <PrivateRoute>
              <RegisterStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/teachers/register"
          element={
            <PrivateRoute>
              <RegisterTeacher />
            </PrivateRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <PrivateRoute>
              <ScheduleDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/allocate-groups" element={<AllocateGroup />} />
        <Route path="/allocate-time" element={<AllocateTime />} />
      </Routes>
    </Router>
  );
};

export default App;
