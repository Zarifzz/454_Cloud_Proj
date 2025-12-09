import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ElectronLandingPage from './components/landingpage';
import Login from './components/login';
import AdminDashboard from './components/adminDashboard';
import TeacherDashboard from './components/teacherDashboard';
import StudentDashboard from './components/studentDashboard';
import TakeTest from './components/submitTest';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ElectronLandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/test/:testId" element={<TakeTest />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}
