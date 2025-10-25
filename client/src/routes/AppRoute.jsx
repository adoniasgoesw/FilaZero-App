import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import Historic from '../pages/Historic';
import Kitchen from '../pages/Kitchen';
import Delivery from '../pages/Delivery';
import Config from '../pages/Config';
import Clients from '../pages/gestao/Clients';
import Users from '../pages/gestao/Users';
import Payments from '../pages/gestao/Payments';
import Categories from '../pages/gestao/Categories';
import Products from '../pages/gestao/Products';
import Caixas from '../pages/gestao/Caixas';
import PontoAtendimento from '../pages/gestao/PontoAtendimento';

const AppRoute = () => {
  return (
    <Router>
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Landing />} />
          <Route path="/register" element={<Landing />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/historic" element={<Historic />} />
          <Route path="/kitchen" element={<Kitchen />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/config" element={<Config />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/users" element={<Users />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/caixas" element={<Caixas />} />
          <Route path="/ponto-atendimento/:id" element={<PontoAtendimento />} />
        </Routes>
      </ProtectedRoute>
    </Router>
  );
};

export default AppRoute;