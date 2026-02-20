import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import OfferList from './pages/OfferList';
import CreateOffer from './pages/CreateOffer';
import EditOffer from './pages/EditOffer';
import OfferDetail from './pages/OfferDetail';
import PartnerProfile from './pages/PartnerProfile';
import TransactionHistory from './pages/TransactionHistory';
import AIOfferSuggestions from './pages/AIOfferSuggestions';

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
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/offers" element={<OfferList />} />
                <Route path="/offers/new" element={<CreateOffer />} />
                <Route path="/offers/:id/edit" element={<EditOffer />} />
                <Route path="/offers/:id" element={<OfferDetail />} />
                <Route path="/partners" element={<PartnerProfile />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/ai-suggestions" element={<AIOfferSuggestions />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
