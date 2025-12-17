import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MedicalRecords from './pages/MedicalRecords';
import MedicationTracker from './pages/MedicationTracker';
import SmartSummary from './pages/SmartSummary';
import Reminders from './pages/Reminders';
import LifestyleTips from './pages/LifestyleTips';
import EmergencyInfo from './pages/EmergencyInfo';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import CommunityLayout from './components/CommunityLayout';
import Landing from './pages/Landing';
import { AnimatePresence } from 'framer-motion';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Settings from './pages/Settings';
import AppointmentManager from './pages/AppointmentManager';
import SymptomLog from './pages/SymptomLog';
import FoodJournal from './pages/FoodJournal';
import Community from './pages/Community';
import FamilyAccess from './pages/FamilyAccess';
import FindCare from './pages/FindCare';
import AfterVisitSummary from './pages/AfterVisitSummary';

// New page imports
import TestResults from './pages/TestResults';
import HealthSummary from './pages/HealthSummary';
import PreventiveCare from './pages/PreventiveCare';
import PlanOfCare from './pages/PlanOfCare';
import HealthTrends from './pages/HealthTrends';
import GrowthCharts from './pages/GrowthCharts';
import Questionnaires from './pages/Questionnaires';
import SymptomChecker from './pages/SymptomChecker';
import AuthCallback from './pages/AuthCallback';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Save the intended path to sessionStorage for a more reliable redirect after login.
    sessionStorage.setItem('redirectPath', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/emergency/:id" element={<EmergencyInfo />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Dashboard Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<MedicalRecords />} />
          <Route path="/medications" element={<MedicationTracker />} />
          <Route path="/symptoms" element={<SymptomLog />} />
          <Route path="/food-journal" element={<FoodJournal />} />
          <Route path="/summary" element={<SmartSummary />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/appointments" element={<AppointmentManager />} />
          <Route path="/appointments/:id/summary" element={<AfterVisitSummary />} />
          <Route path="/tips" element={<LifestyleTips />} />
          <Route path="/family-access" element={<FamilyAccess />} />
          <Route path="/find-care" element={<FindCare />} />
          <Route path="/settings" element={<Settings />} />

          {/* New Routes */}
          <Route path="/test-results" element={<TestResults />} />
          <Route path="/health-summary" element={<HealthSummary />} />
          <Route path="/preventive-care" element={<PreventiveCare />} />
          <Route path="/plan-of-care" element={<PlanOfCare />} />
          <Route path="/health-trends" element={<HealthTrends />} />
          <Route path="/growth-charts" element={<GrowthCharts />} />
          <Route path="/questionnaires" element={<Questionnaires />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
        </Route>

        {/* Community Protected Route */}
        <Route
          element={
            <ProtectedRoute>
              <CommunityLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/community" element={<Community />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;