import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OfferReview from './pages/OfferReview';
import MerchantOnboarding from './pages/MerchantOnboarding';
import CampaignManagement from './pages/CampaignManagement';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import Compliance from './pages/Compliance';

const App: React.FC = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/offer-review" element={<OfferReview />} />
        <Route path="/merchant-onboarding" element={<MerchantOnboarding />} />
        <Route path="/campaigns" element={<CampaignManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audit" element={<AuditLog />} />
        <Route path="/compliance" element={<Compliance />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default App;
