import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TrafficProvider } from './context/TrafficContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SystemStatus } from './pages/SystemStatus';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TrafficProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/status" element={
                <ProtectedRoute>
                  <SystemStatus />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </TrafficProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
