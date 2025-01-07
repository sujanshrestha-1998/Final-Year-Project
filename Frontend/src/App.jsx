import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdministrationLogin from "./pages/AdministrationLogin";
import Dashboard from "./pages/Dashboard";
import StudentsDashboard from "./pages/StudentsDashboard"; // Import Students page
import PrivateRoute from "./components/PrivateRoute";
import RegisterStudent from "./pages/RegisterStudent";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/administration" element={<AdministrationLogin />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
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
          path="/registration"
          element={
            <PrivateRoute>
              <RegisterStudent />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
