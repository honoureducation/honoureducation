import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute, { PendingApproval, AccountRejected, AccountSuspended, Unauthorized } from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import AssessmentSelector from './pages/AssessmentSelector';
import AssessmentForm from './pages/AssessmentForm';
import ListeningAssessmentForm from './pages/ListeningAssessmentForm';
import ListeningAssessmentPart2Form from './pages/ListeningAssessmentPart2Form';
import ListeningAssessmentPart2Selector from './pages/ListeningAssessmentPart2Selector';
import ListeningAssessmentSelector from './pages/ListeningAssessmentSelector';
import SpeakingAssessmentSelector from './pages/SpeakingAssessmentSelector';
import SpeakingAssessmentForm from './pages/SpeakingAssessmentForm';
import SpeakingAssessmentSeniorForm from './pages/SpeakingAssessmentSeniorForm';
import ReadingAssessmentSelector from './pages/ReadingAssessmentSelector';
import ReadingAssessmentForm from './pages/ReadingAssessmentForm';
import ReadingAssessmentSeniorForm from './pages/ReadingAssessmentSeniorForm';
import WritingAssessmentSelector from './pages/WritingAssessmentSelector';
import WritingAssessmentForm from './pages/WritingAssessmentForm';
import WritingAssessmentJuniorStudentSheet from './pages/WritingAssessmentJuniorStudentSheet';
import WritingAssessmentSeniorForm from './pages/WritingAssessmentSeniorForm';
import WritingAssessmentSeniorStudentSheet from './pages/WritingAssessmentSeniorStudentSheet';
import AssessmentList from './pages/AssessmentList';
import Profile from './pages/Profile';
import SetPassword from './pages/SetPassword';
import './index.css';

// Scroll to top on route change
function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {!isAdminPath && <Navbar />}
      <div className="flex-grow">
        {children}
      </div>
      {!isAdminPath && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <LayoutWrapper>
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/set-password/:token" element={<SetPassword />} />
            
            {/* Account Status Routes */}
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/account-rejected" element={<AccountRejected />} />
            <Route path="/account-suspended" element={<AccountSuspended />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Admin Login Route */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />

            {/* Assessment Routes - Require Approved Teacher */}
            <Route path="/assessments" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <AssessmentSelector />
              </ProtectedRoute>
            } />
            <Route path="/assessment/eal-ell" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <AssessmentForm />
              </ProtectedRoute>
            } />
            
            {/* Listening Assessments */}
            <Route path="/assessment/listening" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <ListeningAssessmentSelector />
              </ProtectedRoute>
            } />
            <Route path="/assessment/listening/part1" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <ListeningAssessmentForm />
              </ProtectedRoute>
            } />
            <Route path="/assessment/listening-part2" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <ListeningAssessmentPart2Selector />
              </ProtectedRoute>
            } />
            <Route path="/assessment/listening-part2/junior" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <ListeningAssessmentPart2Form yearGroupProp="junior" />
              </ProtectedRoute>
            } />
            <Route path="/assessment/listening-part2/senior" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <ListeningAssessmentPart2Form yearGroupProp="senior" />
              </ProtectedRoute>
            } />
            
            {/* Speaking Assessments */}
            <Route path="/assessment/speaking" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <SpeakingAssessmentSelector />
              </ProtectedRoute>
            } />
            <Route path="/assessment/speaking/junior" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <SpeakingAssessmentForm />
              </ProtectedRoute>
            } />
            <Route path="/assessment/speaking/senior" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <SpeakingAssessmentSeniorForm />
              </ProtectedRoute>
            } />
            
            {/* Reading Assessments */}
            <Route path="/assessment/reading" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <ReadingAssessmentSelector />
              </ProtectedRoute>
            } />
            <Route path="/assessment/reading/junior" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <ReadingAssessmentForm />
              </ProtectedRoute>
            } />
            <Route path="/assessment/reading/senior" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <ReadingAssessmentSeniorForm />
              </ProtectedRoute>
            } />
            
            {/* Writing Assessments */}
            <Route path="/assessment/writing" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <WritingAssessmentSelector />
              </ProtectedRoute>
            } />
            <Route path="/assessment/writing/junior" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <WritingAssessmentForm />
              </ProtectedRoute>
            } />
            <Route path="/assessment/writing/junior-student" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <WritingAssessmentJuniorStudentSheet />
              </ProtectedRoute>
            } />
            <Route path="/assessment/writing/senior" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <WritingAssessmentSeniorForm />
              </ProtectedRoute>
            } />
            <Route path="/assessment/writing/senior-student" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <WritingAssessmentSeniorStudentSheet />
              </ProtectedRoute>
            } />

            {/* Records Routes */}
            <Route path="/records" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <AssessmentList />
              </ProtectedRoute>
            } />
            <Route path="/list" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <AssessmentList />
              </ProtectedRoute>
            } />

            {/* Legacy Routes */}
            <Route path="/form" element={
              <ProtectedRoute requireApprovedTeacher={true}>
                <AssessmentForm />
              </ProtectedRoute>
            } />
          </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
