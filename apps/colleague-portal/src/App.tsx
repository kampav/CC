import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OfferReview from './pages/OfferReview';
import MerchantOnboarding from './pages/MerchantOnboarding';
import CampaignManagement from './pages/CampaignManagement';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import Compliance from './pages/Compliance';
import CommercialOnboarding from './pages/CommercialOnboarding';
import CustomerInsights from './pages/CustomerInsights';
import ExecDashboard from './pages/ExecDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/offer-review" element={<OfferReview />} />
                <Route path="/merchant-onboarding" element={<MerchantOnboarding />} />
                <Route path="/campaigns" element={<CampaignManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/audit" element={<AuditLog />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/commercial-onboarding" element={<CommercialOnboarding />} />
                <Route path="/customer-insights" element={<CustomerInsights />} />
                <Route path="/exec-dashboard" element={<ExecDashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
