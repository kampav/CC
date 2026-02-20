import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import OfferList from './pages/OfferList';
import CreateOffer from './pages/CreateOffer';
import EditOffer from './pages/EditOffer';
import OfferDetail from './pages/OfferDetail';
import PartnerProfile from './pages/PartnerProfile';
import TransactionHistory from './pages/TransactionHistory';

const App: React.FC = () => (
  <BrowserRouter>
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
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default App;
