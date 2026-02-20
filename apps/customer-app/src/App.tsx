import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import OfferFeed from './pages/OfferFeed';
import OfferDetail from './pages/OfferDetail';
import MyOffers from './pages/MyOffers';
import MyCashback from './pages/MyCashback';
import TransactionHistory from './pages/TransactionHistory';

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
                <Route path="/browse" element={<OfferFeed />} />
                <Route path="/offers/:id" element={<OfferDetail />} />
                <Route path="/my-offers" element={<MyOffers />} />
                <Route path="/cashback" element={<MyCashback />} />
                <Route path="/transactions" element={<TransactionHistory />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
