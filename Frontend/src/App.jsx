import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentsDashboard from "./pages/StudentsDashboard"; // Import Students page
import PrivateRoute from "./components/PrivateRoute";
import ScheduleDashboard from "./pages/ScheduleDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import RegisterTeacherDashboard from "./pages/RegisterTeacherDashboard";
import TimeDashboard from "./pages/TimeDashboard";
import RegisterStudentDashboard from "./pages/RegisterStudentDashboard";
import AddClassroomDashboard from "./pages/AddClassroomDashboard";
import ProfilePage from "./pages/ProfilePage";
import ClassroomRequests from "./pages/ClassroomRequests";
import TeacherDataDashboard from "./pages/TeacherDataDashboard";
import MeetingRequest from "./components/MeetingRequest";
import TeacherViewToggle from "./components/TeacherViewToggle";
import TeacherViewDashboard from "./pages/TeacherViewDashboard";
import RegisterRTE from "./pages/RegisterRTE";
import RTEDashboard from "./pages/RTEDashboard";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
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
        path="/teachers/list"
        element={
          <PrivateRoute>
            <TeacherViewDashboard />
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
            <RegisterTeacherDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/teachers/details"
        element={
          <PrivateRoute>
            <TeacherDataDashboard />
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
      <Route path="/schedule/allocate-groups" element={<ScheduleDashboard />} />
      <Route path="/users/register-rte" element={<RegisterRTE />} />
      <Route path="/users/rte-details" element={<RTEDashboard />} />
      <Route path="/schedule/allocate-time" element={<TimeDashboard />} />
      <Route path="/requests/classroom" element={<ClassroomRequests />} />
      <Route path="/teacher-locator" element={<TeacherViewToggle />} />
      <Route
        path="/dashboard/addclassroom"
        element={<AddClassroomDashboard />}
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/meeting-requests/view"
        element={
          <PrivateRoute>
            <MeetingRequest />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
