import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import OfferFeed from './pages/OfferFeed';
import OfferDetail from './pages/OfferDetail';
import MyOffers from './pages/MyOffers';
import MyCashback from './pages/MyCashback';
import TransactionHistory from './pages/TransactionHistory';

const App: React.FC = () => (
  <BrowserRouter>
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
  </BrowserRouter>
);

export default App;
