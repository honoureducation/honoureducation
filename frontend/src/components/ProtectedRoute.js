import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children, requireAdmin = false, requireApprovedTeacher = false }) {
  const location = useLocation();
  
  // Determine target role for authentication check
  const targetRole = requireAdmin ? 'admin' : (requireApprovedTeacher ? 'teacher' : null);
  
  // Check if user is authenticated for the required role
  if (!authService.isAuthenticated(targetRole)) {
    const loginPath = requireAdmin ? '/admin' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  const user = authService.getCurrentUser(targetRole);

  // Check admin requirement
  if (requireAdmin && !authService.isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check approved teacher requirement - NO LONGER allows admin bypass for "total separation"
  if (requireApprovedTeacher && !authService.isApprovedTeacher()) {
    if (user?.role === 'teacher' && user?.status === 'pending') {
      return <Navigate to="/pending-approval" replace />;
    }
    if (user?.role === 'teacher' && user?.status === 'rejected') {
      return <Navigate to="/account-rejected" replace />;
    }
    if (user?.role === 'teacher' && user?.status === 'suspended') {
      return <Navigate to="/account-suspended" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Status pages for different account states
export function PendingApproval() {
  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Account Pending Approval</h1>
          <p className="text-slate-600 mb-6">
            Hello {user?.firstName}, your teacher account is currently under review. 
            You'll receive access to the assessment platform once an administrator approves your account.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => authService.logout()}
              className="btn-secondary w-full"
            >
              Sign Out
            </button>
            <p className="text-xs text-slate-500">
              This typically takes 1-2 business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountRejected() {
  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Account Not Approved</h1>
          <p className="text-slate-600 mb-4">
            Unfortunately, your teacher account application was not approved.
          </p>
          {user?.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Reason:</strong> {user.rejectionReason}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/register'}
              className="btn-primary w-full"
            >
              Apply Again
            </button>
            <button
              onClick={() => authService.logout()}
              className="btn-secondary w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountSuspended() {
  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Account Suspended</h1>
          <p className="text-slate-600 mb-4">
            Your account has been temporarily suspended. Please contact the administrator for more information.
          </p>
          {user?.rejectionReason && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-800">
                <strong>Reason:</strong> {user.rejectionReason}
              </p>
            </div>
          )}
          <button
            onClick={() => authService.logout()}
            className="btn-secondary w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-6">
            You don't have permission to access this page.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="btn-primary w-full"
            >
              Go Back
            </button>
            <button
              onClick={() => authService.logout()}
              className="btn-secondary w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}