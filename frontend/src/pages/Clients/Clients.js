import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientList from './ClientList';
import ClientForm from './ClientForm';
import ClientDetail from './ClientDetail';

const Clients = () => {
  return (
    <Routes>
      <Route index element={<ClientList />} />
      <Route path="new" element={<ClientForm />} />
      <Route path=":id" element={<ClientDetail />} />
      <Route path=":id/edit" element={<ClientForm />} />
      <Route path="*" element={<Navigate to="/clients" replace />} />
    </Routes>
  );
};

export default Clients;