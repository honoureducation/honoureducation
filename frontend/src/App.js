import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
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
import './index.css';

// Scroll to top on route change
function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
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
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/assessments" element={<AssessmentSelector />} />
            <Route path="/assessment/eal-ell" element={<AssessmentForm />} />
            <Route path="/assessment/listening" element={<ListeningAssessmentSelector />} />
            <Route path="/assessment/listening/part1" element={<ListeningAssessmentForm />} />
            <Route path="/assessment/listening-part2" element={<ListeningAssessmentPart2Selector />} />
            <Route path="/assessment/listening-part2/junior" element={<ListeningAssessmentPart2Form yearGroupProp="junior" />} />
            <Route path="/assessment/listening-part2/senior" element={<ListeningAssessmentPart2Form yearGroupProp="senior" />} />
            <Route path="/assessment/speaking" element={<SpeakingAssessmentSelector />} />
            <Route path="/assessment/speaking/junior" element={<SpeakingAssessmentForm />} />
            <Route path="/assessment/speaking/senior" element={<SpeakingAssessmentSeniorForm />} />
            <Route path="/assessment/reading" element={<ReadingAssessmentSelector />} />
            <Route path="/assessment/reading/junior" element={<ReadingAssessmentForm />} />
            <Route path="/assessment/reading/senior" element={<ReadingAssessmentSeniorForm />} />
            <Route path="/assessment/writing" element={<WritingAssessmentSelector />} />
            <Route path="/assessment/writing/junior" element={<WritingAssessmentForm />} />
            <Route path="/assessment/writing/junior-student" element={<WritingAssessmentJuniorStudentSheet />} />
            <Route path="/assessment/writing/senior" element={<WritingAssessmentSeniorForm />} />
            <Route path="/assessment/writing/senior-student" element={<WritingAssessmentSeniorStudentSheet />} />
            <Route path="/form" element={<AssessmentForm />} />
            <Route path="/records" element={<AssessmentList />} />
            <Route path="/list" element={<AssessmentList />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
