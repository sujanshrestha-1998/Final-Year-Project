import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdministrationLogin from "./pages/AdministrationLogin";
import Dashboard from "./pages/Dashboard";
import StudentsDashboard from "./pages/StudentsDashboard"; // Import Students page
import PrivateRoute from "./components/PrivateRoute";
import ScheduleDashboard from "./pages/ScheduleDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import RegisterTeacher from "./pages/RegisterTeacher";
import TimeDashboard from "./pages/TimeDashboard";
import RegisterStudentDashboard from "./pages/RegisterStudentDashboard";

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
              <RegisterStudentDashboard />
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
        <Route
          path="/schedule/allocate-groups"
          element={<ScheduleDashboard />}
        />
        <Route path="/schedule/allocate-time" element={<TimeDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
