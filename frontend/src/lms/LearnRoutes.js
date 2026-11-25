// All learner-facing course store pages live under /learn/*.
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LearnerProvider } from './LearnerContext';
import { LearnSubnav, RequireLearner } from './components';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import { LearnerLogin, LearnerRegister, LearnerForgotPassword, LearnerResetPassword } from './pages/AuthPages';
import MyCourses from './pages/MyCourses';
import CoursePlayer from './pages/CoursePlayer';
import MyOrders from './pages/MyOrders';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Account from './pages/Account';

export default function LearnRoutes() {
  return (
    <LearnerProvider>
      <LearnSubnav />
      <Routes>
        <Route index element={<Catalog />} />
        <Route path="courses/:slug" element={<CourseDetail />} />
        <Route path="login" element={<LearnerLogin />} />
        <Route path="register" element={<LearnerRegister />} />
        <Route path="forgot-password" element={<LearnerForgotPassword />} />
        <Route path="reset-password/:token" element={<LearnerResetPassword />} />
        <Route path="my-courses" element={<RequireLearner><MyCourses /></RequireLearner>} />
        <Route path="my-courses/:slug" element={<RequireLearner><CoursePlayer /></RequireLearner>} />
        <Route path="orders" element={<RequireLearner><MyOrders /></RequireLearner>} />
        <Route path="account" element={<RequireLearner><Account /></RequireLearner>} />
        <Route path="checkout/success" element={<RequireLearner><CheckoutSuccess /></RequireLearner>} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </LearnerProvider>
  );
}
