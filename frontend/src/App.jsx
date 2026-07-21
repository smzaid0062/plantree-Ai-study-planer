import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import MyPlan from "./pages/MyPlan";
import Topics from "./pages/Topics";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import StudySessions from "./pages/StudySessions";
import CalendarPage from "./pages/Calendar";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
      <Route path="/plan" element={<ProtectedRoute><MyPlan /></ProtectedRoute>} />
      <Route path="/topics" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><StudySessions /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/quiz/:subjectId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;